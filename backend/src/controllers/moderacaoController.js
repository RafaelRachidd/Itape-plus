// Regras da moderação: só o administrador aprova ou rejeita (RN03).
const { matchedData } = require('express-validator');
const moderacaoModel = require('../models/moderacaoModel');

async function resumo(req, res, next) {
  try {
    res.json(await moderacaoModel.contarPorStatus());
  } catch (erro) {
    next(erro);
  }
}

async function listar(req, res, next) {
  try {
    const { status = 'pendente' } = matchedData(req, { locations: ['query'] });
    res.json(await moderacaoModel.listarPorStatus(status));
  } catch (erro) {
    next(erro);
  }
}

async function detalhar(req, res, next) {
  try {
    const { id } = matchedData(req, { locations: ['params'] });
    const evento = await moderacaoModel.buscarPorId(id);
    if (!evento) return res.status(404).json({ mensagem: 'Evento não encontrado' });
    return res.json(evento);
  } catch (erro) {
    return next(erro);
  }
}

// Só eventos pendentes podem ser moderados: evita aprovar algo que o organizador acabou de editar.
async function moderar(req, res, next, acao) {
  try {
    const { id, motivo } = matchedData(req);
    const evento = await moderacaoModel.buscarPorId(id);
    if (!evento) return res.status(404).json({ mensagem: 'Evento não encontrado' });
    if (evento.status !== 'pendente') {
      return res.status(409).json({ mensagem: 'Este evento já foi moderado. Atualize a lista.' });
    }
    const atualizado = acao === 'aprovar'
      ? await moderacaoModel.aprovar(id)
      : await moderacaoModel.rejeitar(id, motivo);
    return res.json(atualizado);
  } catch (erro) {
    return next(erro);
  }
}

const aprovar = (req, res, next) => moderar(req, res, next, 'aprovar');
const rejeitar = (req, res, next) => moderar(req, res, next, 'rejeitar');

module.exports = { resumo, listar, detalhar, aprovar, rejeitar };
