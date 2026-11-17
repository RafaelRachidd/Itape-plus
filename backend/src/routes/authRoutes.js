// Rotas de cadastro e login.
const { Router } = require('express');
const { body } = require('express-validator');
const validar = require('../middlewares/validar');
const { autenticar } = require('../middlewares/autenticar');
const controller = require('../controllers/authController');

const router = Router();

const email = () =>
  body('email').trim().isEmail().withMessage('Informe um e-mail válido.')
    .isLength({ max: 150 }).withMessage('O e-mail pode ter até 150 caracteres.')
    .toLowerCase();

// POST /api/auth/cadastro  { nome, email, senha }
// Não existe campo de perfil: toda conta criada aqui é de organizador (RN08).
router.post(
  '/cadastro',
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Informe o nome (2 a 100 caracteres).'),
  email(),
  body('senha').isString().isLength({ min: 8, max: 72 }).withMessage('A senha deve ter pelo menos 8 caracteres.'),
  validar,
  controller.cadastrar
);

// POST /api/auth/login  { email, senha }
router.post(
  '/login',
  email(),
  body('senha').isString().notEmpty().withMessage('Informe a senha.'),
  validar,
  controller.entrar
);

// GET /api/auth/eu  (exige login)
router.get('/eu', autenticar, controller.eu);

module.exports = router;
