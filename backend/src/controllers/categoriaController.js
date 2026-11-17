const categoriaModel = require('../models/categoriaModel');

async function listar(req, res, next) {
  try {
    res.json(await categoriaModel.listar());
  } catch (erro) {
    next(erro);
  }
}

module.exports = { listar };
