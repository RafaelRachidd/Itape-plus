// Perfil de quem está logado: usado pelo frontend para saber o perfil e o nome público.
const { Router } = require('express');
const { body, matchedData } = require('express-validator');
const { db } = require('../config/firebase');
const { autenticar } = require('../middlewares/autenticar');
const validar = require('../middlewares/validar');

const router = Router();
router.use(autenticar);

function perfilPublico(usuario) {
  const { uid, nome, email, perfil, nomePublico, descricao, contato } = usuario;
  return { uid, nome, email, perfil, nomePublico, descricao, contato };
}

router.get('/', (req, res) => {
  res.json(perfilPublico(req.usuario));
});

router.put(
  '/',
  body('nomePublico').isString().withMessage('Informe o nome público (2 a 100 caracteres).').bail()
    .trim().isLength({ min: 2, max: 100 }).withMessage('Informe o nome público (2 a 100 caracteres).'),
  body('descricao').optional({ values: 'null' }).isString().trim()
    .isLength({ max: 1000 }).withMessage('A descrição pode ter até 1000 caracteres.'),
  body('contato').optional({ values: 'null' }).isString().trim()
    .isLength({ max: 150 }).withMessage('O contato pode ter até 150 caracteres.'),
  validar,
  async (req, res, next) => {
    try {
      const dados = matchedData(req, { locations: ['body'] });
      const alteracoes = {
        nomePublico: dados.nomePublico,
        descricao: dados.descricao || '',
        contato: dados.contato || '',
      };
      await db.collection('usuarios').doc(req.usuario.uid).update(alteracoes);

      // O nome exibido nos eventos acompanha o nome público do organizador.
      const eventos = await db.collection('eventos').where('organizadorId', '==', req.usuario.uid).get();
      if (!eventos.empty) {
        const lote = db.batch();
        eventos.docs.forEach((doc) => lote.update(doc.ref, { organizadorNome: dados.nomePublico }));
        await lote.commit();
      }

      res.json(perfilPublico({ ...req.usuario, ...alteracoes }));
    } catch (erro) {
      next(erro);
    }
  },
);

module.exports = router;
