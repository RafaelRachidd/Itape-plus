// Ponto de entrada: sobe o servidor HTTP.
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API do Itape + rodando em http://localhost:${PORT}`);
});
