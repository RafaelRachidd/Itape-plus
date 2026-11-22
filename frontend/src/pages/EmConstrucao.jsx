import { Link } from 'react-router-dom';
import './Painel.css';

// Página exibida quando o endereço não existe.
export default function EmConstrucao({ titulo = 'Página não encontrada' }) {
  return (
    <div className="pn-page">
      <section className="pn-vazio">
        <span aria-hidden="true">✳</span>
        <h1>{titulo}</h1>
        <p>O endereço que você abriu não existe ou foi removido.</p>
        <Link to="/eventos" className="pn-botao">Ver eventos</Link>
      </section>
    </div>
  );
}
