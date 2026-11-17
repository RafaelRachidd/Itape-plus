import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexto/AuthContext';

// "Cursos e oficinas" é o catálogo filtrado pela categoria Educação.
// A área à direita muda conforme o login: visitante, organizador ou administrador.
export default function Cabecalho() {
  const { pathname, search } = useLocation();
  const { usuario, sair } = useAuth();
  const navegar = useNavigate();

  const emEducacao = pathname === '/eventos' && new URLSearchParams(search).get('categoria') === 'educacao';
  const emEventos = pathname.startsWith('/eventos') && !emEducacao;
  const minhaArea = usuario?.perfil === 'admin'
    ? { para: '/admin', nome: 'Moderação', ativo: pathname.startsWith('/admin') }
    : { para: '/painel', nome: 'Meu painel', ativo: pathname.startsWith('/painel') };

  // Primeiro vai para o início e só então encerra a sessão.
  // Se a sessão acabasse antes, a rota protegida mandaria para /login.
  const [saindo, setSaindo] = useState(false);
  useEffect(() => {
    if (saindo && pathname === '/') {
      sair();
      setSaindo(false);
    }
  }, [saindo, pathname, sair]);

  function encerrar() {
    // O token sai na hora (nenhuma chamada nova usa a sessão); o estado sai ao chegar no início.
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setSaindo(true);
    navegar('/');
  }

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
        {usuario ? (
          <>
            <Link
              to={minhaArea.para}
              className={`botao-secundario ${minhaArea.ativo ? 'ativo' : ''}`}
              aria-current={minhaArea.ativo ? 'page' : undefined}
            >
              {minhaArea.nome}
            </Link>
            <button type="button" className="botao-texto" onClick={encerrar}>Sair</button>
          </>
        ) : (
          <Link to="/login" className="botao-secundario">Área do organizador</Link>
        )}
      </nav>
    </header>
  );
}
