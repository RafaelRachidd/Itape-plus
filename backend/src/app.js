
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

 // Listar eventos aprovados
app.get('/api/eventos', async (req, res) => {
  try {
    const snapshot = await db.collection('eventos')
      .where('status', '==', 'aprovado')
      .get();

   
const eventos = snapshot.docs.map(doc => {
  const dados = doc.data();

  return {
    id: doc.id,
    ...dados,
    dataInicio: dados.dataInicio
      ? dados.dataInicio.toDate().toISOString()
      : null
  };
});


    res.json(eventos);

  } catch (erro) {
    console.error('Erro ao buscar eventos:', erro.message);

    res.status(500).json({
      mensagem: 'Erro ao carregar eventos'
    });
  }
});


app.get('/api/eventos/:id', async (req, res) => {
  try {
    const documento = await db
      .collection('eventos')
      .doc(req.params.id)
      .get();

    if (!documento.exists || documento.data().status !== 'aprovado') {
      return res.status(404).json({
        mensagem: 'Evento não encontrado'
      });
    }

    const dados = documento.data();

    res.json({
      id: documento.id,
      ...dados,
      dataInicio: dados.dataInicio
        ? dados.dataInicio.toDate().toISOString()
        : null,
      dataFim: dados.dataFim?.toDate
        ? dados.dataFim.toDate().toISOString()
        : null
    });
  } catch (erro) {
    console.error('Erro ao buscar evento:', erro.message);

    res.status(500).json({
      mensagem: 'Erro ao carregar evento'
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
