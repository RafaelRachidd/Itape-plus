import { NavLink } from 'react-router-dom';

export default function Cabecalho() {
  return (
    <header className="cabecalho">
      <NavLink to="/" className="logo">
        Itape <span>+</span>
      </NavLink>
      <nav aria-label="Menu principal">
        <NavLink to="/eventos">Eventos</NavLink>
        <NavLink to="/eventos?categoria=educacao">Cursos e oficinas</NavLink>
        <NavLink to="/login" className="botao-secundario">Área do organizador</NavLink>
      </nav>
    </header>
  );
}
