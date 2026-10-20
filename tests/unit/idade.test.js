const { calcularIdade } = require('../../src/utils/idade');

describe('calcularIdade', () => {
  const hoje = new Date(2026, 9, 20); // 20/10/2026

  it('calcula a idade quando o aniversário já passou no ano', () => {
    expect(calcularIdade('2000-01-15', hoje)).toBe(26);
  });

  it('calcula a idade quando o aniversário ainda não chegou no ano', () => {
    expect(calcularIdade('2000-12-25', hoje)).toBe(25);
  });

  it('considera o aniversário no próprio dia', () => {
    expect(calcularIdade('2000-10-20', hoje)).toBe(26);
  });

  it('retorna 0 para quem nasceu há menos de um ano', () => {
    expect(calcularIdade('2026-01-01', hoje)).toBe(0);
  });

  it('trata nascidos em 29/02 em anos não bissextos', () => {
    expect(calcularIdade('2004-02-29', new Date(2025, 1, 28))).toBe(20);
    expect(calcularIdade('2004-02-29', new Date(2025, 2, 1))).toBe(21);
  });

  it('lança erro para data em formato inválido', () => {
    expect(() => calcularIdade('20/10/2000', hoje)).toThrow('Data de nascimento inválida');
  });

  it('lança erro para data inexistente', () => {
    expect(() => calcularIdade('2001-02-30', hoje)).toThrow('Data de nascimento inválida');
  });

  it('lança erro para data no futuro', () => {
    expect(() => calcularIdade('2030-01-01', hoje)).toThrow(
      'Data de nascimento não pode ser no futuro',
    );
  });
});
