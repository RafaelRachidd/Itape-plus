import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexto/AuthContext';

// Sem login: vai para /login e volta depois (RF07).
// Perfil errado: mostra acesso restrito. A API também bloqueia (403).
export default function RotaProtegida({ perfil, children }) {
  const { usuario } = useAuth();
  const local = useLocation();

  if (!usuario) {
    return <Navigate to={`/login?voltar=${encodeURIComponent(local.pathname)}`} replace />;
  }

  if (perfil && usuario.perfil !== perfil) {
    return (
      <section className="destaque">
        <h1>Acesso restrito</h1>
        <p>Esta área não está disponível para o seu perfil.</p>
        <Link to={usuario.perfil === 'admin' ? '/admin' : '/painel'} className="botao">
          Ir para a minha área
        </Link>
      </section>
    );
  }

  return children;
}
