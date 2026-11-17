import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cadastrarConta, fazerLogin } from '../services/api';

// Guarda quem está logado. O token fica no localStorage e vai em toda
// chamada à API (services/api.js); a permissão de verdade é conferida na API.
const AuthContext = createContext(null);

function lerUsuarioSalvo() {
  try {
    return JSON.parse(localStorage.getItem('usuario')) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(lerUsuarioSalvo);

  const salvarSessao = useCallback(({ token, usuario: dados }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(dados));
    setUsuario(dados);
    return dados;
  }, []);

  const sair = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  }, []);

  const entrar = useCallback((dados) => fazerLogin(dados).then(salvarSessao), [salvarSessao]);
  const cadastrar = useCallback((dados) => cadastrarConta(dados).then(salvarSessao), [salvarSessao]);

  // Atualiza o nome exibido depois de editar o perfil.
  const atualizarUsuario = useCallback((dados) => {
    setUsuario((atual) => {
      const novo = { ...atual, ...dados };
      localStorage.setItem('usuario', JSON.stringify(novo));
      return novo;
    });
  }, []);

  // A API avisa (services/api.js) quando o token vence.
  useEffect(() => {
    window.addEventListener('sessao-expirada', sair);
    return () => window.removeEventListener('sessao-expirada', sair);
  }, [sair]);

  const valor = useMemo(
    () => ({ usuario, entrar, cadastrar, sair, atualizarUsuario }),
    [usuario, entrar, cadastrar, sair, atualizarUsuario]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
