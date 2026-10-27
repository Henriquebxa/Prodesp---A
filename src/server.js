import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimiter } from './middlewares/ratelimiter.js';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 
const app = express();
const port = 3333;

app.enable('trust proxy');

app.use(helmet.hsts({
    maxAge: 31536000, 
    includeSubDomains: true,
    preload: true
}));
 
app.use((req, res, next) => {
    const protocolo = req.headers['x-forwarded-proto'] || req.protocol;
 
    if (
        process.env.NODE_ENV === 'production' &&
        protocolo !== 'https'
    ) {
        return res.redirect(
            301,
            `https://${req.headers.host}${req.originalUrl}`
        );
    }
 
    next();
});

app.use(cors({
    origin: 'http://localhost:3333',
    credentials: true
}));
 
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(rateLimiter(10, 60));
app.use(authRoutes);
 
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});
 
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});