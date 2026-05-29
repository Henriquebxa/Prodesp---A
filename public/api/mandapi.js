import { enviarContato } from './api.js';

const botao = document.querySelector('#Envia'); 

botao.addEventListener('click', async (event) => {
    event.preventDefault(); 
    const dadosUsuario = {
        nome: document.getElementById('username').value,
        cpf: document.getElementById('cpf').value,
        senha: document.getElementById('password').value
    };

    if (!dadosUsuario.nome || !dadosUsuario.cpf || !dadosUsuario.senha) {
        alert("Por favor, preencha os campos obrigatórios.");
        return;
    }

    console.log("Enviando para o banco:", dadosUsuario);
    
    const resultado = await enviarContato(dadosUsuario);
    
    if (resultado) {
        const alerta = document.getElementById('janela-sucesso');
        const overlay = document.getElementById('notificacao-overlay');

        if (alerta) {

            document.getElementById('username').value = "";
            document.getElementById('cpf').value = "";
            document.getElementById('password').value = "";
        }
    } else {
        alert("Erro ao salvar no banco. Verifique o servidor.");
    }
});