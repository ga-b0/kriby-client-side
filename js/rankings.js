const API_URL = 'http://127.0.0.1:8000/api/users';


function fetchUser(){

    fetch(API_URL)
    .then(res => res.json())
    .then(data => console.log(data))

}

fetchUser();


