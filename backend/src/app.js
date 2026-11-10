// API Express do Itape + usando Firebase Firestore.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./config/firebase');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Verifica se a API consegue consultar o Firestore.
// Uma coleção vazia retorna 0 categorias e ainda significa que a conexão funcionou.
app.get('/api/health', async (req, res) => {
  try {
    const resultado = await db.collection('categorias').count().get();
    res.json({
      status: 'ok',
      banco: 'conectado',
      categorias: resultado.data().count,
    });
  } catch (erro) {
    console.error('Erro ao acessar o Firestore:', erro.message);
    res.status(500).json({ status: 'erro', mensagem: 'Falha ao consultar o banco de dados.' });
  }
});

// As rotas de /api/eventos, /api/auth e /api/admin serão implementadas nas próximas etapas.
app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada' });
});

module.exports = app;
