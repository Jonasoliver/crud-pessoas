const { calcularIdade } = require('../utils/idade');
const { validarCpf, limparCpf, formatarCpf } = require('../utils/cpf');
const { ValidationError, NotFoundError, ConflictError } = require('../errors');

function validarNome(nome) {
  if (typeof nome !== 'string' || nome.trim() === '') {
    throw new ValidationError('Nome é obrigatório');
  }
  return nome.trim();
}

class PessoaService {
  /**
   * @param {object} [opcoes]
   * @param {Map} [opcoes.repositorio] armazenamento das pessoas, indexado pelo CPF sem máscara
   * @param {() => Date} [opcoes.relogio] fonte da data atual (injetável para testes)
   */
  constructor({ repositorio = new Map(), relogio = () => new Date() } = {}) {
    this.repositorio = repositorio;
    this.relogio = relogio;
  }

  validarDataNascimento(dataNascimento) {
    try {
      calcularIdade(dataNascimento, this.relogio());
    } catch (erro) {
      throw new ValidationError(erro.message);
    }
    return dataNascimento;
  }

  chaveCpf(cpf) {
    if (!validarCpf(cpf)) {
      throw new ValidationError('CPF inválido');
    }
    return limparCpf(cpf);
  }

  paraResposta({ cpf, nome, dataNascimento }) {
    return {
      cpf: formatarCpf(cpf),
      nome,
      dataNascimento,
      idade: calcularIdade(dataNascimento, this.relogio()),
    };
  }

  obter(cpf) {
    const pessoa = this.repositorio.get(this.chaveCpf(cpf));
    if (!pessoa) {
      throw new NotFoundError('Pessoa não encontrada');
    }
    return pessoa;
  }

  criar({ cpf, nome, dataNascimento } = {}) {
    const chave = this.chaveCpf(cpf);
    const pessoa = {
      cpf: chave,
      nome: validarNome(nome),
      dataNascimento: this.validarDataNascimento(dataNascimento),
    };

    if (this.repositorio.has(chave)) {
      throw new ConflictError('CPF já cadastrado');
    }

    this.repositorio.set(chave, pessoa);
    return this.paraResposta(pessoa);
  }

  listar() {
    return [...this.repositorio.values()]
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      .map((pessoa) => this.paraResposta(pessoa));
  }

  buscarPorCpf(cpf) {
    return this.paraResposta(this.obter(cpf));
  }

  atualizar(cpf, { nome, dataNascimento } = {}) {
    const atual = this.obter(cpf);
    const atualizada = {
      ...atual,
      nome: nome === undefined ? atual.nome : validarNome(nome),
      dataNascimento:
        dataNascimento === undefined
          ? atual.dataNascimento
          : this.validarDataNascimento(dataNascimento),
    };

    this.repositorio.set(atual.cpf, atualizada);
    return this.paraResposta(atualizada);
  }

  remover(cpf) {
    const pessoa = this.obter(cpf);
    this.repositorio.delete(pessoa.cpf);
  }
}

module.exports = { PessoaService };
