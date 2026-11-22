// Configuração do Express: segurança, CORS, JSON e rotas da API.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const publicoRoutes = require('./routes/publicoRoutes');
const euRoutes = require('./routes/euRoutes');
const painelRoutes = require('./routes/painelRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}));
app.use(express.json({ limit: '100kb' }));

app.use('/api', publicoRoutes);
app.use('/api/eu', euRoutes);
app.use('/api/painel', painelRoutes);
app.use('/api/admin', adminRoutes);

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada' });
});

// Erros inesperados: registra no terminal e responde sem expor detalhes internos.
app.use((erro, req, res, next) => {
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ mensagem: 'Dados enviados em formato inválido.' });
  }
  console.error('Erro na API:', erro.message);
  res.status(500).json({ mensagem: 'Erro interno. Tente novamente em instantes.' });
});

module.exports = app;
