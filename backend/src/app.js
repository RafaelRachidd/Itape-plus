// Configuração do Express: middlewares globais e rotas.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pool = require('./config/db');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Verificação: confirma que a API e o banco estão no ar.
app.get('/api/health', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM categorias');
    res.json({ status: 'ok', banco: 'conectado', categorias: rows[0].total });
  } catch (erro) {
    res.status(500).json({ status: 'erro', mensagem: erro.message });
  }
});

// Catálogo público (v0.2.0). /api/auth e /api/admin entram nas próximas versões.
app.use('/api/categorias', require('./routes/categoriaRoutes'));
app.use('/api/eventos', require('./routes/eventoRoutes'));

// Rota inexistente.
app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada' });
});

// Erro inesperado: registra no terminal e devolve mensagem genérica (sem expor detalhes do banco).
app.use((erro, req, res, next) => {
  console.error(erro);
  res.status(500).json({ mensagem: 'Erro interno. Tente novamente em instantes.' });
});

module.exports = app;
