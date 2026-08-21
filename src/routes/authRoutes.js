import { Router } from 'express';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { encryptCPF, decryptCPF } from '../lib/cryptoUtils.js';

const router = Router();

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

const JWT_SECRET = process.env.JWT_SECRET

router.post('/registrar', async (req, res) => {
    const { username, cpf, password } = req.body;

    if (!username || !cpf || !password) {
        return res.status(400).json({ error: 'Preencha todos os campos!' });
    }

    const cleanCPF = cpf.replace(/\D/g, '');

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const encryptedCPF = encryptCPF(cleanCPF);

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

//Daqui para baixo é o código de login, onde será implementado a autenticação do usuário.

router.post('/login', async (req, res) => {
    const { username, cpf, password } = req.body;

    if (!username || !cpf || !password) {
        return res.status(400).json({ error: 'Informe o usuário, CPF e a senha.' });
    }

    const cleanCPF = cpf.replace(/\D/g, '');

    try {
        const user = await prisma.user.findFirst({
            where: { username }
        });

        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const decryptedUserCPF = decryptCPF(user.cpf);
        if (decryptedUserCPF !== cleanCPF) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
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

//rota de logout

router.post('/logout', (req, res) => {
    res.clearCookie('token', COOKIE_OPTIONS);
    return res.status(200).json({ message: 'Logout realizado com sucesso!' });
});

export default router;