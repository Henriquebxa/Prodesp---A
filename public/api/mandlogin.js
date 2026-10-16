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
        
        // Guarda o usuário (com o cargo vindo do servidor) para o dashboard montar o perfil
        localStorage.setItem('prodesp_user', JSON.stringify(resultado.user));

        alert(resultado.message || 'Login realizado com sucesso!');
        window.location.href = '../entrada/dashboard.html'; 

    } catch (error) {
        alert(error.message);
    }
});

export function setupPasswordToggle(toggleButtonId, passwordInputId) {
    const toggleBtn = document.getElementById(toggleButtonId);
    const passwordInput = document.getElementById(passwordInputId);

    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleBtn.innerHTML = '<img src="../imgs/Esconder_senha.png" alt="Esconder senha">'; 
            } else {
                passwordInput.type = 'password';
                toggleBtn.innerHTML = '<img src="../imgs/Mostrar_senha.png" alt="Mostrar senha">'; 
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupPasswordToggle('toggle-password', 'password');
    setupPasswordToggle('toggle-confirm-password', 'confirm-password');
});