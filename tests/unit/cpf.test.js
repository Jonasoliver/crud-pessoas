const { validarCpf, limparCpf, formatarCpf } = require('../../src/utils/cpf');

describe('limparCpf', () => {
  it('remove pontos, traço e espaços', () => {
    expect(limparCpf(' 529.982.247-25 ')).toBe('52998224725');
  });
});

describe('validarCpf', () => {
  it.each(['529.982.247-25', '52998224725', '111.444.777-35'])('aceita o CPF válido %s', (cpf) => {
    expect(validarCpf(cpf)).toBe(true);
  });

  it.each([
    ['dígito verificador errado', '529.982.247-24'],
    ['todos os dígitos iguais', '111.111.111-11'],
    ['tamanho menor que 11', '1234567890'],
    ['tamanho maior que 11', '123456789012'],
    ['letras', 'abc.def.ghi-jk'],
    ['vazio', ''],
  ])('rejeita CPF com %s', (_, cpf) => {
    expect(validarCpf(cpf)).toBe(false);
  });

  it('rejeita valores que não são string', () => {
    expect(validarCpf(undefined)).toBe(false);
    expect(validarCpf(52998224725)).toBe(false);
  });
});

describe('formatarCpf', () => {
  it('formata no padrão 000.000.000-00', () => {
    expect(formatarCpf('52998224725')).toBe('529.982.247-25');
  });
});
