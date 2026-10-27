
export function normalizarTelefoneBR(valor) {
    let digitos = String(valor ?? '').replace(/\D/g, '');

    if (digitos.length === 13 && digitos.startsWith('55')) {
        digitos = digitos.slice(2);
    }

    if (!/^[1-9]{2}9\d{8}$/.test(digitos)) {
        return null;
    }

    return `+55${digitos}`;
}

export function mascararTelefone(e164) {
    const telefone = String(e164 ?? '');
    return `(${telefone.slice(3, 5)}) *****-${telefone.slice(-4)}`;
}

export async function enviarSms(para, code) {
    const baseUrl = process.env.INFOBIP_BASE_URL?.replace(/\/+$/, '');
    const apiKey = process.env.INFOBIP_API_KEY;
    const sender = process.env.INFOBIP_SENDER;

    if (!baseUrl || !apiKey || !sender) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error(
                'Configure INFOBIP_BASE_URL, INFOBIP_API_KEY e INFOBIP_SENDER no .env.'
            );
        }

        console.log(`[DEV] SMS para ${mascararTelefone(para)}: código ${code}`);
        return { dev: true };
    }
    const telefone = String(para ?? '').replace(/\D/g, '');

    if (!/^55[1-9]{2}9\d{8}$/.test(telefone)) {
        throw new Error('Número de celular brasileiro inválido.');
    }

    if (!/^\d{6}$/.test(String(code))) {
        throw new Error('O código OTP deve conter 6 dígitos.');
    }

    const texto =
        `Prodesp: seu codigo de verificacao e ${code}. ` +
        'Vale por 5 minutos. Nao compartilhe com ninguem.';

    const resposta = await fetch(`${baseUrl}/sms/3/messages`, {
        method: 'POST',
        headers: {
            Authorization: `App ${apiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({
            messages: [
                {
                    sender,
                    destinations: [{ to: telefone }],
                    content: { text: texto }
                }
            ]
        }),
        signal: AbortSignal.timeout(10000)
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
        console.error('ERRO INFOBIP:', resposta.status, dados);
        throw new Error(
            `Falha no envio de SMS (Infobip HTTP ${resposta.status}).`
        );
    }

    const msg = dados?.messages?.[0];

    console.log(
        'Infobip:',
        msg?.messageId,
        msg?.status?.groupName,
        msg?.status?.name,
        msg?.status?.description
    );
    return dados;
}
