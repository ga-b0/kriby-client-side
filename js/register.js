const API_REGISTER_URL = 'http://127.0.0.1:8000/api/auth/users/create';

function enviarFormulario(event) {
    event.preventDefault(); 

    const formulario = document.getElementById('formulario');
    const usuario = formulario.elements['usuario'].value.trim();
    const clave = formulario.elements['clave'].value.trim();

    if (!usuario || !clave) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    const datos = {
        name: usuario,
        password: clave,
    };

    fetch(API_REGISTER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((errorData) => {
                    throw new Error(errorData.message || 'Error en el registro');
                });
            }
            return response.json();
        })
        .then((data) => {
            alert(`Usuario registrado con éxito: ${data.name}`);
            window.location.href = '/pages/game.html';
            formulario.reset(); 
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Hubo un problema al registrar el usuario. Verifica los datos e inténtalo nuevamente.');
        });
}
