const API_URL = 'http://localhost:3333';

export async function registrarUsuario(dadosUsuario) {
    try {
        const response = await fetch(`${API_URL}/registrar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosUsuario)
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || `Erro no servidor (Status: ${response.status})`);
        }

        return data;
    } catch (erro) {
        console.error("Falha ao enviar:", erro);
        throw erro;
    }
}

export async function fazerLogin(dadosLogin) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(dadosLogin)
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || 'Falha ao realizar login.');
        }

        return data;
    } catch (erro) {
        console.error("Falha ao realizar login:", erro);
        throw erro;
    }
}

export async function verificar2FA(code) {
    const response = await fetch(`${API_URL}/login/2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(data.error || 'Código inválido.');
    return data;
}

export async function reenviarCodigo2FA() {
    const response = await fetch(`${API_URL}/login/2fa/reenviar`, {
        method: 'POST',
        credentials: 'include'
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(data.error || 'Não foi possível reenviar o código.');
    return data;
}

export async function iniciarSms2FA(phone, password) {
    const response = await fetch(`${API_URL}/2fa/sms/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone, password })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(data.error || 'Não foi possível enviar o SMS.');
    return data;
}

export async function ativarSms2FA(code) {
    const response = await fetch(`${API_URL}/2fa/sms/enable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(data.error || 'Código inválido.');
    return data;
}

export async function iniciarConfiguracao2FA() {
    const response = await fetch(`${API_URL}/2fa/setup`, {
        method: 'POST',
        credentials: 'include'
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(data.error || 'Erro ao configurar o 2FA.');
    return data;
}

export async function ativar2FA(code) {
    const response = await fetch(`${API_URL}/2fa/enable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(data.error || 'Código inválido.');
    return data;
}