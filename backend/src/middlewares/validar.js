// Devolve os erros do express-validator com o nome de cada campo (RNF04).
const { validationResult } = require('express-validator');

function validar(req, res, next) {
  const resultado = validationResult(req);
  if (resultado.isEmpty()) return next();

  const erros = resultado.array({ onlyFirstError: true })
    .map((erro) => ({ campo: erro.path, mensagem: erro.msg }));
  res.status(400).json({ mensagem: erros[0].mensagem, erros });
}

module.exports = validar;
