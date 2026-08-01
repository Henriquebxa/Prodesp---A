import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.post('/registrar', async (req, res) => {
    const { username, cpf, password } = req.body;

    if (!username || !cpf || !password) {
        return res.status(400).json({ error: 'Preencha todos os campos!' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                cpf,
                password: hashedPassword,
            },
        });

        return res.status(201).json({
            message: 'Usuário cadastrado com sucesso!',
            user: { id: newUser.id, username: newUser.username }
        });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'CPF já cadastrado.' });
        }
        return res.status(500).json({ error: 'Erro ao registrar usuário.', details: error.message });
    }
});

export default router;