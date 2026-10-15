function validarCPF(cpf) {
  if (!cpf) return false;
  const cpfLimpo = cpf.replace(/\D/g, '');
  if (cpfLimpo.length !== 11 || /^(\d)\1{10}$/.test(cpfLimpo)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.charAt(10))) return false;

  return true;
}

module.exports = function middlewareValidarCPF(req, res, next) {
  const { cpf } = req.body;

  if (!cpf || !validarCPF(cpf)) {
    return res.status(400).json({ error: 'CPF inválido fornecido.' });
  }

  req.body.cpf = cpf.replace(/\D/g, '');
  next();
};