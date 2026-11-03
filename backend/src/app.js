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

// As rotas de /api/eventos, /api/auth e /api/admin entram nas próximas etapas.

// Rota inexistente.
app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada' });
});

module.exports = app;
