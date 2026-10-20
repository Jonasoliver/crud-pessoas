const path = require('node:path');
const express = require('express');
const { PessoaService } = require('./services/pessoaService');
const { AppError } = require('./errors');

/**
 * Cria a aplicação Express. O serviço é injetável para facilitar os testes.
 * @param {object} [opcoes]
 * @param {PessoaService} [opcoes.service]
 */
function criarApp({ service = new PessoaService() } = {}) {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/pessoas', (req, res) => {
    res.json(service.listar());
  });

  app.get('/api/pessoas/:cpf', (req, res) => {
    res.json(service.buscarPorCpf(req.params.cpf));
  });

  app.post('/api/pessoas', (req, res) => {
    res.status(201).json(service.criar(req.body));
  });

  app.put('/api/pessoas/:cpf', (req, res) => {
    res.json(service.atualizar(req.params.cpf, req.body));
  });

  app.delete('/api/pessoas/:cpf', (req, res) => {
    service.remover(req.params.cpf);
    res.status(204).end();
  });

  // eslint-disable-next-line no-unused-vars
  app.use((erro, req, res, next) => {
    if (erro instanceof AppError) {
      return res.status(erro.status).json({ erro: erro.message });
    }
    if (erro.type === 'entity.parse.failed') {
      return res.status(400).json({ erro: 'JSON inválido' });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  });

  return app;
}

module.exports = { criarApp };
