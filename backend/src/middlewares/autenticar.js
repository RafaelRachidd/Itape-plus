// Confere o token JWT enviado no cabeçalho "Authorization: Bearer <token>".
// Sem token ou com token inválido: 401 (RNF03).
const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ mensagem: 'Faça login para continuar.' });
  }

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id: dados.id, perfil: dados.perfil, nome: dados.nome };
    return next();
  } catch {
    return res.status(401).json({ mensagem: 'Sua sessão expirou. Faça login novamente.' });
  }
}

// Libera a rota só para os perfis informados. Perfil errado: 403 (RNF03).
function exigirPerfil(...perfis) {
  return (req, res, next) => {
    if (!perfis.includes(req.usuario?.perfil)) {
      return res.status(403).json({ mensagem: 'Você não tem permissão para acessar esta área.' });
    }
    return next();
  };
}

module.exports = { autenticar, exigirPerfil };
