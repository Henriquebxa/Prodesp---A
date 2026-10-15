import { Router } from 'express';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { encryptCPF, decryptCPF } from '../lib/cryptoUtils.js';

const router = Router();

function validarCPF(cpf) {
    if (!cpf) return false;
    const cleanCPF = String(cpf).replace(/\D/g, '');

    if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
        return false;
    }

    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cleanCPF.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
}

const USUARIOS_EXCECAO = ['Prodespadmin'];

function validarCPFMiddleware(req, res, next) {
    const { username, cpf } = req.body;

    if (!cpf) {
        return res.status(400).json({ error: 'CPF é obrigatório.' });
    }

    const cleanCPF = String(cpf).replace(/\D/g, '');

    const isExcecao = username && USUARIOS_EXCECAO.some(
        user => user.toLowerCase() === String(username).trim().toLowerCase()
    );

    if (!isExcecao && !validarCPF(cleanCPF)) {
        return res.status(400).json({ error: 'CPF inválido.' });
    }

    req.body.cpf = cleanCPF;
    next();
}


const PRIVATE_KEY = process.env.JWT_PRIVATE_KEY
    ? String(process.env.JWT_PRIVATE_KEY).replace(/\\n/g, '\n')
    : undefined;

const PUBLIC_KEY = process.env.JWT_PUBLIC_KEY
    ? String(process.env.JWT_PUBLIC_KEY).replace(/\\n/g, '\n')
    : undefined;

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000
};


router.post('/registrar', validarCPFMiddleware, async (req, res) => {
    const { username, cpf, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Preencha todos os campos!' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const encryptedCPF = encryptCPF(cpf);

        const newUser = await prisma.user.create({
            data: {
                username,
                cpf: encryptedCPF,
                password: hashedPassword,
            },
        });

        return res.status(201).json({
            message: 'Usuário cadastrado com sucesso!',
            user: { id: newUser.id, username: newUser.username }
        });
    } catch (error) {
        console.error("Erro interno no registro:", error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Usuário ou CPF já cadastrado.' });
        }
        return res.status(500).json({ error: 'Erro ao registrar usuário.', details: error.message });
    }
});

router.post('/login', validarCPFMiddleware, async (req, res) => {
    const { username, cpf, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Informe o usuário, CPF e a senha.' });
    }

    try {
        const user = await prisma.user.findFirst({
            where: { username }
        });

        if (!user) {
            console.log(`❌ Login falhou: Usuário '${username}' não encontrado.`);
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        let decryptedUserCPF = null;

        if (user.cpf) {
            if (String(user.cpf).includes(':')) {
                try {
                    decryptedUserCPF = decryptCPF(user.cpf);
                } catch (cryptoErr) {
                    console.error("❌ Erro ao descriptografar CPF do banco:", cryptoErr.message);
                    decryptedUserCPF = null;
                }
            } else {
                decryptedUserCPF = String(user.cpf).replace(/\D/g, '');
            }
        }

        const cleanLoginCPF = String(cpf).trim().replace(/\D/g, '');
        const cleanDbCPF = decryptedUserCPF ? String(decryptedUserCPF).trim().replace(/\D/g, '') : null;

        if (!cleanDbCPF || cleanDbCPF !== cleanLoginCPF) {
            console.log('❌ Falha na comparação do CPF.');
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('❌ Falha na verificação de senha.');
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        if (!PRIVATE_KEY) {
            console.error("❌ ERRO: JWT_PRIVATE_KEY não foi encontrada no .env!");
            return res.status(500).json({ error: 'Erro na configuração do servidor.' });
        }

        const token = jwt.sign(
            { sub: user.id, username: user.username },
            process.env.JWT_KEY_PASSPHRASE 
                ? { key: PRIVATE_KEY, passphrase: process.env.JWT_KEY_PASSPHRASE }
                : PRIVATE_KEY,
            { algorithm: 'RS256', expiresIn: '15m' }
        );

        res.cookie('token', token, COOKIE_OPTIONS);

        return res.status(200).json({ message: 'Login realizado com sucesso!' });

    } catch (error) {
        console.error("Erro no login:", error);
        return res.status(500).json({ error: 'Erro interno durante o login.' });
    }
});

export function authenticateToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token não encontrado.' });
    }

    jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido ou expirado.' });
        }

        req.user = decoded;
        next();
    });
}

router.post('/logout', (req, res) => {
    res.clearCookie('token', COOKIE_OPTIONS);
    return res.status(200).json({ message: 'Logout realizado com sucesso!' });
});

export default router;