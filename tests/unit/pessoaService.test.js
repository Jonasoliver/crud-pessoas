const { PessoaService } = require('../../src/services/pessoaService');
const { ValidationError, NotFoundError, ConflictError } = require('../../src/errors');

describe('PessoaService', () => {
  const hoje = () => new Date(2026, 9, 20);
  let service;

  const maria = { cpf: '529.982.247-25', nome: 'Maria Silva', dataNascimento: '2000-01-15' };
  const joao = { cpf: '111.444.777-35', nome: 'João Souza', dataNascimento: '1990-12-25' };

  beforeEach(() => {
    service = new PessoaService({ relogio: hoje });
  });

  describe('criar', () => {
    it('cadastra uma pessoa e retorna os dados com a idade calculada', () => {
      expect(service.criar(maria)).toEqual({
        cpf: '529.982.247-25',
        nome: 'Maria Silva',
        dataNascimento: '2000-01-15',
        idade: 26,
      });
    });

    it('aceita CPF sem máscara e devolve formatado', () => {
      expect(service.criar({ ...maria, cpf: '52998224725' }).cpf).toBe('529.982.247-25');
    });

    it('remove espaços extras do nome', () => {
      expect(service.criar({ ...maria, nome: '  Maria Silva  ' }).nome).toBe('Maria Silva');
    });

    it('rejeita CPF inválido', () => {
      expect(() => service.criar({ ...maria, cpf: '123.456.789-00' })).toThrow(ValidationError);
    });

    it('rejeita nome vazio ou ausente', () => {
      expect(() => service.criar({ ...maria, nome: '   ' })).toThrow(ValidationError);
      expect(() => service.criar({ ...maria, nome: undefined })).toThrow(ValidationError);
    });

    it('rejeita data de nascimento inválida ou futura', () => {
      expect(() => service.criar({ ...maria, dataNascimento: '15/01/2000' })).toThrow(
        ValidationError,
      );
      expect(() => service.criar({ ...maria, dataNascimento: '2030-01-01' })).toThrow(
        ValidationError,
      );
    });

    it('rejeita CPF já cadastrado', () => {
      service.criar(maria);
      expect(() => service.criar({ ...maria, cpf: '52998224725' })).toThrow(ConflictError);
    });
  });

  describe('listar', () => {
    it('retorna lista vazia quando não há cadastros', () => {
      expect(service.listar()).toEqual([]);
    });

    it('retorna todas as pessoas ordenadas por nome', () => {
      service.criar(maria);
      service.criar(joao);
      expect(service.listar().map((p) => p.nome)).toEqual(['João Souza', 'Maria Silva']);
    });
  });

  describe('buscarPorCpf', () => {
    it('retorna a pessoa pelo CPF, com ou sem máscara', () => {
      service.criar(maria);
      expect(service.buscarPorCpf('52998224725').nome).toBe('Maria Silva');
      expect(service.buscarPorCpf('529.982.247-25').idade).toBe(26);
    });

    it('lança NotFoundError quando o CPF não está cadastrado', () => {
      expect(() => service.buscarPorCpf('52998224725')).toThrow(NotFoundError);
    });
  });

  describe('atualizar', () => {
    it('atualiza nome e data de nascimento e recalcula a idade', () => {
      service.criar(maria);
      const atualizada = service.atualizar('52998224725', {
        nome: 'Maria Oliveira',
        dataNascimento: '1980-05-10',
      });
      expect(atualizada).toEqual({
        cpf: '529.982.247-25',
        nome: 'Maria Oliveira',
        dataNascimento: '1980-05-10',
        idade: 46,
      });
    });

    it('permite atualização parcial', () => {
      service.criar(maria);
      const atualizada = service.atualizar('52998224725', { nome: 'Maria S.' });
      expect(atualizada.nome).toBe('Maria S.');
      expect(atualizada.dataNascimento).toBe('2000-01-15');
    });

    it('valida os novos dados', () => {
      service.criar(maria);
      expect(() => service.atualizar('52998224725', { nome: '' })).toThrow(ValidationError);
      expect(() => service.atualizar('52998224725', { dataNascimento: 'x' })).toThrow(
        ValidationError,
      );
    });

    it('lança NotFoundError ao atualizar CPF inexistente', () => {
      expect(() => service.atualizar('52998224725', { nome: 'X' })).toThrow(NotFoundError);
    });
  });

  describe('remover', () => {
    it('remove a pessoa cadastrada', () => {
      service.criar(maria);
      service.remover('529.982.247-25');
      expect(service.listar()).toEqual([]);
    });

    it('lança NotFoundError ao remover CPF inexistente', () => {
      expect(() => service.remover('52998224725')).toThrow(NotFoundError);
    });
  });
});
