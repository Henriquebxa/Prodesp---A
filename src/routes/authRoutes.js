import 'dotenv/config';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { prisma } from '../lib/prisma.js';
import { encryptCPF, decryptCPF, encryptText, decryptText } from '../lib/cryptoUtils.js';
import { loginFailureLimiter } from '../middlewares/ratelimiter.js';
import { criarOtp, verificarOtp, cancelarOtps } from '../lib/otp.js';
import { enviarSms, normalizarTelefoneBR, mascararTelefone } from '../services/notify.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

console.log('authRoutes.js carregado com /2fa/status');

const router = Router();

const ADMIN_USERNAME = 'prodespadmin';
const USUARIOS_EXCECAO = ['Prodespadmin'];

const PRIVATE_KEY = process.env.JWT_PRIVATE_KEY
    ? String(process.env.JWT_PRIVATE_KEY).replace(/\\n/g, '\n')
    : undefined;

const PUBLIC_KEY = process.env.JWT_PUBLIC_KEY
    ? String(process.env.JWT_PUBLIC_KEY).replace(/\\n/g, '\n')
    : undefined;

const SIGN_KEY = process.env.JWT_KEY_PASSPHRASE
    ? { key: PRIVATE_KEY, passphrase: process.env.JWT_KEY_PASSPHRASE }
    : PRIVATE_KEY;

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000
};

const limparDoc = (valor) =>
    String(valor ?? '')
        .toUpperCase()
        .replace(/[^0-9A-Z]/g, '');

function validarCPF(cpf) {
    const c = String(cpf ?? '').replace(/\D/g, '');

    if (!/^\d{11}$/.test(c) || /^(\d)\1{10}$/.test(c)) {
        return false;
    }

    let soma = 0;

    for (let i = 0; i < 9; i++) {
        soma += Number(c[i]) * (10 - i);
    }

    let resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) {
        resto = 0;
    }

    if (resto !== Number(c[9])) {
        return false;
    }

    soma = 0;

    for (let i = 0; i < 10; i++) {
        soma += Number(c[i]) * (11 - i);
    }

    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) {
        resto = 0;
    }

    return resto === Number(c[10]);
}

function validarCNPJ(cnpj) {
    const c = limparDoc(cnpj);

    if (!/^[0-9A-Z]{12}[0-9]{2}$/.test(c)) {
        return false;
    }

    if (/^(.)\1{13}$/.test(c)) {
        return false;
    }

    const valor = (caractere) => caractere.charCodeAt(0) - 48;

    function calcularDigito(base) {
        const pesos = base.length === 12
            ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
            : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        let soma = 0;

        for (let i = 0; i < base.length; i++) {
            soma += valor(base[i]) * pesos[i];
        }

        const resto = soma % 11;

        return resto < 2 ? 0 : 11 - resto;
    }

    const d1 = calcularDigito(c.slice(0, 12));
    const d2 = calcularDigito(c.slice(0, 12) + d1);

    return c.slice(12) === `${d1}${d2}`;
}

function validarDocumento(documento) {
    const limpo = limparDoc(documento);

    if (/^\d{11}$/.test(limpo)) {
        return validarCPF(limpo);
    }

    return validarCNPJ(limpo);
}

const ehProdespadmin = (username) =>
    String(username ?? '').trim().toLowerCase() === ADMIN_USERNAME;

function perfilPadrao(username) {
    return ehProdespadmin(username)
        ? { role: 'Administrador', department: 'Diretoria de TI' }
        : { role: 'Visualizador', department: 'Geral' };
}

async function concluirLogin(res, user) {
    const padrao = perfilPadrao(user.username);

    const userRole = ehProdespadmin(user.username)
        ? 'Administrador'
        : (user.role || padrao.role);

    const userDept = ehProdespadmin(user.username)
        ? 'Diretoria de TI'
        : (user.department || padrao.department);

    if (
        ehProdespadmin(user.username) &&
        (user.role !== 'Administrador' || user.department !== userDept)
    ) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                role: 'Administrador',
                department: userDept
            }
        });
    }

    const token = jwt.sign(
        {
            sub: user.id,
            username: user.username,
            role: userRole
        },
        SIGN_KEY,
        {
            algorithm: 'RS256',
            expiresIn: '15m'
        }
    );

    res.cookie('token', token, COOKIE_OPTIONS);

    return res.status(200).json({
        message: 'Login realizado com sucesso!',
        user: {
            id: user.id,
            username: user.username,
            role: userRole,
            department: userDept
        }
    });
}

function validarCPFMiddleware(req, res, next) {
    const { username, cpf } = req.body ?? {};

    if (typeof cpf !== 'string' || !cpf.trim()) {
        return res.status(400).json({
            error: 'CPF ou CNPJ é obrigatório.'
        });
    }

    const documento = limparDoc(cpf);

    const isExcecao = Boolean(username) &&
        USUARIOS_EXCECAO.some(
            (user) =>
                user.toLowerCase() === String(username).trim().toLowerCase()
        );

    if (!isExcecao && !validarDocumento(documento)) {
        return res.status(400).json({
            error: 'CPF ou CNPJ inválido.'
        });
    }

    req.body.cpf = documento;

    next();
}

async function validarTurnstileMiddleware(req, res, next) {
    const turnstileToken = req.body?.['cf-turnstile-response'];

    if (typeof turnstileToken !== 'string' || !turnstileToken.trim()) {
        return res.status(400).json({
            error: 'Por favor, complete a verificação CAPTCHA.'
        });
    }

    const secret = process.env.TURNSTILE_SECRET_KEY;

    if (!secret) {
        console.error('TURNSTILE_SECRET_KEY não configurada.');

        return res.status(500).json({
            error: 'Erro na configuração do CAPTCHA.'
        });
    }

    try {
        const verificacao = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    secret,
                    response: turnstileToken
                }),
                signal: AbortSignal.timeout(10000)
            }
        );

        const resultadoCaptcha = await verificacao.json();

        if (resultadoCaptcha.success !== true) {
            return res.status(400).json({
                error: 'Verificação CAPTCHA inválida. Tente novamente.'
            });
        }

        next();
    } catch (erro) {
        console.error('Erro detalhado ao verificar Turnstile:', erro);

        return res.status(503).json({
            error: 'Não foi possível verificar o CAPTCHA. Tente novamente.'
        });
    }
}

router.post('/registrar', validarTurnstileMiddleware, validarCPFMiddleware, async (req, res) => {
    const { username, cpf, password } = req.body;

    if (
        typeof username !== 'string' || !username.trim() ||
        typeof password !== 'string' || !password
    ) {
        return res.status(400).json({
            error: 'Preencha todos os campos!'
        });
    }

    try {
        const nomeUsuario = username.trim();

        if (ehProdespadmin(nomeUsuario)) {
            const jaExiste = await prisma.user.findFirst({
                where: { username: nomeUsuario }
            });

            if (jaExiste) {
                return res.status(400).json({
                    error: 'Usuário ou CPF já cadastrado.'
                });
            }

            return res.status(403).json({
                error: 'O cadastro do administrador deve ser realizado por um processo autorizado.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const encryptedCPF = encryptCPF(cpf);
        const { role, department } = perfilPadrao(nomeUsuario);

        const newUser = await prisma.user.create({
            data: {
                username: nomeUsuario,
                cpf: encryptedCPF,
                password: hashedPassword,
                role,
                department,
                status: 'ativo'
            }
        });

        return res.status(201).json({
            message: 'Usuário cadastrado com sucesso!',
            user: {
                id: newUser.id,
                username: newUser.username,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Erro interno no registro:', error);

        if (error.code === 'P2002') {
            return res.status(400).json({
                error: 'Usuário ou CPF já cadastrado.'
            });
        }

        return res.status(500).json({
            error: 'Erro ao registrar usuário.'
        });
    }
});

router.post(
    '/login',
    loginFailureLimiter(7, 300),
    validarTurnstileMiddleware,
    validarCPFMiddleware,
    async (req, res) => {
        const { username, cpf, password } = req.body;

        if (
            typeof username !== 'string' || !username.trim() ||
            typeof password !== 'string' || !password
        ) {
            return res.status(400).json({
                error: 'Informe o usuário, CPF e a senha.'
            });
        }

        try {
            const user = await prisma.user.findFirst({
                where: { username: username.trim() }
            });

            if (!user) {
                const blocked = await req.recordLoginFailure();

                if (blocked) {
                    return res.status(429).json({
                        error: 'Muitas tentativas incorretas. Acesso bloqueado por 5 minutos.'
                    });
                }

                return res.status(401).json({
                    error: 'Credenciais inválidas.'
                });
            }

            let documentoBanco = null;

            if (user.cpf) {
                try {
                    documentoBanco = String(user.cpf).includes(':')
                        ? decryptCPF(user.cpf)
                        : user.cpf;
                } catch {
                    console.error(
                        'Não foi possível recuperar o documento armazenado.'
                    );
                }
            }

            const documentoLogin = limparDoc(cpf);
            const documentoSalvo = documentoBanco
                ? limparDoc(documentoBanco)
                : null;

            if (!documentoSalvo || documentoSalvo !== documentoLogin) {
                const blocked = await req.recordLoginFailure();

                if (blocked) {
                    return res.status(429).json({
                        error: 'Muitas tentativas incorretas. Acesso bloqueado por 5 minutos.'
                    });
                }

                return res.status(401).json({
                    error: 'Credenciais inválidas.'
                });
            }

            const senhaValida = await bcrypt.compare(password, user.password);

            if (!senhaValida) {
                const blocked = await req.recordLoginFailure();

                if (blocked) {
                    return res.status(429).json({
                        error: 'Muitas tentativas incorretas. Acesso bloqueado por 5 minutos.'
                    });
                }

                return res.status(401).json({
                    error: 'Credenciais inválidas.'
                });
            }

            if (!PRIVATE_KEY) {
                console.error('JWT_PRIVATE_KEY não configurada.');

                return res.status(500).json({
                    error: 'Erro na configuração do servidor.'
                });
            }

            if (user.twoFactorEnabled) {
                const metodo = user.twoFactorMethod || 'totp';
                let destination;

                if (metodo !== 'sms' && metodo !== 'totp') {
                    return res.status(400).json({
                        error: 'Método de verificação em duas etapas inválido.'
                    });
                }

                if (metodo === 'sms') {
                    if (!user.phone) {
                        return res.status(400).json({
                            error: 'Não há telefone cadastrado para a verificação por SMS.'
                        });
                    }

                    try {
                        const telefone = decryptText(user.phone);
                        const code = await criarOtp(user.id, 'login');

                        await enviarSms(telefone, code);
                        destination = mascararTelefone(telefone);
                    } catch (erroSms) {
                        if (erroSms.code === 'RESEND_TOO_SOON') {
                            return res.status(429).json({
                                error: 'Aguarde 1 minuto antes de solicitar outro código.'
                            });
                        }

                        await cancelarOtps(user.id, 'login');

                        console.error(
                            'Erro ao enviar SMS no login:',
                            erroSms.message
                        );

                        return res.status(502).json({
                            error: 'Não foi possível enviar o código por SMS. Tente novamente.'
                        });
                    }
                }

                if (metodo === 'totp' && !user.twoFactorSecret) {
                    return res.status(400).json({
                        error: 'O aplicativo autenticador não está configurado corretamente.'
                    });
                }

                const preAuthToken = jwt.sign(
                    { sub: user.id, stage: '2fa' },
                    SIGN_KEY,
                    {
                        algorithm: 'RS256',
                        expiresIn: '10m'
                    }
                );

                res.cookie('preauth', preAuthToken, COOKIE_OPTIONS);

                return res.status(200).json({
                    message: metodo === 'sms'
                        ? 'Código enviado por SMS.'
                        : 'Código 2FA necessário.',
                    requires2FA: true,
                    method: metodo,
                    ...(destination ? { destination } : {})
                });
            }

            await req.resetLoginFailures();

            return concluirLogin(res, user);
        } catch (error) {
            console.error('Erro no login:', error);

            return res.status(500).json({
                error: 'Erro interno no login.'
            });
        }
    }
);

router.post('/login/2fa', loginFailureLimiter(5, 300), async (req, res) => {
    const code = String(req.body?.code ?? '').replace(/\s/g, '');
    const preAuth = req.cookies?.preauth;

    if (!preAuth || !/^\d{6}$/.test(code)) {
        return res.status(400).json({
            error: 'Informe o código de 6 dígitos.'
        });
    }

    let payload;

    try {
        payload = jwt.verify(
            preAuth,
            PUBLIC_KEY,
            { algorithms: ['RS256'] }
        );
    } catch {
        return res.status(401).json({
            error: 'Sessão expirada. Faça login novamente.'
        });
    }

    if (payload.stage !== '2fa') {
        return res.status(401).json({
            error: 'Sessão inválida.'
        });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(payload.sub) }
        });

        const metodo = user?.twoFactorMethod || 'totp';

        if (
            !user?.twoFactorEnabled ||
            (metodo === 'totp' && !user.twoFactorSecret) ||
            (metodo === 'sms' && !user.phone) ||
            (metodo !== 'totp' && metodo !== 'sms')
        ) {
            return res.status(401).json({
                error: 'Sessão inválida.'
            });
        }

        const ok = metodo === 'sms'
            ? (await verificarOtp(user.id, code, 'login')).ok
            : authenticator.check(
                code,
                decryptText(user.twoFactorSecret)
            );

        if (!ok) {
            const blocked = await req.recordLoginFailure();

            return res.status(blocked ? 429 : 401).json({
                error: blocked
                    ? 'Muitas tentativas. Aguarde 5 minutos.'
                    : 'Código inválido.'
            });
        }

        await req.resetLoginFailures();
        res.clearCookie('preauth', COOKIE_OPTIONS);

        return concluirLogin(res, user);
    } catch (error) {
        console.error('Erro no 2FA:', error);

        return res.status(500).json({
            error: 'Erro interno durante a verificação.'
        });
    }
});

router.post('/login/2fa/reenviar', async (req, res) => {
    let payload;

    try {
        payload = jwt.verify(
            req.cookies?.preauth,
            PUBLIC_KEY,
            { algorithms: ['RS256'] }
        );
    } catch {
        return res.status(401).json({
            error: 'Sessão expirada. Faça login novamente.'
        });
    }

    if (payload.stage !== '2fa') {
        return res.status(401).json({
            error: 'Sessão inválida.'
        });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(payload.sub) }
        });

        if (!user?.twoFactorEnabled || user.twoFactorMethod !== 'sms') {
            return res.status(400).json({
                error: 'O reenvio só existe para o método SMS.'
            });
        }

        if (!user.phone) {
            return res.status(400).json({
                error: 'Não há telefone cadastrado para o SMS.'
            });
        }

        try {
            const telefone = decryptText(user.phone);
            const code = await criarOtp(user.id, 'login');

            await enviarSms(telefone, code);
        } catch (erroSms) {
            if (erroSms.code === 'RESEND_TOO_SOON') {
                return res.status(429).json({
                    error: 'Aguarde 1 minuto para pedir outro código.'
                });
            }

            await cancelarOtps(user.id, 'login');

            console.error(
                'Erro ao reenviar SMS:',
                erroSms.message
            );

            return res.status(502).json({
                error: 'Não foi possível enviar o SMS. Tente novamente.'
            });
        }

        return res.json({
            message: 'Código reenviado por SMS.'
        });
    } catch (error) {
        console.error('Erro no reenvio:', error);

        return res.status(500).json({
            error: 'Erro interno ao reenviar o código.'
        });
    }
});

router.get('/2fa/status', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(req.user.sub) },
            select: { twoFactorEnabled: true, twoFactorMethod: true }
        });

        if (!user) {
            return res.status(404).json({
                error: 'Usuário não encontrado.'
            });
        }

        return res.json({
            enabled: Boolean(user.twoFactorEnabled),
            method: user.twoFactorEnabled
                ? (user.twoFactorMethod || 'totp')
                : null
        });
    } catch (error) {
        console.error('Erro ao consultar 2FA:', error);

        return res.status(500).json({
            error: 'Erro ao consultar o 2FA.'
        });
    }
});

router.get('/usuarios', authenticateToken, async (req, res) => {
    try {
        const usuarios = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                role: true,
                department: true,
                status: true,
                updatedAt: true
            }
        });

        return res.status(200).json(usuarios);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);

        return res.status(500).json({
            error: 'Erro ao buscar usuários.'
        });
    }
});

router.put('/usuarios/:id', authenticateToken, requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    let { username, role, department, status } = req.body;

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'ID de usuário inválido.'
        });
    }

    try {
        const alvo = await prisma.user.findUnique({
            where: { id }
        });

        if (!alvo) {
            return res.status(404).json({
                error: 'Usuário não encontrado.'
            });
        }

        if (
            typeof username !== 'string' || !username.trim() ||
            typeof role !== 'string' ||
            typeof department !== 'string' ||
            typeof status !== 'string'
        ) {
            return res.status(400).json({
                error: 'Informe dados válidos para atualizar o usuário.'
            });
        }

        username = username.trim();

        if (ehProdespadmin(username) && !ehProdespadmin(alvo.username)) {
            return res.status(400).json({
                error: 'Nome de usuário reservado.'
            });
        }

        if (ehProdespadmin(alvo.username)) {
            username = alvo.username;
            role = 'Administrador';
            department = 'Diretoria de TI';
            status = 'ativo';
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { username, role, department, status },
            select: {
                id: true,
                username: true,
                role: true,
                department: true,
                status: true,
                updatedAt: true
            }
        });

        return res.status(200).json({
            message: 'Usuário atualizado com sucesso!',
            user: updatedUser
        });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);

        if (error.code === 'P2002') {
            return res.status(400).json({
                error: 'Nome de usuário já cadastrado.'
            });
        }

        return res.status(500).json({
            error: 'Erro ao atualizar usuário no banco de dados.'
        });
    }
});
router.post('/2fa/setup', authenticateToken, async (req, res) => {
    try {
        const userId = Number(req.user.sub);

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || user.status !== 'ativo') {
            return res.status(401).json({
                error: 'Usuário inválido ou inativo.'
            });
        }

        if (user.twoFactorEnabled) {
            return res.status(400).json({
                error: 'A verificação em duas etapas já está ativada.'
            });
        }

        const secret = authenticator.generateSecret();

        await prisma.user.update({
            where: { id: userId },
            data: {
                twoFactorSecret: encryptText(secret),
                twoFactorMethod: 'totp',
                twoFactorEnabled: false
            }
        });

        const qr = await QRCode.toDataURL(
            authenticator.keyuri(user.username, 'Prodesp', secret)
        );

        return res.json({ qr, secret });
    } catch (error) {
        console.error('Erro ao iniciar configuração do 2FA:', error);

        return res.status(500).json({
            error: 'Erro ao configurar o 2FA.'
        });
    }
});

router.post('/2fa/enable', authenticateToken, loginFailureLimiter(5, 300), async (req, res) => {
    try {
        const code = String(req.body?.code ?? '').replace(/\s/g, '');

        if (!/^\d{6}$/.test(code)) {
            return res.status(400).json({
                error: 'Informe o código de 6 dígitos.'
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: Number(req.user.sub) }
        });

        if (!user || user.status !== 'ativo' || user.twoFactorEnabled) {
            return res.status(400).json({
                error: 'Não é possível ativar o 2FA neste momento.'
            });
        }

        if (!user.twoFactorSecret) {
            return res.status(400).json({
                error: 'Inicie a configuração primeiro.'
            });
        }

        const valido = authenticator.check(
            code,
            decryptText(user.twoFactorSecret)
        );

        if (!valido) {
            const blocked = await req.recordLoginFailure();

            return res.status(blocked ? 429 : 400).json({
                error: blocked
                    ? 'Muitas tentativas. Aguarde 5 minutos.'
                    : 'Código inválido.'
            });
        }

        await req.resetLoginFailures();

        await prisma.user.update({
            where: { id: user.id },
            data: {
                twoFactorMethod: 'totp',
                twoFactorEnabled: true
            }
        });

        return res.json({
            message: 'Autenticação em duas etapas ativada.'
        });
    } catch (error) {
        console.error('Erro ao ativar o 2FA:', error);

        return res.status(500).json({
            error: 'Erro ao ativar o 2FA.'
        });
    }
});
router.post('/2fa/sms/setup', authenticateToken, async (req, res) => {
    try {
        const password = String(req.body?.password ?? '');
        const phone = normalizarTelefoneBR(req.body?.phone);

        if (!password || !phone) {
            return res.status(400).json({
                error: 'Informe sua senha e um telefone válido.'
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: Number(req.user.sub) }
        });

        if (!user || user.status !== 'ativo') {
            return res.status(401).json({
                error: 'Usuário inválido ou inativo.'
            });
        }

        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                error: 'Senha incorreta.'
            });
        }

        if (user.twoFactorEnabled) {
            return res.status(400).json({
                error: 'Desative o 2FA atual antes de configurar outro método.'
            });
        }

        const code = await criarOtp(
            user.id,
            'setup',
            encryptText(phone)
        );

        try {
            await enviarSms(phone, code);
        } catch (erroSms) {
            await cancelarOtps(user.id, 'setup');

            console.error('Erro ao enviar SMS de ativação:', erroSms.message);

            return res.status(502).json({
                error: 'Não foi possível enviar o SMS. Tente novamente.'
            });
        }


        return res.json({
            message: 'Código de verificação enviado por SMS.',
            destination: mascararTelefone(phone)
        });
    } catch (error) {
        if (error.code === 'RESEND_TOO_SOON') {
            return res.status(429).json({
                error: 'Aguarde 1 minuto antes de solicitar outro código.'
            });
        }

        console.error('Erro ao iniciar configuração de SMS:', error);

        return res.status(500).json({
            error: 'Erro ao iniciar a configuração de SMS.'
        });
    }
});

router.post('/2fa/sms/enable', authenticateToken, async (req, res) => {
    try {
        const code = String(req.body?.code ?? '').trim();

        if (!/^\d{6}$/.test(code)) {
            return res.status(400).json({
                error: 'Informe o código de 6 dígitos.'
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: Number(req.user.sub) }
        });

        if (!user || user.status !== 'ativo' || user.twoFactorEnabled) {
            return res.status(400).json({
                error: 'Não é possível ativar o 2FA neste momento.'
            });
        }

        const resultado = await verificarOtp(user.id, code, 'setup');

        if (!resultado.ok || !resultado.destination) {
            return res.status(400).json({
                error: 'Código inválido ou expirado. Solicite outro código.'
            });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                phone: resultado.destination,
                twoFactorMethod: 'sms',
                twoFactorSecret: null,
                twoFactorEnabled: true
            }
        });

        return res.json({
            message: 'Autenticação em duas etapas por SMS ativada.'
        });
    } catch (error) {
        console.error('Erro ao ativar 2FA por SMS:', error);

        return res.status(500).json({
            error: 'Erro ao ativar o 2FA por SMS.'
        });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token', COOKIE_OPTIONS);
    res.clearCookie('preauth', COOKIE_OPTIONS);

    return res.json({
        message: 'Sessão encerrada.'
    });
});
export default router;
