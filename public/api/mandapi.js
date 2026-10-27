import { registrarUsuario } from './api.js';
import { mascararDocumento, limparDocumento, validarDocumento } from './cpfUtils.js'; 

const cpfInput = document.getElementById('cpf');

if (cpfInput) {
    cpfInput.addEventListener('input', (e) => {
        e.target.value = mascararDocumento(e.target.value);  
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

    if (!isExcecao && !validarDocumento(cpfBruto)) {  
        alert('Por favor, digite um CPF ou CNPJ válido!');   
        cpfInput.focus();
        return;
    }

    const turnstileToken = document.querySelector('[name="cf-turnstile-response"]')?.value || '';

    if (!turnstileToken) {
        alert('Complete a verificação CAPTCHA antes de registrar.');
        return;
    }

    const cpfLimpo = limparDocumento(cpfBruto);  

    try {
        await registrarUsuario({ 
            username, 
            cpf: cpfLimpo, 
            password,
            'cf-turnstile-response': turnstileToken 
        });
        
        alert('Usuário cadastrado com sucesso!');
        window.location.href = '../login/login.html';
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