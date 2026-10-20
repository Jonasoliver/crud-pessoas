# CRUD de Pessoas

Aplicação em JavaScript (Node.js + Express) para cadastro de pessoas com **CPF**, **nome** e **data de nascimento**, com cálculo automático da **idade**.

Desenvolvida com **TDD**: em cada funcionalidade, os testes foram escritos primeiro (RED) e a implementação depois (GREEN), como mostra o histórico de commits.

## Funcionalidades

- Cadastrar, listar, buscar, atualizar e excluir pessoas
- Validação de CPF pelos dígitos verificadores (aceita com ou sem máscara)
- Cálculo da idade em anos completos (inclusive para nascidos em 29/02)
- Interface web simples em `http://localhost:3000`

## API

| Método | Rota                | Descrição                     |
| ------ | ------------------- | ----------------------------- |
| GET    | `/api/pessoas`      | Lista todas as pessoas        |
| GET    | `/api/pessoas/:cpf` | Busca uma pessoa pelo CPF     |
| POST   | `/api/pessoas`      | Cadastra uma pessoa           |
| PUT    | `/api/pessoas/:cpf` | Atualiza nome e/ou nascimento |
| DELETE | `/api/pessoas/:cpf` | Remove uma pessoa             |
| GET    | `/health`           | Verifica se a API está no ar  |

Exemplo de cadastro:

```json
POST /api/pessoas
{ "cpf": "529.982.247-25", "nome": "Maria Silva", "dataNascimento": "2000-01-15" }

201 Created
{ "cpf": "529.982.247-25", "nome": "Maria Silva", "dataNascimento": "2000-01-15", "idade": 26 }
```

## Como rodar

```bash
npm install
npm start
```

## Qualidade

```bash
npm run lint              # análise estática (ESLint)
npm run format:check      # formatação (Prettier)
npm run test:unit         # testes unitários
npm run test:integration  # testes de integração (supertest)
npm run test:coverage     # todos os testes com cobertura
```

O GitHub Actions (`.github/workflows/ci.yml`) roda lint, formatação, testes e o build da imagem a cada pull request.

## Docker

```bash
docker build -t crud-pessoas .
docker run -d -p 3000:3000 --name crud-pessoas crud-pessoas
```

## Estrutura

```
src/
  app.js                    # rotas Express e tratamento de erros
  server.js                 # inicialização do servidor
  errors.js                 # erros de domínio (400, 404, 409)
  services/pessoaService.js # regras do CRUD
  utils/cpf.js              # validação/formatação de CPF
  utils/idade.js            # cálculo da idade
public/index.html           # interface web
tests/unit/                 # testes unitários
tests/integration/          # testes de integração da API
```
