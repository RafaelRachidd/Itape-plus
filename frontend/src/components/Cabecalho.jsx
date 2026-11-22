import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexto/AuthContext';
import '../pages/Inicio.css';

export default function Cabecalho() {
  const [menuAberto, setMenuAberto] = useState(false);
  const fecharMenu = () => setMenuAberto(false);
  const { usuario, sair } = useAuth();
  const navegar = useNavigate();

  // Vai para o início antes de sair, para a página protegida não pedir login de novo.
  async function aoSair() {
    fecharMenu();
    navegar('/');
    await sair();
  }

  return (
    <header className="itape-header">
      <div className="itape-header-inner">
        <Link to="/" className="itape-brand" onClick={fecharMenu} aria-label="Itape Mais — início">
          <span className="itape-brand-mark">✳</span> Itape <span>+</span>
        </Link>

        <div className="itape-city"><span aria-hidden="true">⌖</span> Itapetininga <span aria-hidden="true">⌄</span></div>

        <form className="itape-header-search" action="/eventos" method="get" role="search">
          <span aria-hidden="true">⌕</span>
          <input type="search" name="q" placeholder="Buscar eventos, cursos, teatros..." aria-label="Buscar eventos" />
        </form>

        <button type="button" className="itape-menu-toggle" aria-expanded={menuAberto} aria-controls="itape-menu" onClick={() => setMenuAberto(!menuAberto)}>
          {menuAberto ? 'Fechar' : 'Menu'}
        </button>

        <nav id="itape-menu" className={'itape-header-nav' + (menuAberto ? ' aberto' : '')} aria-label="Menu principal">
          <NavLink to="/eventos" onClick={fecharMenu}>Eventos</NavLink>
          <NavLink to="/calendario" onClick={fecharMenu}>Calendário</NavLink>
          {usuario?.perfil === 'administrador' ? (
            <NavLink to="/admin" className="itape-organizar" onClick={fecharMenu}>Moderação</NavLink>
          ) : (
            <NavLink to={usuario ? '/painel/novo' : '/cadastro'} className="itape-organizar" onClick={fecharMenu}>＋ Criar evento</NavLink>
          )}
          {usuario ? (
            <>
              {usuario.perfil === 'organizador' && <NavLink to="/painel" end onClick={fecharMenu}>Meu painel</NavLink>}
              <button type="button" className="itape-sair" onClick={aoSair}>Sair</button>
            </>
          ) : (
            <NavLink to="/login" onClick={fecharMenu}>Minha conta</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
