import { Link } from 'react-router-dom';
import { formatarData, formatarHora, formatarPreco } from '../utils/formatar';

// Cartão usado na página inicial e no catálogo (RF01, RF02).
export default function CartaoEvento({ evento }) {
  return (
    <article className="cartao">
      <Link to={`/eventos/${evento.id}`} className="cartao-link">
        <div className={`cartao-capa capa-${evento.categoria_slug}`}>
          {evento.imagem_url ? (
            <img src={evento.imagem_url} alt="" loading="lazy" />
          ) : (
            <span aria-hidden="true">{evento.categoria}</span>
          )}
        </div>
        <div className="cartao-corpo">
          <span className="etiqueta">{evento.categoria}</span>
          <h3>{evento.titulo}</h3>
          <p className="cartao-info">
            <time dateTime={evento.data_inicio}>
              {formatarData(evento.data_inicio)} · {formatarHora(evento.data_inicio)}
            </time>
          </p>
          <p className="cartao-info">{evento.local_nome}</p>
          <p className={`preco ${evento.gratuito ? 'preco-gratuito' : ''}`}>
            {formatarPreco(evento.gratuito, evento.preco)}
          </p>
        </div>
      </Link>
    </article>
  );
}
