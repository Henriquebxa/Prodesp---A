import { fazerLogin } from './api.js';

document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const username = document.getElementById('username').value;
    const cpf = document.getElementById('cpf').value;
    const password = document.getElementById('password').value;

    try {
        const resultado = await fazerLogin({ username, cpf, password });
        
        alert(resultado.message || 'Login realizado com sucesso!');
        
        window.location.href = '../exemplo/exemplo.html'; 

    } catch (error) {
        alert(error.message);
    }
});