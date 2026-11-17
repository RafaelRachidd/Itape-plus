import { Link, useLocation } from 'react-router-dom';

// "Cursos e oficinas" é o catálogo filtrado pela categoria Educação.
export default function Cabecalho() {
  const { pathname, search } = useLocation();
  const emEducacao = pathname === '/eventos' && new URLSearchParams(search).get('categoria') === 'educacao';
  const emEventos = pathname.startsWith('/eventos') && !emEducacao;

  return (
    <header className="cabecalho">
      <Link to="/" className="logo" aria-label="Itape +, página inicial">
        Itape <span>+</span>
      </Link>
      <nav aria-label="Menu principal">
        <Link to="/eventos" className={emEventos ? 'ativo' : ''} aria-current={emEventos ? 'page' : undefined}>
          Eventos
        </Link>
        <Link
          to="/eventos?categoria=educacao"
          className={emEducacao ? 'ativo' : ''}
          aria-current={emEducacao ? 'page' : undefined}
        >
          Cursos e oficinas
        </Link>
        <Link to="/login" className="botao-secundario">Área do organizador</Link>
      </nav>
    </header>
  );
}
