
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3001;

// Permitir acesso do front-end React
app.use(cors({
  origin: 'http://localhost:5173'
}));

// Permitir receber dados em JSON
app.use(express.json());

// Rota para verificar o funcionamento da API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    mensagem: 'API do Itape+ funcionando!'
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
