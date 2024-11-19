const API_URL = 'http://127.0.0.1:8000/api/users';

function fetchUsersAndRenderRankings() {
    const rankingContainer = document.querySelector('.main__ranking-container');
    rankingContainer.innerHTML = '';

    const loadingMessage = document.createElement('p');
    loadingMessage.textContent = 'Loading rankings...';
    rankingContainer.appendChild(loadingMessage);

    fetch(API_URL)
        .then(res => {
            if (!res.ok) {
                throw new Error('Failed to fetch rankings');
            }
            return res.json();
        })
        .then(data => {
            rankingContainer.innerHTML = '';

            const rankingSection = document.createElement('section');
            rankingSection.classList.add('main__ranking');

            const header = document.createElement('div');
            header.classList.add('main__header');
            header.innerHTML = `
                <span>User</span>
                <span>Score</span>
            `;
            rankingSection.appendChild(header);

            data.forEach(user => {
                const nameDiv = document.createElement('div');
                nameDiv.classList.add('main__name');
                nameDiv.textContent = user.name;

                const scoreDiv = document.createElement('div');
                scoreDiv.classList.add('main__score');
                scoreDiv.textContent = user.max_score;

                rankingSection.appendChild(nameDiv);
                rankingSection.appendChild(scoreDiv);
            });

            rankingContainer.appendChild(rankingSection);
        })
        .catch(error => {
            rankingContainer.innerHTML = `<p>Error fetching rankings: ${error.message}</p>`;
        });
}

fetchUsersAndRenderRankings();
