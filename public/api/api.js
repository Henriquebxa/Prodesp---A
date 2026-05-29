export async function enviarContato(objetoDados) {
    try {
        const resposta = await fetch('https://localhost:3333/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(objetoDados) 
        });

        if (!resposta.ok) {
            throw new Error('Erro na resposta do servidor');
        }

        return await resposta.json();
    } catch (erro) {
        console.error("Falha ao enviar:", erro);
        return null;
    }
}