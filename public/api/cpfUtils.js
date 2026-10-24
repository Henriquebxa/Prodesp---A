export function limparCPF(cpf) {
  return cpf ? String(cpf).replace(/\D/g, '') : '';
}

export function mascararCPF(valor) {
  return valor
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
}

export function validarCPF(cpf) {
  const cpfLimpo = limparCPF(cpf);
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


export function limparDocumento(valor) {
  return valor ? String(valor).toUpperCase().replace(/[^0-9A-Z]/g, '') : '';
}

export function mascararCNPJ(valor) {
  const v = limparDocumento(valor).slice(0, 14);
  let saida = '';
  for (let i = 0; i < v.length; i++) {
    if (i === 2 || i === 5) saida += '.';
    if (i === 8) saida += '/';
    if (i === 12) saida += '-';
    saida += v[i];
  }
  return saida;
}

export function mascararDocumento(valor) {
  const limpo = limparDocumento(valor);
  const ehCNPJ = limpo.length > 11 || /[A-Z]/.test(limpo);
  return ehCNPJ ? mascararCNPJ(limpo) : mascararCPF(limpo);
}

export function validarCNPJ(cnpj) {
  const c = limparDocumento(cnpj);
  if (!/^[0-9A-Z]{12}[0-9]{2}$/.test(c)) return false;
  if (/^(.)\1{13}$/.test(c)) return false;

  const valor = (ch) => ch.charCodeAt(0) - 48;

  const calcularDigito = (base) => {
    const pesos = base.length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma = 0;
    for (let i = 0; i < base.length; i++) soma += valor(base[i]) * pesos[i];
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const d1 = calcularDigito(c.slice(0, 12));
  const d2 = calcularDigito(c.slice(0, 12) + d1);
  return c.slice(12) === `${d1}${d2}`;
}

export function validarDocumento(valor) {
  const limpo = limparDocumento(valor);
  return limpo.length === 11 ? validarCPF(limpo) : validarCNPJ(limpo);
}
