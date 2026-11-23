// Rotas públicas: catálogo de eventos aprovados (RF01, RF02) e categorias.
const { Router } = require('express');
const { db } = require('../config/firebase');
const { eventoPublico, porDataInicio } = require('../utils/serializar');

const router = Router();

// Testar conexão com o Firestore
router.get('/health', async (req, res) => {
  try {
    const resultado = await db.collection('categorias').count().get();
    res.json({ status: 'ok', banco: 'conectado', categorias: resultado.data().count });
  } catch (erro) {
    console.error('Erro no Firebase:', erro.message);
    res.status(500).json({ status: 'erro', mensagem: 'Erro ao conectar com o Firebase' });
  }
});

router.get('/categorias', async (req, res, next) => {
  try {
    const snapshot = await db.collection('categorias').get();
    const categorias = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    res.json(categorias);
  } catch (erro) {
    next(erro);
  }
});

// Listar eventos aprovados (RF01): pendentes e rejeitados nunca aparecem.
router.get('/eventos', async (req, res, next) => {
  try {
    const snapshot = await db.collection('eventos').where('status', '==', 'aprovado').get();
    res.json(snapshot.docs.map(eventoPublico).sort(porDataInicio));
  } catch (erro) {
    next(erro);
  }
});

// Detalhes de um evento aprovado (RF02).
router.get('/eventos/:id', async (req, res, next) => {
  try {
    const documento = await db.collection('eventos').doc(req.params.id).get();
    if (!documento.exists || documento.data().status !== 'aprovado') {
      return res.status(404).json({ mensagem: 'Evento não encontrado' });
    }
    res.json(eventoPublico(documento));
  } catch (erro) {
    next(erro);
  }
});

module.exports = router;
