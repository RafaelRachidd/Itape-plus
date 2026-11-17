// Rotas públicas de eventos (não exigem login).
const { Router } = require('express');
const { query, param } = require('express-validator');
const validar = require('../middlewares/validar');
const controller = require('../controllers/eventoController');

const router = Router();

const dataValida = (campo) =>
  query(campo).optional({ values: 'falsy' })
    .isISO8601({ strict: true }).withMessage(`${campo} deve estar no formato AAAA-MM-DD`);

// GET /api/eventos/proximos?limite=6
router.get(
  '/proximos',
  query('limite').optional().isInt({ min: 1, max: 24 }).withMessage('limite deve ser um número de 1 a 24').toInt(),
  validar,
  controller.proximos
);

// GET /api/eventos?busca=&categoria=&dataInicio=&dataFim=&gratuito=true
router.get(
  '/',
  query('busca').optional({ values: 'falsy' }).trim().isLength({ max: 100 }).withMessage('A busca pode ter até 100 caracteres'),
  query('categoria').optional({ values: 'falsy' }).trim().matches(/^[a-z0-9-]+$/).withMessage('Categoria inválida'),
  dataValida('dataInicio'),
  dataValida('dataFim'),
  query('gratuito').optional({ values: 'falsy' }).isBoolean().withMessage('gratuito deve ser true ou false').toBoolean(),
  validar,
  controller.listar
);

// GET /api/eventos/:id
router.get(
  '/:id',
  param('id').isInt({ min: 1 }).withMessage('Evento não encontrado').toInt(),
  validar,
  controller.detalhar
);

module.exports = router;
