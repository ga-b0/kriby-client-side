const API_URL = 'http://127.0.0.1:8000/api/auth/login';

const form = document.querySelector('.main__form');
const loginButton = document.querySelector('.main__form__button');
const nameInput = document.querySelector('#name');
const passwordInput = document.querySelectorAll('.main__form__input')[1];

let isLoading = false;

function setLoading(loading) {
    isLoading = loading;
    loginButton.disabled = loading; 
    loginButton.textContent = loading ? 'Loading...' : 'Login';
}

async function loginUser(name, password) {
    setLoading(true);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, password })
        });

        if (!response.ok) {
            throw new Error('The user or password is incorrect, please check your credentials.');
        }

        const data = await response.json();
        localStorage.setItem('token', data.access_token); 
        localStorage.setItem('user_name', data.user_name || name); 

        window.location.href = '/pages/game.html';
    } catch (error) {
        alert(error.message);
    } finally {
        setLoading(false);
    }
}

form.addEventListener('submit', (event) => {
    event.preventDefault(); 

    const name = nameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!name || !password) {
        alert('Both fields are required.');
        return;
    }

    loginUser(name, password);
});
