export async function registrarUsuario(dadosUsuario) {
    try {
        const response = await fetch('http://localhost:3333/registrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(dadosUsuario) 
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || `Erro no servidor (Status: ${response.status})`);
        }

        return data;
    } catch (erro) {
        console.error("Falha ao enviar:", erro);
        throw erro;
    }
}


export async function fazerLogin(dadosLogin) {
    try {
        const response = await fetch('http://localhost:3333/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            credentials: 'include', 
            body: JSON.stringify(dadosLogin)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Falha ao realizar login.');
        }

        return data;
    } catch (erro) {
        console.error("Falha ao realizar login:", erro);
        throw erro;
    }
}