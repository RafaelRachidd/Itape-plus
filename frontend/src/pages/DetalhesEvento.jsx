import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { buscarEvento } from '../services/api';
import { formatarDataCompleta, formatarHora, formatarPreco } from '../utils/formatar';

// RF05 + RF15: detalhes do evento aprovado e contato do organizador.
export default function DetalhesEvento() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    setEvento(null);
    setErro('');
    buscarEvento(id)
      .then(setEvento)
      .catch((e) => setErro(e.status === 404 || e.status === 400 ? 'Evento não encontrado' : e.message));
  }, [id]);

  if (erro) {
    return (
      <section className="destaque">
        <h1>{erro}</h1>
        <p>Ele pode ter sido removido ou ainda estar em análise.</p>
        <Link to="/eventos" className="botao">Ver eventos</Link>
      </section>
    );
  }

  if (!evento) return <p className="aviso" role="status">Carregando evento...</p>;

  return (
    <article className="detalhes">
      <Link to="/eventos" className="voltar">← Voltar para eventos</Link>

      {evento.imagem_url && (
        <img className="detalhes-imagem" src={evento.imagem_url} alt={`Divulgação de ${evento.titulo}`} />
      )}

      <span className="etiqueta">{evento.categoria}</span>
      <h1>{evento.titulo}</h1>

      <dl className="detalhes-info">
        <div>
          <dt>Data</dt>
          <dd>{formatarDataCompleta(evento.data_inicio)}</dd>
        </div>
        <div>
          <dt>Horário</dt>
          <dd>
            {formatarHora(evento.data_inicio)}
            {evento.data_fim && ` às ${formatarHora(evento.data_fim)}`}
          </dd>
        </div>
        <div>
          <dt>Local</dt>
          <dd>
            {evento.local_nome}
            <br />
            {evento.endereco} · {evento.cidade}
          </dd>
        </div>
        <div>
          <dt>Valor</dt>
          <dd>{formatarPreco(evento.gratuito, evento.preco)}</dd>
        </div>
      </dl>

      <h2>Sobre o evento</h2>
      <p className="descricao">{evento.descricao}</p>

      {/^https?:\/\//i.test(evento.link_inscricao || '') && (
        <a className="botao" href={evento.link_inscricao} target="_blank" rel="noopener noreferrer">
          Fazer inscrição
        </a>
      )}

      <aside className="organizador" aria-label="Organizador">
        <h2>Organização</h2>
        <p><strong>{evento.organizador_nome}</strong></p>
        {evento.organizador_contato && <p>Contato: {evento.organizador_contato}</p>}
      </aside>
    </article>
  );
}
