// Devolve 400 com a mensagem do primeiro campo inválido (RNF04).
const { validationResult } = require('express-validator');

function validar(req, res, next) {
  const erros = validationResult(req);
  if (erros.isEmpty()) return next();

  const lista = erros.array().map((e) => ({ campo: e.path, mensagem: e.msg }));
  return res.status(400).json({ mensagem: lista[0].mensagem, erros: lista });
}

module.exports = validar;
