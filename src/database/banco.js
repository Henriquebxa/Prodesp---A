import db from '../SQL/Database.js';

app.post('/login', (req, res) => { 
    console.log("Dados recebidos no corpo da requisição:", req.body);
    const { nome, cpf, senha } = req.body;
    const sql = "INSERT INTO usuarios (nome, cpf, senha) VALUES (?, ?, ?)";

    db.query(sql, [nome, cpf, senha], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Erro ao salvar no banco");
        }
        res.status(201).json({ mensagem: "Usuário salvo com sucesso!" });
    });
});