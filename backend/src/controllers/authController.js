// Cadastro e login (RF06, RF07).
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { matchedData } = require('express-validator');
const usuarioModel = require('../models/usuarioModel');

const VALIDADE_TOKEN = '8h';

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, perfil: usuario.perfil, nome: usuario.nome },
    process.env.JWT_SECRET,
    { expiresIn: VALIDADE_TOKEN }
  );
}

function resposta(usuario) {
  return { token: gerarToken(usuario), usuario };
}

async function cadastrar(req, res, next) {
  try {
    const { nome, email, senha } = matchedData(req, { locations: ['body'] });

    if (await usuarioModel.buscarPorEmailComSenha(email)) {
      return res.status(409).json({
        mensagem: 'Este e-mail já está cadastrado.',
        erros: [{ campo: 'email', mensagem: 'Este e-mail já está cadastrado.' }],
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10); // RNF02
    const usuario = await usuarioModel.criarOrganizador({ nome, email, senhaHash });
    return res.status(201).json(resposta(usuario));
  } catch (erro) {
    return next(erro);
  }
}

async function entrar(req, res, next) {
  try {
    const { email, senha } = matchedData(req, { locations: ['body'] });
    const encontrado = await usuarioModel.buscarPorEmailComSenha(email);

    // Mesma mensagem para e-mail inexistente e senha errada: não revela quais e-mails existem.
    const senhaConfere = encontrado && (await bcrypt.compare(senha, encontrado.senha_hash));
    if (!senhaConfere) {
      return res.status(401).json({ mensagem: 'E-mail ou senha inválidos' });
    }

    const { senha_hash, ...usuario } = encontrado;
    return res.json(resposta(usuario));
  } catch (erro) {
    return next(erro);
  }
}

// Dados atualizados de quem está logado.
async function eu(req, res, next) {
  try {
    const usuario = await usuarioModel.buscarPorId(req.usuario.id);
    if (!usuario) return res.status(401).json({ mensagem: 'Faça login para continuar.' });
    return res.json(usuario);
  } catch (erro) {
    return next(erro);
  }
}

module.exports = { cadastrar, entrar, eu };
