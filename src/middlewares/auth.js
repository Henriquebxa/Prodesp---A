
import jwt from 'jsonwebtoken';

const PUBLIC_KEY = process.env.JWT_PUBLIC_KEY
    ? String(process.env.JWT_PUBLIC_KEY).replace(/\\n/g, '\n')
    : undefined;

export function authenticateToken(req, res, next) {
    if (!PUBLIC_KEY) {
        console.error('JWT_PUBLIC_KEY não está configurada.');
        return res.status(500).json({
            error: 'Configuração de autenticação indisponível.'
        });
    }

    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            error: 'Autenticação necessária. Faça login novamente.'
        });
    }

    try {
        const payload = jwt.verify(token, PUBLIC_KEY, {
            algorithms: ['RS256']
        });

        if (!payload.sub || payload.stage === '2fa') {
            return res.status(401).json({
                error: 'Token de autenticação inválido.'
            });
        }

        req.user = payload;
        next();
    } catch {
        return res.status(401).json({
            error: 'Token inválido ou sessão expirada.'
        });
    }
}

export function requireAdmin(req, res, next) {
    const username = String(req.user?.username ?? '').toLowerCase();
    const role = String(req.user?.role ?? '').toLowerCase();

    if (username !== 'prodespadmin' && role !== 'administrador') {
        return res.status(403).json({
            error: 'Acesso restrito a administradores.'
        });
    }

    next();
}
