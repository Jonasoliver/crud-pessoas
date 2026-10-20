const request = require('supertest');
const { criarApp } = require('../../src/app');
const { PessoaService } = require('../../src/services/pessoaService');

describe('API /api/pessoas (integração)', () => {
  let app;

  const maria = { cpf: '529.982.247-25', nome: 'Maria Silva', dataNascimento: '2000-01-15' };
  const joao = { cpf: '111.444.777-35', nome: 'João Souza', dataNascimento: '1990-12-25' };

  beforeEach(() => {
    const service = new PessoaService({ relogio: () => new Date(2026, 9, 20) });
    app = criarApp({ service });
  });

  it('GET /health responde que a aplicação está no ar', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  describe('POST /api/pessoas', () => {
    it('cria uma pessoa e retorna 201 com a idade calculada', async () => {
      const res = await request(app).post('/api/pessoas').send(maria);
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ ...maria, idade: 26 });
    });

    it('retorna 400 para CPF inválido', async () => {
      const res = await request(app)
        .post('/api/pessoas')
        .send({ ...maria, cpf: '000.000.000-01' });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ erro: 'CPF inválido' });
    });

    it('retorna 400 para data de nascimento no futuro', async () => {
      const res = await request(app)
        .post('/api/pessoas')
        .send({ ...maria, dataNascimento: '2099-01-01' });
      expect(res.status).toBe(400);
      expect(res.body.erro).toBe('Data de nascimento não pode ser no futuro');
    });

    it('retorna 400 para JSON malformado', async () => {
      const res = await request(app)
        .post('/api/pessoas')
        .set('Content-Type', 'application/json')
        .send('{"cpf":');
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ erro: 'JSON inválido' });
    });

    it('retorna 409 para CPF duplicado', async () => {
      await request(app).post('/api/pessoas').send(maria);
      const res = await request(app).post('/api/pessoas').send(maria);
      expect(res.status).toBe(409);
      expect(res.body).toEqual({ erro: 'CPF já cadastrado' });
    });
  });

  describe('GET /api/pessoas', () => {
    it('lista as pessoas cadastradas', async () => {
      await request(app).post('/api/pessoas').send(maria);
      await request(app).post('/api/pessoas').send(joao);

      const res = await request(app).get('/api/pessoas');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        { ...joao, idade: 35 },
        { ...maria, idade: 26 },
      ]);
    });
  });

  describe('GET /api/pessoas/:cpf', () => {
    it('busca uma pessoa pelo CPF', async () => {
      await request(app).post('/api/pessoas').send(maria);
      const res = await request(app).get('/api/pessoas/52998224725');
      expect(res.status).toBe(200);
      expect(res.body.nome).toBe('Maria Silva');
    });

    it('retorna 404 quando não encontra', async () => {
      const res = await request(app).get('/api/pessoas/52998224725');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ erro: 'Pessoa não encontrada' });
    });
  });

  describe('PUT /api/pessoas/:cpf', () => {
    it('atualiza os dados e recalcula a idade', async () => {
      await request(app).post('/api/pessoas').send(maria);
      const res = await request(app)
        .put('/api/pessoas/52998224725')
        .send({ nome: 'Maria Oliveira', dataNascimento: '1980-05-10' });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        cpf: '529.982.247-25',
        nome: 'Maria Oliveira',
        dataNascimento: '1980-05-10',
        idade: 46,
      });
    });

    it('retorna 404 para CPF inexistente', async () => {
      const res = await request(app).put('/api/pessoas/52998224725').send({ nome: 'X' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/pessoas/:cpf', () => {
    it('remove a pessoa e retorna 204', async () => {
      await request(app).post('/api/pessoas').send(maria);
      const res = await request(app).delete('/api/pessoas/52998224725');
      expect(res.status).toBe(204);

      const busca = await request(app).get('/api/pessoas/52998224725');
      expect(busca.status).toBe(404);
    });

    it('retorna 404 para CPF inexistente', async () => {
      const res = await request(app).delete('/api/pessoas/52998224725');
      expect(res.status).toBe(404);
    });
  });

  it('fluxo completo: cria, consulta, atualiza e remove', async () => {
    expect((await request(app).post('/api/pessoas').send(maria)).status).toBe(201);
    expect((await request(app).get('/api/pessoas')).body).toHaveLength(1);
    expect(
      (await request(app).put('/api/pessoas/529.982.247-25').send({ nome: 'Maria S.' })).body.nome,
    ).toBe('Maria S.');
    expect((await request(app).delete('/api/pessoas/529.982.247-25')).status).toBe(204);
    expect((await request(app).get('/api/pessoas')).body).toEqual([]);
  });
});
