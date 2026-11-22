// Autenticação (RF05, RNF03): o frontend envia o ID token do Firebase Authentication
// no cabeçalho Authorization; o backend confere o token e carrega o perfil no Firestore.
const { Timestamp } = require('firebase-admin/firestore');
const { db, auth } = require('../config/firebase');

async function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ mensagem: 'Faça login para continuar.' });
  }

  let dadosToken;
  try {
    dadosToken = await auth.verifyIdToken(token);
  } catch {
    return res.status(401).json({ mensagem: 'Sessão expirada. Entre novamente.' });
  }

  if (!dadosToken.email_verified) {
    return res.status(403).json({ mensagem: 'Confirme seu e-mail antes de acessar o painel.' });
  }

  try {
    const referencia = db.collection('usuarios').doc(dadosToken.uid);
    let documento = await referencia.get();

    // Primeiro acesso: o perfil nasce sempre como organizador (RN08: administrador só por script).
    if (!documento.exists) {
      const nome = (dadosToken.name || dadosToken.email.split('@')[0]).slice(0, 100);
      await referencia.set({
        nome,
        email: dadosToken.email,
        perfil: 'organizador',
        nomePublico: nome,
        descricao: '',
        contato: '',
        criadoEm: Timestamp.now(),
      });
      documento = await referencia.get();
    }

    req.usuario = { uid: dadosToken.uid, ...documento.data() };
    next();
  } catch (erro) {
    next(erro);
  }
}

// Autorização por perfil (RNF03): 403 quando o perfil não tem acesso à rota.
function exigirPerfil(...perfis) {
  return (req, res, next) => {
    if (!perfis.includes(req.usuario?.perfil)) {
      return res.status(403).json({ mensagem: 'Você não tem permissão para acessar esta área.' });
    }
    next();
  };
}

module.exports = { autenticar, exigirPerfil };
