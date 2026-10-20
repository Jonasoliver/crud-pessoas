/**
 * Remove tudo que não for dígito.
 * @param {string} cpf
 * @returns {string}
 */
function limparCpf(cpf) {
  return String(cpf).replace(/\D/g, '');
}

function calcularDigito(base) {
  const pesoInicial = base.length + 1;
  const soma = [...base].reduce(
    (acc, digito, indice) => acc + Number(digito) * (pesoInicial - indice),
    0,
  );
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

/**
 * Valida um CPF (com ou sem máscara) pelos dígitos verificadores.
 * @param {string} cpf
 * @returns {boolean}
 */
function validarCpf(cpf) {
  if (typeof cpf !== 'string') {
    return false;
  }

  const numeros = limparCpf(cpf);
  if (numeros.length !== 11 || /^(\d)\1{10}$/.test(numeros)) {
    return false;
  }

  const digito1 = calcularDigito(numeros.slice(0, 9));
  const digito2 = calcularDigito(numeros.slice(0, 10));

  return digito1 === Number(numeros[9]) && digito2 === Number(numeros[10]);
}

/**
 * Formata 11 dígitos no padrão 000.000.000-00.
 * @param {string} cpf
 * @returns {string}
 */
function formatarCpf(cpf) {
  return limparCpf(cpf).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

module.exports = { validarCpf, limparCpf, formatarCpf };
