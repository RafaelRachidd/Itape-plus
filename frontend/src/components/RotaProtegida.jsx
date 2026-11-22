import { Link, Navigate, useLocation } from 'react-router-dom';
import { areaDoPerfil, useAuth } from '../contexto/AuthContext';
import '../pages/Painel.css';

// Sem login: vai para /login e volta depois.
// Perfil errado: mostra acesso restrito. A API também bloqueia (403).
export default function RotaProtegida({ perfil, children }) {
  const { usuario, carregando } = useAuth();
  const local = useLocation();

  if (carregando) {
    return <div className="pn-page"><p className="pn-carregando" role="status">Carregando sua conta…</p></div>;
  }

  if (!usuario) {
    return <Navigate to={`/login?voltar=${encodeURIComponent(local.pathname)}`} replace />;
  }

  if (perfil && usuario.perfil !== perfil) {
    return (
      <div className="pn-page">
        <section className="pn-vazio">
          <span aria-hidden="true">✳</span>
          <h1>Acesso restrito</h1>
          <p>Esta área não está disponível para o seu perfil.</p>
          <Link to={areaDoPerfil(usuario.perfil)} className="pn-botao">Ir para a minha área</Link>
        </section>
      </div>
    );
  }

  return children;
}
