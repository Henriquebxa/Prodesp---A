import { fazerLogin } from './api.js';
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

    const isExcecao = username && USUARIOS_EXCECAO.some(
        u => u.toLowerCase() === String(username).trim().toLowerCase()
    );

    if (!isExcecao && !validarCPF(cpfBruto)) {
        alert('Por favor, informe um CPF válido.');
        cpfInput.focus();
        return;
    }

    const cpfLimpo = limparCPF(cpfBruto);

    try {
        const resultado = await fazerLogin({ username, cpf: cpfLimpo, password });
        
        alert(resultado.message || 'Login realizado com sucesso!');
        window.location.href = '../entrada/dashboard.html'; 

    } catch (error) {
        alert(error.message);
    }
});