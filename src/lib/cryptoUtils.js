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
    const key = getSecretKey();
    const iv = crypto.randomBytes(16); 
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(cpf, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptCPF(encryptedCPF) {
    if (!encryptedCPF) return null;
    
    const key = getSecretKey();
    const [ivHex, encryptedText] = encryptedCPF.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}