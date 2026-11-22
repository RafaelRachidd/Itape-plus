// Validação do formulário de evento (RF06, RF08, RF12, RNF04).
// O formulário envia datas no formato do <input type="datetime-local"> (horário de Brasília).
const { body } = require('express-validator');
const { db } = require('../config/firebase');

const FUSO_BRASILIA = '-03:00';

// "2026-11-24T19:00" -> Date no horário de Brasília. Aceita também texto com fuso.
function paraData(valor) {
  if (valor instanceof Date) return valor;
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(valor)) return null;
  const temFuso = /(Z|[+-]\d{2}:\d{2})$/.test(valor);
  const texto = temFuso ? valor : `${valor.slice(0, 16)}:00${FUSO_BRASILIA}`;
  const data = new Date(texto);
  return Number.isNaN(data.getTime()) ? null : data;
}

const urlOpcional = (campo, nome) =>
  body(campo).optional({ values: 'falsy' }).trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage(`${nome} deve começar com http:// ou https://`)
    .isLength({ max: 500 }).withMessage(`${nome} pode ter até 500 caracteres.`);

const ehGratuito = (req) => req.body.gratuito === true || req.body.gratuito === 'true';

const validarEvento = [
  body('titulo').isString().withMessage('Informe o título (3 a 150 caracteres).').bail()
    .trim().isLength({ min: 3, max: 150 }).withMessage('Informe o título (3 a 150 caracteres).'),
  body('categoriaId').isString().withMessage('Escolha uma categoria.').bail().trim()
    .custom(async (valor) => {
      const categoria = valor ? await db.collection('categorias').doc(valor).get() : null;
      if (!categoria?.exists) throw new Error('Escolha uma categoria.');
      return true;
    }),
  body('descricao').isString().withMessage('Descreva o evento (pelo menos 10 caracteres).').bail()
    .trim().isLength({ min: 10, max: 5000 }).withMessage('Descreva o evento (pelo menos 10 caracteres).'),
  body('dataInicio').custom((valor) => {
    const data = paraData(valor);
    if (!data) throw new Error('Informe a data e o horário de início.');
    if (data.getTime() < Date.now() - 60 * 1000) throw new Error('A data de início não pode estar no passado.');
    return true;
  }).customSanitizer(paraData),
  body('dataFim').optional({ values: 'falsy' }).custom((valor, { req }) => {
    const fim = paraData(valor);
    if (!fim) throw new Error('Data de término inválida.');
    const inicio = paraData(req.body.dataInicio);
    if (inicio && fim < inicio) throw new Error('O término deve ser depois do início.');
    return true;
  }).customSanitizer(paraData),
  body('localNome').isString().withMessage('Informe o nome do local.').bail()
    .trim().isLength({ min: 2, max: 150 }).withMessage('Informe o nome do local.'),
  body('endereco').isString().withMessage('Informe o endereço completo.').bail()
    .trim().isLength({ min: 5, max: 255 }).withMessage('Informe o endereço completo.'),
  body('cidade').optional({ values: 'falsy' }).isString().trim()
    .isLength({ max: 100 }).withMessage('A cidade pode ter até 100 caracteres.'),
  body('gratuito').isBoolean().withMessage('Informe se o evento é gratuito.').toBoolean(true),
  body('preco').custom((valor, { req }) => {
    if (ehGratuito(req)) return true;
    const numero = Number(valor);
    if (valor === '' || valor == null || !Number.isFinite(numero) || numero <= 0 || numero > 99999) {
      throw new Error('Informe o preço do ingresso (maior que zero).');
    }
    return true;
  }).customSanitizer((valor, { req }) => (ehGratuito(req) ? null : Math.round(Number(valor) * 100) / 100)),
  urlOpcional('linkInscricao', 'O link de inscrição'),
  urlOpcional('imagemUrl', 'A URL da imagem'),
  body('programacao').optional({ values: 'null' })
    .isArray({ max: 20 }).withMessage('A programação pode ter até 20 atividades.'),
  body('programacao.*.titulo').isString().withMessage('Informe o nome de cada atividade.').bail()
    .trim().isLength({ min: 2, max: 150 }).withMessage('Informe o nome de cada atividade.'),
  body('programacao.*.horario').optional({ values: 'falsy' }).isString().trim()
    .isLength({ max: 20 }).withMessage('Horário da atividade muito longo.'),
];

// Monta o objeto gravado no Firestore apenas com os campos validados.
function dadosDoEvento(dados) {
  return {
    titulo: dados.titulo,
    categoriaId: dados.categoriaId,
    descricao: dados.descricao,
    dataInicio: dados.dataInicio,
    dataFim: dados.dataFim || null,
    localNome: dados.localNome,
    endereco: dados.endereco,
    cidade: dados.cidade || 'Itapetininga',
    gratuito: dados.gratuito,
    preco: dados.gratuito ? null : dados.preco,
    linkInscricao: dados.linkInscricao || null,
    imagemUrl: dados.imagemUrl || null,
    programacao: (dados.programacao || []).map((item) => ({
      horario: item.horario || '',
      titulo: item.titulo,
    })),
  };
}

module.exports = { validarEvento, dadosDoEvento, paraData };
