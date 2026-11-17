// Regras do painel do organizador (RF08, RF09, RF10, RF16, RN05, RN06).
const { matchedData } = require('express-validator');
const eventoModel = require('../models/painelEventoModel');
const usuarioModel = require('../models/usuarioModel');

// Categoria inexistente chega como violação de chave estrangeira (código 23503).
function categoriaInvalida(erro, res) {
  if (erro.code !== '23503') return false;
  res.status(400).json({
    mensagem: 'Escolha uma categoria.',
    erros: [{ campo: 'categoria_id', mensagem: 'Escolha uma categoria.' }],
  });
  return true;
}

// RN06: só o dono mexe no evento. Inexistente = 404; de outro organizador = 403.
async function buscarDoDono(req, res) {
  const { id } = matchedData(req, { locations: ['params'] });
  const evento = await eventoModel.buscarPorId(id);
  if (!evento) {
    res.status(404).json({ mensagem: 'Evento não encontrado' });
    return null;
  }
  if (evento.organizador_id !== req.usuario.id) {
    res.status(403).json({ mensagem: 'Você só pode alterar os eventos que cadastrou.' });
    return null;
  }
  return evento;
}

async function listar(req, res, next) {
  try {
    res.json(await eventoModel.listarDoOrganizador(req.usuario.id));
  } catch (erro) {
    next(erro);
  }
}

async function detalhar(req, res, next) {
  try {
    const evento = await buscarDoDono(req, res);
    if (evento) res.json(evento);
  } catch (erro) {
    next(erro);
  }
}

async function criar(req, res, next) {
  try {
    const dados = matchedData(req, { locations: ['body'] });
    const evento = await eventoModel.criar(req.usuario.id, dados);
    res.status(201).json(evento);
  } catch (erro) {
    if (!categoriaInvalida(erro, res)) next(erro);
  }
}

async function atualizar(req, res, next) {
  try {
    const atual = await buscarDoDono(req, res);
    if (!atual) return;
    const dados = matchedData(req, { locations: ['body'] });
    res.json(await eventoModel.atualizar(atual.id, dados));
  } catch (erro) {
    if (!categoriaInvalida(erro, res)) next(erro);
  }
}

async function excluir(req, res, next) {
  try {
    const atual = await buscarDoDono(req, res);
    if (!atual) return;
    await eventoModel.excluir(atual.id);
    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
}

async function verPerfil(req, res, next) {
  try {
    res.json(await usuarioModel.buscarPorId(req.usuario.id));
  } catch (erro) {
    next(erro);
  }
}

async function atualizarPerfil(req, res, next) {
  try {
    const dados = matchedData(req, { locations: ['body'] });
    res.json(await usuarioModel.atualizarPerfil(req.usuario.id, dados));
  } catch (erro) {
    next(erro);
  }
}

module.exports = { listar, detalhar, criar, atualizar, excluir, verPerfil, atualizarPerfil };
