// Regras do catálogo público de eventos.
const { matchedData } = require('express-validator');
const eventoModel = require('../models/eventoModel');

async function proximos(req, res, next) {
  try {
    const { limite = 6 } = matchedData(req, { locations: ['query'] });
    res.json(await eventoModel.listarProximos(limite));
  } catch (erro) {
    next(erro);
  }
}

async function listar(req, res, next) {
  try {
    const filtros = matchedData(req, { locations: ['query'] });
    if (filtros.dataInicio && filtros.dataFim && filtros.dataFim < filtros.dataInicio) {
      return res.status(400).json({ mensagem: 'A data final deve ser igual ou posterior à data inicial.' });
    }
    res.json(await eventoModel.listarAprovados(filtros));
  } catch (erro) {
    next(erro);
  }
}

async function detalhar(req, res, next) {
  try {
    const { id } = matchedData(req, { locations: ['params'] });
    const evento = await eventoModel.buscarAprovadoPorId(id);
    // Pendente, rejeitado ou inexistente: para o visitante, simplesmente não existe.
    if (!evento) return res.status(404).json({ mensagem: 'Evento não encontrado' });
    res.json(evento);
  } catch (erro) {
    next(erro);
  }
}

module.exports = { proximos, listar, detalhar };
