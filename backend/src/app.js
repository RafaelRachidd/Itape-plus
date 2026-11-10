
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Conexão com o Firebase
const db = require('./config/firebase');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());

// Testar conexão com o Firestore
app.get('/api/health', async (req, res) => {
  try {
    const resultado = await db.collection('categorias').count().get();

    res.json({
      status: 'ok',
      banco: 'conectado',
      categorias: resultado.data().count
    });

  } catch (erro) {
    console.error('Erro no Firebase:', erro.message);

    res.status(500).json({
      status: 'erro',
      mensagem: 'Erro ao conectar com o Firebase'
    });
  }
});

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({
    mensagem: 'Rota não encontrada'
  });
});

module.exports = app;
