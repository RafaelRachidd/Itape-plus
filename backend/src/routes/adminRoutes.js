// Moderação (RF09, RF10). Todas as rotas exigem login de administrador.
const { Router } = require('express');
const { body, query, matchedData } = require('express-validator');
const { Timestamp } = require('firebase-admin/firestore');
const { db } = require('../config/firebase');
const { autenticar, exigirPerfil } = require('../middlewares/autenticar');
const validar = require('../middlewares/validar');
const { serializarEvento, maisRecentes } = require('../utils/serializar');

const router = Router();
router.use(autenticar, exigirPerfil('administrador'));

const STATUS = ['pendente', 'aprovado', 'rejeitado'];
const eventos = () => db.collection('eventos');

// Quantidade de eventos em cada status, para os cartões do topo da tela.
router.get('/resumo', async (req, res, next) => {
  try {
    const contagens = await Promise.all(
      STATUS.map((status) => eventos().where('status', '==', status).count().get()),
    );
    res.json(Object.fromEntries(STATUS.map((status, i) => [status, contagens[i].data().count])));
  } catch (erro) {
    next(erro);
  }
});

// RF09: fila de eventos pendentes (padrão) ou lista por status.
router.get(
  '/eventos',
  query('status').optional().isIn(STATUS).withMessage('Status inválido.'),
  validar,
  async (req, res, next) => {
    try {
      const status = req.query.status || 'pendente';
      const snapshot = await eventos().where('status', '==', status).get();
      const lista = snapshot.docs.map(serializarEvento);
      // Pendentes: os mais antigos primeiro (fila); demais: os mais recentes primeiro.
      lista.sort(status === 'pendente' ? (a, b) => maisRecentes(b, a) : maisRecentes);
      res.json(lista);
    } catch (erro) {
      next(erro);
    }
  },
);

router.get('/eventos/:id', async (req, res, next) => {
  try {
    const documento = await eventos().doc(req.params.id).get();
    if (!documento.exists) return res.status(404).json({ mensagem: 'Evento não encontrado' });
    res.json(serializarEvento(documento));
  } catch (erro) {
    next(erro);
  }
});

// RF10: aprovar ou rejeitar registra quem moderou e quando.
async function moderar(req, res, next, status, motivo = null) {
  try {
    const referencia = eventos().doc(req.params.id);
    const documento = await referencia.get();
    if (!documento.exists) return res.status(404).json({ mensagem: 'Evento não encontrado' });
    if (documento.data().status !== 'pendente') {
      return res.status(409).json({ mensagem: 'Este evento já foi moderado. Atualize a lista.' });
    }
    await referencia.update({
      status,
      motivoRejeicao: motivo,
      moderadoPor: req.usuario.uid,
      moderadoPorNome: req.usuario.nome,
      moderadoEm: Timestamp.now(),
    });
    res.json(serializarEvento(await referencia.get()));
  } catch (erro) {
    next(erro);
  }
}

router.patch('/eventos/:id/aprovar', (req, res, next) => moderar(req, res, next, 'aprovado'));

// RF11: a rejeição exige motivo, que aparece para o organizador no painel.
router.patch(
  '/eventos/:id/rejeitar',
  body('motivo').isString().withMessage('Explique o motivo da rejeição (10 a 500 caracteres).').bail()
    .trim().isLength({ min: 10, max: 500 }).withMessage('Explique o motivo da rejeição (10 a 500 caracteres).'),
  validar,
  (req, res, next) => moderar(req, res, next, 'rejeitado', matchedData(req).motivo),
);

module.exports = router;
