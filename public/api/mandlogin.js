import { fazerLogin, verificar2FA, reenviarCodigo2FA } from './api.js';
import { mascararDocumento, limparDocumento, validarDocumento } from './cpfUtils.js';

const loginForm = document.getElementById('login-form');
const twofaForm = document.getElementById('twofa-form');
const cpfInput = document.getElementById('cpf');
const codeInput = document.getElementById('code');

if (cpfInput) {
    cpfInput.addEventListener('input', (e) => {
        e.target.value = mascararDocumento(e.target.value);
    });
}

const USUARIOS_EXCECAO = ['Prodespadmin'];

function mostrarEtapaLogin() {
    twofaForm.hidden = true;
    loginForm.hidden = false;
    codeInput.value = '';
    resetarCaptcha();
}

function mostrarEtapa2FA(resultado = {}) {
    const ehSms = resultado.method === 'sms';

    // O texto muda conforme o método da conta
    document.getElementById('twofa-label').textContent = ehSms
        ? `Código enviado por SMS para ${resultado.destination}:`
        : 'Código do aplicativo autenticador:';

    document.getElementById('twofa-reenviar').hidden = !ehSms;

    loginForm.hidden = true;
    twofaForm.hidden = false;
    codeInput.value = '';
    codeInput.focus();
}

// O token do Turnstile só vale para uma tentativa. Depois de qualquer
// resposta do servidor é preciso gerar outro.
function resetarCaptcha() {
    try {
        window.turnstile?.reset();
    } catch (e) {
        console.error(e);
    }
}

function concluirLogin(resultado) {
    // Guarda o usuário (com o cargo vindo do servidor) para o dashboard montar o perfil
    localStorage.setItem('prodesp_user', JSON.stringify(resultado.user));

    alert(resultado.message || 'Login realizado com sucesso!');
    window.location.href = '../entrada/dashboard.html';
}

// ── Etapa 1: usuário, CPF/CNPJ, senha e CAPTCHA ──
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const cpfBruto = cpfInput ? cpfInput.value : '';
    const password = document.getElementById('password').value;

    const isExcecao = username && USUARIOS_EXCECAO.some(
        u => u.toLowerCase() === String(username).trim().toLowerCase()
    );

    if (!isExcecao && !validarDocumento(cpfBruto)) {
        alert('Por favor, informe um CPF ou CNPJ válido.');
        cpfInput.focus();
        return;
    }

    // O Turnstile cria este campo escondido dentro do formulário
    const turnstileToken =
        loginForm.querySelector('[name="cf-turnstile-response"]')?.value || '';

    if (!turnstileToken) {
        alert('Complete a verificação CAPTCHA antes de entrar.');
        return;
    }

    const cpfLimpo = limparDocumento(cpfBruto);

    try {
        const resultado = await fazerLogin({
            username,
            cpf: cpfLimpo,
            password,
            'cf-turnstile-response': turnstileToken
        });

        // Senha correta, mas o usuário tem 2FA: pede o código
        if (resultado.requires2FA) {
            mostrarEtapa2FA(resultado);
            return;
        }

        concluirLogin(resultado);
    } catch (error) {
        alert(error.message);
        resetarCaptcha();
    }
});

// ── Etapa 2: código do aplicativo autenticador ──
twofaForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const code = codeInput.value.replace(/\D/g, '');

    if (code.length !== 6) {
        alert('Digite o código de 6 dígitos.');
        codeInput.focus();
        return;
    }

    try {
        const resultado = await verificar2FA(code);
        concluirLogin(resultado);
    } catch (error) {
        alert(error.message);

        // Sessão temporária expirou: volta para a primeira etapa
        if (/sess[ãa]o/i.test(error.message)) {
            mostrarEtapaLogin();
        } else {
            codeInput.value = '';
            codeInput.focus();
        }
    }
});

document.getElementById('twofa-voltar')?.addEventListener('click', mostrarEtapaLogin);

// Reenvio do SMS (o servidor limita a 1 por minuto)
document.getElementById('twofa-reenviar')?.addEventListener('click', async () => {
    try {
        await reenviarCodigo2FA();
        alert('Código reenviado por SMS.');
        codeInput.focus();
    } catch (error) {
        alert(error.message);

        if (/sess[ãa]o/i.test(error.message)) {
            mostrarEtapaLogin();
        }
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
});