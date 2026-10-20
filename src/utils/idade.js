const FORMATO_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Converte uma string "AAAA-MM-DD" em Date (horário local), validando se a data existe.
 * @param {string} texto
 * @returns {Date}
 */
function parseData(texto) {
  const partes = FORMATO_DATA.exec(texto);
  if (!partes) {
    throw new Error('Data de nascimento inválida');
  }

  const [, ano, mes, dia] = partes.map(Number);
  const data = new Date(ano, mes - 1, dia);

  if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) {
    throw new Error('Data de nascimento inválida');
  }

  return data;
}

/**
 * Calcula a idade em anos completos.
 * @param {string} dataNascimento data no formato AAAA-MM-DD
 * @param {Date} [hoje] data de referência (padrão: data atual)
 * @returns {number}
 */
function calcularIdade(dataNascimento, hoje = new Date()) {
  const nascimento = parseData(dataNascimento);

  if (nascimento > hoje) {
    throw new Error('Data de nascimento não pode ser no futuro');
  }

  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aniversarioNaoChegou =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());

  if (aniversarioNaoChegou) {
    idade -= 1;
  }

  return idade;
}

module.exports = { calcularIdade, parseData };
