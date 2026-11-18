import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { buscarEventoPorId, listarEventos } from '../services/api';
import './DetalhesEvento.css';

const CATEGORIAS = {
  musica: 'Música',
  teatro: 'Teatro',
  danca: 'Dança',
  exposicao: 'Exposição',
  cinema: 'Cinema',
  literatura: 'Literatura',
  educacao: 'Educação',
  festival: 'Festival',
};

const dataCompleta = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  timeZone: 'America/Sao_Paulo',
});
const horaBR = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo',
});
const precoBR = new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL',
});
const diaBR = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit', timeZone: 'America/Sao_Paulo',
});
const mesBR = new Intl.DateTimeFormat('pt-BR', {
  month: 'short', timeZone: 'America/Sao_Paulo',
});

function converterData(valor) {
  if (!valor) return null;
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

function nomeCategoria(id) {
  return CATEGORIAS[id] || id || 'Cultura regional';
}

function textoPreco(evento) {
  if (evento.gratuito === true) return 'Gratuito';
  const valor = Number(evento.preco);
  if (evento.preco != null && Number.isFinite(valor) && valor > 0) {
    return precoBR.format(valor);
  }
  return 'Valor a consultar';
}

function urlHttp(valor) {
  if (!valor || typeof valor !== 'string') return null;
  try {
    const url = new URL(valor);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function temEnderecoReal(endereco) {
  return Boolean(endereco && !/exemplo|a confirmar|não informado/i.test(endereco));
}

function Capa({ evento, tipo = 'principal' }) {
  const [imagemFalhou, setImagemFalhou] = useState(false);
  const imagem = urlHttp(evento.imagemUrl || evento.imagem_url);

  useEffect(() => { setImagemFalhou(false); }, [imagem]);

  if (imagem && !imagemFalhou) {
    return <img className={`det-capa-img det-capa-${tipo}`} src={imagem}
      alt={`Imagem de divulgação: ${evento.titulo || 'evento cultural'}`}
      onError={() => setImagemFalhou(true)} />;
  }

  return (
    <div className={`det-capa-vazia det-capa-${tipo}`} role="img"
      aria-label="Evento sem imagem de divulgação cadastrada">
      <span className="det-estrela" aria-hidden="true">✳</span>
      <strong>Itape +</strong>
      <span>Arte, cultura e encontros na nossa região</span>
    </div>
  );
}

export default function DetalhesEvento() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [relacionados, setRelacionados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [mensagemCopia, setMensagemCopia] = useState('');

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro('');
    setEvento(null);
    setRelacionados([]);
    setMensagemCopia('');

    buscarEventoPorId(id)
      .then((dados) => { if (ativo) setEvento(dados); })
      .catch((falha) => { if (ativo) setErro(falha.message || 'Não foi possível consultar o evento.'); })
      .finally(() => { if (ativo) setCarregando(false); });

    // Os eventos relacionados são opcionais: uma falha nessa consulta
    // não deve impedir que a página principal seja exibida.
    listarEventos()
      .then((lista) => {
        if (!ativo || !Array.isArray(lista)) return;
        setRelacionados(lista.filter((item) => item.id !== id).slice(0, 3));
      })
      .catch(() => {});

    return () => { ativo = false; };
  }, [id, tentativa]);

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMensagemCopia('Link copiado!');
    } catch {
      setMensagemCopia('Não foi possível copiar. Copie o endereço do navegador.');
    }
  }

  if (carregando) {
    return <section className="det-feedback" role="status"><span className="det-loading" aria-hidden="true" />
      <h1>Carregando detalhes…</h1><p>Estamos consultando a programação no Itape +.</p>
    </section>;
  }

  if (erro || !evento) {
    return <section className="det-feedback" role="alert">
      <span className="det-alert-icon" aria-hidden="true">!</span>
      <h1>Não foi possível abrir o evento</h1>
      <p>{erro || 'Evento não encontrado.'}</p>
      <div className="det-feedback-actions">
        <button type="button" onClick={() => setTentativa((n) => n + 1)}>Tentar novamente</button>
        <Link to="/eventos">Voltar para os eventos</Link>
      </div>
    </section>;
  }

  const inicio = converterData(evento.dataInicio);
  const fim = converterData(evento.dataFim);
  const inscricao = urlHttp(evento.linkInscricao || evento.link_inscricao);
  const textoLocal = [evento.localNome, evento.cidade].filter(Boolean).join(' · ');
  const endereco = [evento.localNome, evento.endereco, evento.cidade].filter(Boolean).join(', ');
  const mapaUrl = temEnderecoReal(evento.endereco)
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`
    : null;
  const programacao = Array.isArray(evento.programacao) ? evento.programacao.filter(Boolean) : [];
  const nomeOrganizador = evento.organizadorNome || evento.nomeOrganizador || evento.nomePublico || '';

  return (
    <div className="det-page">
      <nav className="det-breadcrumb" aria-label="Navegação estrutural">
        <Link to="/">Início</Link><span aria-hidden="true">/</span>
        <Link to="/eventos">Eventos</Link><span aria-hidden="true">/</span>
        <span aria-current="page">{evento.titulo || 'Detalhes do evento'}</span>
      </nav>

      <div className="det-hero">
        <Capa evento={evento} />
        <div className="det-hero-tags">
          <span>{nomeCategoria(evento.categoriaId)}</span>
          <span className="det-tag-confirmado">● Evento aprovado</span>
        </div>
        {inicio && <div className="det-date-chip"><b>{diaBR.format(inicio)}</b><small>{mesBR.format(inicio).replace('.', '').toUpperCase()}</small></div>}
      </div>

      <header className="det-intro">
        <div className="det-intro-copy">
          <p className="det-kicker">Cultura em Itapetininga e região</p>
          <h1>{evento.titulo || 'Evento cultural'}</h1>
          <div className="det-intro-meta">
            <span>▦ {inicio ? `${dataCompleta.format(inicio)} às ${horaBR.format(inicio)}` : 'Data a confirmar'}</span>
            {textoLocal && <span>⌖ {textoLocal}</span>}
          </div>
        </div>
        <div className="det-actions">
          <button type="button" onClick={copiarLink} aria-label="Copiar link deste evento">⇧ Compartilhar</button>
          <Link to="/eventos">← Todos os eventos</Link>
          {mensagemCopia && <small role="status">{mensagemCopia}</small>}
        </div>
      </header>

      <div className="det-body-grid">
        <div className="det-main-column">
          <section className="det-panel">
            <h2 className="det-heading">Sobre o evento</h2>
            <div className="det-texto">{evento.descricao || 'A descrição deste evento ainda não foi informada.'}</div>
            <div className="det-facts">
              <div><span aria-hidden="true">♫</span><small>Categoria</small><strong>{nomeCategoria(evento.categoriaId)}</strong></div>
              <div><span aria-hidden="true">▦</span><small>Data</small><strong>{inicio ? dataCompleta.format(inicio) : 'A confirmar'}</strong></div>
              <div><span aria-hidden="true">◷</span><small>Horário</small><strong>{inicio ? horaBR.format(inicio) : 'A confirmar'}</strong></div>
              <div><span aria-hidden="true">⌖</span><small>Cidade</small><strong>{evento.cidade || 'A confirmar'}</strong></div>
            </div>
          </section>

          {programacao.length > 0 && (
            <section className="det-panel">
              <h2 className="det-heading det-heading-verde">Programação</h2>
              <ol className="det-timeline">
                {programacao.map((item, indice) => {
                  const objeto = typeof item === 'string' ? { titulo: item } : item;
                  return <li key={`${indice}-${objeto.titulo || ''}`}>
                    {objeto.horario && <time>{objeto.horario}</time>}
                    <strong>{objeto.titulo || objeto.nome || 'Atividade'}</strong>
                    {objeto.descricao && <p>{objeto.descricao}</p>}
                  </li>;
                })}
              </ol>
            </section>
          )}

          <section className="det-panel">
            <h2 className="det-heading det-heading-verde">Local e como chegar</h2>
            <div className="det-local-card">
              <div className="det-local-symbol" aria-hidden="true">⌖</div>
              <div>
                <strong>{evento.localNome || 'Local a confirmar'}</strong>
                {evento.endereco && <p>{evento.endereco}</p>}
                {evento.cidade && <p>{evento.cidade}</p>}
                {mapaUrl && <a href={mapaUrl} target="_blank" rel="noopener noreferrer">Ver endereço no Google Maps ↗</a>}
              </div>
            </div>
          </section>

          {nomeOrganizador && (
            <section className="det-panel det-organizador">
              <span className="det-organizador-avatar" aria-hidden="true">✳</span>
              <div><small>Organização</small><h2>{nomeOrganizador}</h2></div>
            </section>
          )}
        </div>

        <aside className="det-aside" aria-label="Informações de ingresso e inscrição">
          <div className="det-ticket-panel">
            <span className="det-kicker">Garanta sua participação</span>
            <h2>Ingressos e inscrições</h2>
            <div className="det-price-box">
              <small>Valor informado</small>
              <strong>{textoPreco(evento)}</strong>
              {evento.gratuito && <span>◉ Participação gratuita</span>}
            </div>
            <div className="det-ticket-details">
              {inicio && <p><span>▦</span>{dataCompleta.format(inicio)} às {horaBR.format(inicio)}</p>}
              {fim && <p><span>◷</span>Término: {dataCompleta.format(fim)} às {horaBR.format(fim)}</p>}
              {textoLocal && <p><span>⌖</span>{textoLocal}</p>}
            </div>
            {inscricao ? (
              <a className="det-register" href={inscricao} target="_blank" rel="noopener noreferrer">
                {evento.gratuito ? 'Fazer inscrição ↗' : 'Informações de ingressos ↗'}
              </a>
            ) : (
              <div className="det-no-link" role="status">
                O organizador ainda não disponibilizou um link de inscrição ou ingresso.
              </div>
            )}
            <p className="det-ticket-note">O Itape + divulga o evento. Inscrições e pagamentos, quando disponíveis, são realizados no site indicado pelo organizador.</p>
          </div>
        </aside>
      </div>

      {relacionados.length > 0 && (
        <section className="det-related" aria-label="Outros eventos culturais">
          <div className="det-related-title"><div><span className="det-kicker">Continue descobrindo</span><h2>Você também pode gostar</h2></div><Link to="/eventos">Ver todos os eventos →</Link></div>
          <div className="det-related-grid">
            {relacionados.map((outro) => {
              const data = converterData(outro.dataInicio);
              return <article key={outro.id} className="det-related-card">
                <Link to={`/eventos/${outro.id}`} className="det-related-image" aria-label={`Abrir ${outro.titulo}`}>
                  <Capa evento={outro} tipo="mini" />
                  <span>{nomeCategoria(outro.categoriaId)}</span>
                </Link>
                <div className="det-related-body">
                  <small>{data ? `${diaBR.format(data)} de ${mesBR.format(data)} · ${horaBR.format(data)}` : 'Data a confirmar'}</small>
                  <h3><Link to={`/eventos/${outro.id}`}>{outro.titulo || 'Evento cultural'}</Link></h3>
                  <p>⌖ {outro.cidade || 'Região de Itapetininga'}</p>
                  <div><strong>{textoPreco(outro)}</strong><Link to={`/eventos/${outro.id}`}>Ver detalhes →</Link></div>
                </div>
              </article>;
            })}
          </div>
        </section>
      )}
    </div>
  );
}
