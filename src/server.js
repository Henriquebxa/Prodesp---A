import express from 'express';
import path from 'path'; 
import cors from 'cors';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3333;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(authRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html')); 
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});