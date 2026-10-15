import { registrarUsuario } from './api.js';
import { mascararCPF, limparCPF, validarCPF } from './cpfUtils.js';

const cpfInput = document.getElementById('cpf');

if (cpfInput) {
    cpfInput.addEventListener('input', (e) => {
        e.target.value = mascararCPF(e.target.value);
    });
}

const USUARIOS_EXCECAO = ['Prodespadmin'];

document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const cpfBruto = cpfInput ? cpfInput.value : '';
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password')?.value;

    if (confirmPassword && password !== confirmPassword) {
        alert('As senhas não coincidem!');
        return;
    }

    const isExcecao = username && USUARIOS_EXCECAO.some(
        u => u.toLowerCase() === String(username).trim().toLowerCase()
    );

    if (!isExcecao && !validarCPF(cpfBruto)) {
        alert('Por favor, digite um CPF válido!');
        cpfInput.focus();
        return;
    }

    const cpfLimpo = limparCPF(cpfBruto);

    try {
        await registrarUsuario({ username, cpf: cpfLimpo, password });
        
        alert('Usuário cadastrado com sucesso!');
        window.location.href = '../login/login.html';
    } catch (error) {
        alert(error.message);
    }
});