// Rotas do painel do organizador. Todas exigem login com perfil organizador (RNF03).
const { Router } = require('express');
const { body, param } = require('express-validator');
const validar = require('../middlewares/validar');
const { autenticar, exigirPerfil } = require('../middlewares/autenticar');
const controller = require('../controllers/painelController');

const router = Router();
router.use(autenticar, exigirPerfil('organizador'));

const idValido = param('id').isInt({ min: 1 }).withMessage('Evento não encontrado').toInt();
const urlOpcional = (campo, nome) =>
  body(campo).optional({ values: 'falsy' }).trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage(`${nome} deve começar com http:// ou https://`)
    .isLength({ max: 500 }).withMessage(`${nome} pode ter até 500 caracteres.`);

// Validação do formulário de evento (RF08, RNF04): cada erro volta com o nome do campo.
const validarEvento = [
  body('titulo').trim().isLength({ min: 3, max: 150 }).withMessage('Informe o título (3 a 150 caracteres).'),
  body('categoria_id').isInt({ min: 1 }).withMessage('Escolha uma categoria.').toInt(),
  body('descricao').trim().isLength({ min: 10, max: 5000 }).withMessage('Descreva o evento (pelo menos 10 caracteres).'),
  body('data_inicio')
    .isISO8601({ strict: true }).withMessage('Informe a data e o horário de início.')
    .custom((valor) => {
      // Comparação no horário de Brasília (UTC-3), o mesmo do formulário.
      const agora = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 16);
      if (valor.slice(0, 16) < agora) throw new Error('A data de início não pode estar no passado.');
      return true;
    }),
  body('data_fim')
    .optional({ values: 'falsy' })
    .isISO8601({ strict: true }).withMessage('Data de término inválida.')
    .custom((valor, { req }) => {
      if (req.body.data_inicio && valor < req.body.data_inicio) {
        throw new Error('O término deve ser depois do início.');
      }
      return true;
    }),
  body('local_nome').trim().isLength({ min: 2, max: 150 }).withMessage('Informe o nome do local.'),
  body('endereco').trim().isLength({ min: 5, max: 255 }).withMessage('Informe o endereço completo.'),
  body('cidade').optional({ values: 'falsy' }).trim().isLength({ max: 100 }).withMessage('Cidade muito longa.'),
  body('gratuito').isBoolean().withMessage('Informe se o evento é gratuito.').toBoolean(true),
  body('preco').custom((valor, { req }) => {
    const gratuito = req.body.gratuito === true || req.body.gratuito === 'true';
    if (gratuito) return true;
    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero <= 0 || numero > 99999) {
      throw new Error('Informe o preço do ingresso (maior que zero).');
    }
    return true;
  }).customSanitizer((valor, { req }) =>
    (req.body.gratuito === true || req.body.gratuito === 'true') ? null : Number(valor)),
  urlOpcional('link_inscricao', 'O link de inscrição'),
  urlOpcional('imagem_url', 'A URL da imagem'),
];

router.get('/eventos', controller.listar);
router.get('/eventos/:id', idValido, validar, controller.detalhar);
router.post('/eventos', validarEvento, validar, controller.criar);
router.put('/eventos/:id', idValido, validarEvento, validar, controller.atualizar);
router.delete('/eventos/:id', idValido, validar, controller.excluir);

router.get('/perfil', controller.verPerfil);
router.put(
  '/perfil',
  body('nome_publico').trim().isLength({ min: 2, max: 100 }).withMessage('Informe o nome público (2 a 100 caracteres).'),
  body('descricao').optional({ values: 'falsy' }).trim().isLength({ max: 1000 }).withMessage('A descrição pode ter até 1000 caracteres.'),
  body('contato').optional({ values: 'falsy' }).trim().isLength({ max: 150 }).withMessage('O contato pode ter até 150 caracteres.'),
  validar,
  controller.atualizarPerfil
);

module.exports = router;
