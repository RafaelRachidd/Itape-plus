// Ponto de entrada: sobe o servidor HTTP.
require('dotenv').config({ quiet: true });

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET não definida. Preencha o .env (veja o .env.example).');
  process.exit(1);
}

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API do Itape + rodando em http://localhost:${PORT}`);
});
