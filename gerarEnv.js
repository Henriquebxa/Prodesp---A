const crypto = require('crypto');
const fs = require('fs');

if (fs.existsSync('.env')) {
  console.log('Já existe um arquivo .env aqui. Não vou sobrescrever. Apague ou renomeie o .env e rode de novo.');
  process.exit(1);
}

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const umaLinha = (pem) => pem.trim().replace(/\r?\n/g, '\\n');

const conteudo = [
  'DATABASE_URL="mysql://root:estruturamysqlprodesp@localhost:3007/prodesp"',
  `CPF_ENCRYPTION_KEY="${crypto.randomBytes(32).toString('hex')}"`,
  `JWT_PRIVATE_KEY="${umaLinha(privateKey)}"`,
  `JWT_PUBLIC_KEY="${umaLinha(publicKey)}"`,
  '',
].join('\n');

fs.writeFileSync('.env', conteudo);
console.log('Arquivo .env criado com sucesso.');