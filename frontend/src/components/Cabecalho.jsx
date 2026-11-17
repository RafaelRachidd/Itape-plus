import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import '../pages/Inicio.css';

export default function Cabecalho() {
  const [menuAberto, setMenuAberto] = useState(false);
  const fecharMenu = () => setMenuAberto(false);

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
          <NavLink to="/eventos?visualizacao=calendario" onClick={fecharMenu}>Calendário</NavLink>
          <NavLink to="/cadastro" className="itape-organizar" onClick={fecharMenu}>＋ Criar evento</NavLink>
          <NavLink to="/login" onClick={fecharMenu}>Minha conta</NavLink>
        </nav>
      </div>
    </header>
  );
}
