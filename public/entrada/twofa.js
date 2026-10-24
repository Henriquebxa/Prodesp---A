
import {
    iniciarConfiguracao2FA,
    ativar2FA,
    iniciarSms2FA,
    ativarSms2FA
} from '../api/api.js';

const API_URL = 'http://localhost:3333';
const $ = (id) => document.getElementById(id);

function mostrar(titulo, html) {
    $('twofa-title').textContent = titulo;
    $('twofa-body').innerHTML = html;
}

function fechar() {
    $('twofa-backdrop').classList.remove('active');
}

const FORM_CODIGO = (rotulo) => `
    <form id="twofa-code-form">
        <label class="form-label" for="twofa-code">${rotulo}</label>
        <input class="ui-input" id="twofa-code" inputmode="numeric" maxlength="6"
               autocomplete="one-time-code" required>
        <p class="twofa-text twofa-erro" id="twofa-msg"></p>
        <div class="twofa-actions">
            <button type="button" class="ui-button ui-button-outline" id="twofa-cancelar">Cancelar</button>
            <button type="submit" class="ui-button ui-button-default" id="twofa-ativar">Ativar</button>
        </div>
    </form>
`;

function ligarFormCodigo(aoConfirmar, metodo) {
    $('twofa-cancelar').addEventListener('click', fechar);

    $('twofa-code-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const code = $('twofa-code').value.replace(/\D/g, '');
        const msg = $('twofa-msg');
        const botao = $('twofa-ativar');

        if (code.length !== 6) {
            msg.textContent = 'Digite os 6 dígitos do código.';
            return;
        }

        botao.disabled = true;
        msg.textContent = '';

        try {
            await aoConfirmar(code);
            telaSucesso(metodo);
        } catch (erro) {
            msg.textContent = erro.message;
            botao.disabled = false;
            $('twofa-code').select();
        }
    });

    $('twofa-code').focus();
}


function telaErro(mensagem) {
    mostrar('Verificação em duas etapas', `
        <p class="twofa-text twofa-erro" id="twofa-erro-msg"></p>
        <div class="twofa-actions">
            <button type="button" class="ui-button ui-button-outline" id="twofa-fechar">Fechar</button>
        </div>
    `);
    $('twofa-erro-msg').textContent = mensagem;
    $('twofa-fechar').addEventListener('click', fechar);
}

function telaEscolha() {
    mostrar('Verificação em duas etapas', `
        <p class="twofa-text">Escolha como você quer receber o código de verificação ao entrar.</p>
        <button type="button" class="ui-button ui-button-default" id="twofa-app"
                style="width:100%;margin-bottom:8px;">Aplicativo autenticador (recomendado)</button>
        <button type="button" class="ui-button ui-button-outline" id="twofa-sms"
                style="width:100%;">Mensagem de texto (SMS)</button>
        <p class="twofa-text" style="margin-top:12px;">
            O aplicativo é mais seguro e funciona sem sinal de celular.
            O SMS é mais simples, mas pode ser interceptado.
        </p>
        <div class="twofa-actions">
            <button type="button" class="ui-button ui-button-outline" id="twofa-fechar">Cancelar</button>
        </div>
    `);
    $('twofa-fechar').addEventListener('click', fechar);
    $('twofa-app').addEventListener('click', iniciarApp);
    $('twofa-sms').addEventListener('click', telaSmsDados);
}

function telaAtivo(metodo) {
    const como = metodo === 'sms' ? 'por SMS' : 'por aplicativo autenticador';

    mostrar('Verificação em duas etapas', `
        <p class="twofa-text twofa-ok">A verificação em duas etapas está ativada (${como}).</p>
        <div class="twofa-actions">
            <button type="button" class="ui-button ui-button-outline" id="twofa-fechar">Fechar</button>
        </div>
    `);
    $('twofa-fechar').addEventListener('click', fechar);
}

function telaQr({ qr, secret }) {
    mostrar('Escaneie o QR code', `
        <p class="twofa-text">1. Abra o aplicativo autenticador e escaneie o QR code.</p>
        <div class="twofa-qr"><img id="twofa-qr-img" alt="QR code do autenticador"></div>
        <p class="twofa-text">Se não conseguir escanear, digite esta chave no aplicativo:</p>
        <code class="twofa-secret" id="twofa-secret"></code>
        ${FORM_CODIGO('2. Digite o código de 6 dígitos que o aplicativo mostra')}
    `);

    // Valores do servidor entram por propriedade, não por texto HTML
    $('twofa-qr-img').src = qr;
    $('twofa-secret').textContent = secret;

    ligarFormCodigo(ativar2FA, 'totp');
}

function telaSmsDados() {
    mostrar('Verificação por SMS', `
        <form id="twofa-sms-form">
            <p class="twofa-text">Informe o celular que vai receber os códigos.</p>
            <label class="form-label" for="twofa-phone">Celular com DDD</label>
            <input class="ui-input" id="twofa-phone" type="tel" autocomplete="tel"
                   placeholder="(11) 91234-5678" required>
            <label class="form-label" for="twofa-senha" style="margin-top:12px;">Sua senha</label>
            <input class="ui-input" id="twofa-senha" type="password"
                   autocomplete="current-password" required>
            <p class="twofa-text twofa-erro" id="twofa-msg"></p>
            <div class="twofa-actions">
                <button type="button" class="ui-button ui-button-outline" id="twofa-voltar">Voltar</button>
                <button type="submit" class="ui-button ui-button-default" id="twofa-enviar">Enviar código</button>
            </div>
        </form>
    `);

    $('twofa-voltar').addEventListener('click', telaEscolha);
    $('twofa-phone').focus();

    $('twofa-sms-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const msg = $('twofa-msg');
        const botao = $('twofa-enviar');

        botao.disabled = true;
        msg.textContent = '';

        try {
            const dados = await iniciarSms2FA($('twofa-phone').value, $('twofa-senha').value);
            telaSmsCodigo(dados.destination);
        } catch (erro) {
            msg.textContent = erro.message;
            botao.disabled = false;
        }
    });
}

function telaSmsCodigo(destino) {
    mostrar('Confirme o código', `
        <p class="twofa-text" id="twofa-destino"></p>
        ${FORM_CODIGO('Código de 6 dígitos')}
    `);

    $('twofa-destino').textContent = `Enviamos um código por SMS para ${destino}. Ele vale por 5 minutos.`;

    ligarFormCodigo(ativarSms2FA, 'sms');
}

function telaSucesso(metodo) {
    const proximo = metodo === 'sms'
        ? 'o sistema enviará um código por SMS'
        : 'o sistema pedirá o código do aplicativo';

    mostrar('Tudo certo!', `
        <p class="twofa-text twofa-ok">
            Verificação em duas etapas ativada. No próximo login, ${proximo}.
        </p>
        <div class="twofa-actions">
            <button type="button" class="ui-button ui-button-default" id="twofa-fechar">Concluir</button>
        </div>
    `);
    $('twofa-fechar').addEventListener('click', fechar);
}


async function abrir() {
    $('twofa-backdrop').classList.add('active');
    mostrar('Verificação em duas etapas', '<p class="twofa-text">Carregando…</p>');

    try {
        const response = await fetch(`${API_URL}/2fa/status`, { credentials: 'include' });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || 'Não foi possível consultar o 2FA.');
        }

        data.enabled ? telaAtivo(data.method) : telaEscolha();
    } catch (erro) {
        telaErro(erro.message);
    }
}

async function iniciarApp() {
    mostrar('Verificação em duas etapas', '<p class="twofa-text">Gerando o QR code…</p>');

    try {
        telaQr(await iniciarConfiguracao2FA());
    } catch (erro) {
        telaErro(erro.message);
    }
}


window.abrirModal2FA = abrir;

document.addEventListener('DOMContentLoaded', () => {
    $('twofa-close')?.addEventListener('click', fechar);

    // Fecha ao clicar fora da caixa
    $('twofa-backdrop')?.addEventListener('click', (e) => {
        if (e.target.id === 'twofa-backdrop') fechar();
    });
});