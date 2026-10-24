// src/lib/otp.js
// Códigos de uso único (SMS): geração, validade, tentativas e intervalo entre envios.
import crypto from 'crypto';
import { prisma } from './prisma.js';

const TTL_MS = 5 * 60 * 1000;   // o código vale 5 minutos
const MAX_ATTEMPTS = 5;         // erros permitidos por código
const RESEND_MS = 60 * 1000;    // intervalo mínimo entre dois envios

// No banco fica só o hash do código, nunca o código em si.
function hashCode(code) {
    const key = process.env.OTP_HMAC_KEY;

    if (!key) {
        throw new Error('OTP_HMAC_KEY não configurada.');
    }

    return crypto.createHmac('sha256', key).update(String(code)).digest('hex');
}

export const gerarCodigo = () =>
    String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');

// Invalida os códigos ainda abertos (usado ao gerar um novo ou quando o envio falha).
export async function cancelarOtps(userId, purpose) {
    await prisma.otpCode.updateMany({
        where: { userId, purpose, usedAt: null },
        data: { usedAt: new Date() }
    });
}

// purpose: "login" (segunda etapa do login) ou "setup" (ativação do SMS).
// destination: telefone pendente (criptografado), só no "setup".
export async function criarOtp(userId, purpose, destination = null) {
    const ultimo = await prisma.otpCode.findFirst({
        where: { userId, purpose },
        orderBy: { createdAt: 'desc' }
    });

    // Código ainda aberto e enviado há menos de 1 minuto: não manda outro.
    if (
        ultimo &&
        !ultimo.usedAt &&
        Date.now() - ultimo.createdAt.getTime() < RESEND_MS
    ) {
        const erro = new Error('Aguarde antes de pedir outro código.');
        erro.code = 'RESEND_TOO_SOON';
        throw erro;
    }

    await cancelarOtps(userId, purpose);

    const code = gerarCodigo();

    await prisma.otpCode.create({
        data: {
            userId,
            purpose,
            codeHash: hashCode(code),
            destination,
            expiresAt: new Date(Date.now() + TTL_MS)
        }
    });

    return code; // vai por SMS; no banco fica só o hash
}

export async function verificarOtp(userId, code, purpose) {
    const otp = await prisma.otpCode.findFirst({
        where: {
            userId,
            purpose,
            usedAt: null,
            expiresAt: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
    });

    if (!otp) return { ok: false, reason: 'expirado' };

    if (otp.attempts >= MAX_ATTEMPTS) {
        await cancelarOtps(userId, purpose);
        return { ok: false, reason: 'tentativas' };
    }

    await prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } }
    });

    const enviado = Buffer.from(hashCode(String(code ?? '').trim()), 'hex');
    const salvo = Buffer.from(otp.codeHash, 'hex');

    if (enviado.length !== salvo.length || !crypto.timingSafeEqual(enviado, salvo)) {
        return { ok: false, reason: 'invalido' };
    }

    // Marca como usado só se ninguém usou antes (evita dois acessos com o mesmo código).
    const marcado = await prisma.otpCode.updateMany({
        where: { id: otp.id, usedAt: null },
        data: { usedAt: new Date() }
    });

    if (marcado.count !== 1) return { ok: false, reason: 'usado' };

    return { ok: true, destination: otp.destination };
}
