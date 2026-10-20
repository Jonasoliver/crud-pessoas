const { criarApp } = require('./app');

const PORTA = Number(process.env.PORT) || 3000;

criarApp().listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
