import { registrarUsuario } from './api.js';

document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const cpf = document.getElementById('cpf').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('As senhas não coincidem!');
        return;
    }

    try {
        await registrarUsuario({ username, cpf, password });
        
        alert('Usuário cadastrado com sucesso!');
        window.location.href = '../login/login.html';
    } catch (error) {
        alert(error.message);
    }
});