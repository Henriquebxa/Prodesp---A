export async function registrarUsuario(dadosUsuario) {
    try {
        const response = await fetch('http://localhost:3333/registrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(dadosUsuario) 
        });

        if (!response.ok) {
            throw new Error(`Erro no servidor (Status: ${response.status})`);
        }

        return await response.json();
    } catch (erro) {
        console.error("Falha ao enviar:", erro);
        throw erro;
    }
}