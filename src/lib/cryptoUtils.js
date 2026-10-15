import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

function getSecretKey() {
    const rawKey = process.env.CPF_ENCRYPTION_KEY;

    if (!rawKey) {
        throw new Error('❌ CPF_ENCRYPTION_KEY não está definida no .env');
    }

    return crypto.createHash('sha256').update(rawKey, 'utf8').digest();
}

export function encryptCPF(cpf) {
    if (!cpf) return null;

    const key = getSecretKey();
    const iv = crypto.randomBytes(16); 
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(cpf, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptCPF(encryptedCPF) {
    if (!encryptedCPF || typeof encryptedCPF !== 'string') {
        return null;
    }
    
    const parts = encryptedCPF.split(':');
    
    if (parts.length !== 2) {
        throw new Error(`Formato de CPF criptografado inválido. Esperado "IV:Texto", mas recebeu: "${encryptedCPF}"`);
    }

    const [ivHex, encryptedText] = parts;
    const iv = Buffer.from(ivHex, 'hex');

    if (iv.length !== 16) {
        throw new Error(`IV inválido: tamanho esperado de 16 bytes, mas recebeu ${iv.length} bytes (hex: "${ivHex}")`);
    }

    const key = getSecretKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}