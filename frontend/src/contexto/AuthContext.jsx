import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, reload, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { buscarMeuPerfil } from '../services/api';

// Guarda quem está logado. O login é feito no Firebase Authentication;
// o perfil (organizador ou administrador) vem da API, que confere o token.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const entrando = useRef(false);

  // Ao abrir o site, recupera a sessão salva pelo Firebase.
  useEffect(() => onAuthStateChanged(auth, async (contaFirebase) => {
    if (entrando.current) return;
    if (!contaFirebase || !contaFirebase.emailVerified) {
      setUsuario(null);
      setCarregando(false);
      return;
    }
    try {
      setUsuario(await buscarMeuPerfil());
    } catch {
      setUsuario(null);
    } finally {
      setCarregando(false);
    }
  }), []);

  const entrar = useCallback(async (email, senha) => {
    entrando.current = true;
    try {
      const credencial = await signInWithEmailAndPassword(auth, email, senha);
      await reload(credencial.user);
      if (!credencial.user.emailVerified) {
        const erro = new Error('E-mail não verificado');
        erro.code = 'itape/email-nao-verificado';
        throw erro;
      }
      // Renova o token para que a API veja o e-mail como verificado.
      await credencial.user.getIdToken(true);
      const perfil = await buscarMeuPerfil();
      setUsuario(perfil);
      return perfil;
    } finally {
      entrando.current = false;
      setCarregando(false);
    }
  }, []);

  const sair = useCallback(async () => {
    await signOut(auth);
    setUsuario(null);
  }, []);

  // Atualiza o nome exibido depois de editar o perfil.
  const atualizarUsuario = useCallback((dados) => {
    setUsuario((atual) => (atual ? { ...atual, ...dados } : atual));
  }, []);

  const valor = useMemo(
    () => ({ usuario, carregando, entrar, sair, atualizarUsuario }),
    [usuario, carregando, entrar, sair, atualizarUsuario],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

// Caminho da área de cada perfil.
export const areaDoPerfil = (perfil) => (perfil === 'administrador' ? '/admin' : '/painel');
