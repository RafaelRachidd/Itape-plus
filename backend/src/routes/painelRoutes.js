// Painel do organizador (RF06, RF07, RF08, RF11). Todas as rotas exigem login de organizador.
const { Router } = require('express');
const { matchedData } = require('express-validator');
const { Timestamp } = require('firebase-admin/firestore');
const { db } = require('../config/firebase');
const { autenticar, exigirPerfil } = require('../middlewares/autenticar');
const validar = require('../middlewares/validar');
const { validarEvento, dadosDoEvento } = require('../utils/validacoesEvento');
const { serializarEvento, maisRecentes } = require('../utils/serializar');

const router = Router();
router.use(autenticar, exigirPerfil('organizador'));

const eventos = () => db.collection('eventos');

function paraFirestore(dados) {
  return {
    ...dados,
    dataInicio: Timestamp.fromDate(dados.dataInicio),
    dataFim: dados.dataFim ? Timestamp.fromDate(dados.dataFim) : null,
  };
}

// RF08: só o dono altera o evento. Inexistente = 404; de outro organizador = 403.
async function buscarDoDono(req, res) {
  const documento = await eventos().doc(req.params.id).get();
  if (!documento.exists) {
    res.status(404).json({ mensagem: 'Evento não encontrado' });
    return null;
  }
  if (documento.data().organizadorId !== req.usuario.uid) {
    res.status(403).json({ mensagem: 'Você só pode alterar os eventos que cadastrou.' });
    return null;
  }
  return documento;
}

// RF07: lista os eventos do organizador com status e motivo de rejeição (RF11).
router.get('/eventos', async (req, res, next) => {
  try {
    const snapshot = await eventos().where('organizadorId', '==', req.usuario.uid).get();
    res.json(snapshot.docs.map(serializarEvento).sort(maisRecentes));
  } catch (erro) {
    next(erro);
  }
});

router.get('/eventos/:id', async (req, res, next) => {
  try {
    const documento = await buscarDoDono(req, res);
    if (documento) res.json(serializarEvento(documento));
  } catch (erro) {
    next(erro);
  }
});

// RF06: todo evento novo nasce pendente e só fica público depois de aprovado.
router.post('/eventos', validarEvento, validar, async (req, res, next) => {
  try {
    const agora = Timestamp.now();
    const referencia = await eventos().add({
      ...paraFirestore(dadosDoEvento(matchedData(req, { locations: ['body'] }))),
      status: 'pendente',
      motivoRejeicao: null,
      organizadorId: req.usuario.uid,
      organizadorNome: req.usuario.nomePublico || req.usuario.nome,
      criadoEm: agora,
      atualizadoEm: agora,
      moderadoPor: null,
      moderadoPorNome: null,
      moderadoEm: null,
    });
    res.status(201).json(serializarEvento(await referencia.get()));
  } catch (erro) {
    next(erro);
  }
});

// RF08: editar devolve o evento para a fila de moderação, mesmo se já estava aprovado.
router.put('/eventos/:id', validarEvento, validar, async (req, res, next) => {
  try {
    const documento = await buscarDoDono(req, res);
    if (!documento) return;
    await documento.ref.update({
      ...paraFirestore(dadosDoEvento(matchedData(req, { locations: ['body'] }))),
      status: 'pendente',
      motivoRejeicao: null,
      atualizadoEm: Timestamp.now(),
    });
    res.json(serializarEvento(await documento.ref.get()));
  } catch (erro) {
    next(erro);
  }
});

router.delete('/eventos/:id', async (req, res, next) => {
  try {
    const documento = await buscarDoDono(req, res);
    if (!documento) return;
    await documento.ref.delete();
    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
});

module.exports = router;
