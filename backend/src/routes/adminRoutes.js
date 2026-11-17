// Rotas da moderação. Todas exigem login com perfil admin (RNF03).
const { Router } = require('express');
const { body, param, query } = require('express-validator');
const validar = require('../middlewares/validar');
const { autenticar, exigirPerfil } = require('../middlewares/autenticar');
const controller = require('../controllers/moderacaoController');

const router = Router();
router.use(autenticar, exigirPerfil('admin'));

const idValido = param('id').isInt({ min: 1 }).withMessage('Evento não encontrado').toInt();

// GET /api/admin/resumo  → { pendente, aprovado, rejeitado }
router.get('/resumo', controller.resumo);

// GET /api/admin/eventos?status=pendente|aprovado|rejeitado
router.get(
  '/eventos',
  query('status').optional().isIn(['pendente', 'aprovado', 'rejeitado']).withMessage('Status inválido.'),
  validar,
  controller.listar
);

router.get('/eventos/:id', idValido, validar, controller.detalhar);

// PATCH /api/admin/eventos/:id/aprovar
router.patch('/eventos/:id/aprovar', idValido, validar, controller.aprovar);

// PATCH /api/admin/eventos/:id/rejeitar  { motivo }
router.patch(
  '/eventos/:id/rejeitar',
  idValido,
  body('motivo').trim().isLength({ min: 5, max: 500 }).withMessage('Informe o motivo da rejeição (5 a 500 caracteres).'),
  validar,
  controller.rejeitar
);

module.exports = router;
