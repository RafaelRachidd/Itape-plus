import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarEventos } from '../services/api';
import { formatarDataHora, formatarPreco } from '../utils/formatar';
import ImagemEvento from '../components/ImagemEvento';
import './Inicio.css';

// Imagem de capa exportada do Google Stitch, usada quando não há evento em destaque.
const IMAGEM_CAPA = "https://lh3.googleusercontent.com/aida-public/AB6AXuD_RBRl3GAGNg13YqT6jPcEEHOJnJiUhU2MeZmRwx-WoSmKUY6Xa308at2oZtD2j2494HAveyjxbX6YRJ9EYNXo6kwlr-YpFIDe865jtEbME8yZjgZD-qTnjtZIAtalUQBzaeM9exDXodW-dcN7ZrIyfAd7rbJMtgCHzT98SJ5p1dJh31iTwdNV1r7HoBzn-H6DZaUOGYsQc1jerl86cwDRbSjFlTGji6zQrD7zNHs";

const categorias = [
  { nome: 'Música', slug: 'musica', icone: '♫' },
  { nome: 'Teatro', slug: 'teatro', icone: '◈' },
  { nome: 'Dança', slug: 'danca', icone: '♧' },
  { nome: 'Exposição', slug: 'exposicao', icone: '▧' },
  { nome: 'Literatura', slug: 'literatura', icone: '▤' },
  { nome: 'Cinema', slug: 'cinema', icone: '▣' },
  { nome: 'Educação', slug: 'educacao', icone: '✎' },
  { nome: 'Festival', slug: 'festival', icone: '✦' },
];

const NOMES_CATEGORIA = Object.fromEntries(categorias.map((c) => [c.slug, c.nome]));

function CartaoEvento({ evento }) {
  return (
    <article className="itape-event-card">
      <Link to={`/eventos/${evento.id}`} className="itape-event-image" aria-label={'Ver detalhes de ' + evento.titulo}>
        <ImagemEvento url={evento.imagemUrl} titulo={evento.titulo} className="itape-event-foto" />
        <span className="itape-event-tag">{NOMES_CATEGORIA[evento.categoriaId] || 'Cultura'}</span>
      </Link>
      <div className="itape-event-body">
        <span className="itape-event-city">{evento.cidade || 'Itapetininga'} · {formatarDataHora(evento.dataInicio)}</span>
        <h3>{evento.titulo}</h3>
        {evento.localNome && <p className="itape-event-location">⌖ {evento.localNome}</p>}
        <div className="itape-event-foot">
          <strong>{formatarPreco(evento)}</strong>
          <Link to={`/eventos/${evento.id}`} className="itape-mini-button">Ver detalhes</Link>
        </div>
      </div>
    </article>
  );
}

function SecaoEventos({ etiqueta, titulo, descricao, eventos, id, link = '/eventos' }) {
  if (!eventos.length) return null;
  return (
    <section className="itape-section" aria-labelledby={id}>
      <div className="itape-section-head">
        <div>
          <span className="itape-kicker">{etiqueta}</span>
          <h2 id={id}>{titulo}</h2>
          {descricao && <p>{descricao}</p>}
        </div>
        <Link to={link} className="itape-text-link">Ver programação <span aria-hidden="true">→</span></Link>
      </div>
      <div className={'itape-event-grid cols-' + Math.max(3, Math.min(4, eventos.length))}>
        {eventos.map((evento) => <CartaoEvento evento={evento} key={evento.id} />)}
      </div>
    </section>
  );
}

// Eventos aprovados que ainda não terminaram, do mais próximo ao mais distante.
function proximos(lista) {
  const agora = Date.now();
  return lista
    .filter((ev) => (Date.parse(ev.dataFim || ev.dataInicio) || 0) >= agora)
    .sort((a, b) => Date.parse(a.dataInicio) - Date.parse(b.dataInicio));
}

const DESTAQUE_PADRAO = {
  titulo: 'A cultura de Itapetininga e região em um só lugar',
  subtitulo: 'Agenda cultural',
  chamada: 'Shows, teatro, exposições, oficinas e festas da nossa região, com informações confirmadas pela equipe do Itape +.',
  imagem: IMAGEM_CAPA,
};

export default function Inicio() {
  const [destaqueAtivo, setDestaqueAtivo] = useState(0);
  const [eventos, setEventos] = useState(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    listarEventos()
      .then((lista) => setEventos(proximos(lista)))
      .catch(() => { setErro(true); setEventos([]); });
  }, []);

  const lista = eventos || [];
  const destaques = lista.filter((ev) => /^https?:\/\//.test(ev.imagemUrl || '')).slice(0, 3);
  const ativo = destaques[destaqueAtivo];
  const destaque = ativo
    ? { titulo: ativo.titulo, subtitulo: NOMES_CATEGORIA[ativo.categoriaId] || 'Em destaque', chamada: ativo.descricao, imagem: ativo.imagemUrl, local: ativo.localNome, id: ativo.id, data: formatarDataHora(ativo.dataInicio) }
    : DESTAQUE_PADRAO;
  const gratuitos = lista.filter((ev) => ev.gratuito).slice(0, 3);

  return (
    <div className="itape-inicio">
      <section className={'itape-hero' + (destaques.length > 1 ? '' : ' itape-hero-unico')} aria-label="Destaque cultural" style={{ backgroundImage: `linear-gradient(90deg, rgba(26,25,24,.74) 0%, rgba(26,25,24,.36) 52%, rgba(26,25,24,.58) 100%), url("${String(destaque.imagem).replace(/"/g, '%22')}")` }}>
        <div className="itape-hero-copy">
          <span className="itape-hero-badge">✦ {destaque.subtitulo}</span>
          <div className="itape-hero-eyebrow">Itapetininga & Vale do Paranapanema</div>
          <h1>{destaque.titulo}</h1>
          <p className="itape-hero-chamada">{destaque.chamada}</p>
          <div className="itape-hero-meta">
            {destaque.data && <span>◷ {destaque.data}</span>}
            <span>⌖ {destaque.local || 'Itapetininga e região'}</span>
          </div>
          <Link to={destaque.id ? `/eventos/${destaque.id}` : '/eventos'} className="itape-hero-cta">
            {destaque.id ? 'Ver detalhes' : 'Explorar eventos'} <span aria-hidden="true">↗</span>
          </Link>
        </div>
        {destaques.length > 1 && <div className="itape-hero-switcher">
          <span className="itape-hero-switcher-label">Em destaque</span>
          {destaques.map((item, indice) => (
            <button key={item.id} type="button" onClick={() => setDestaqueAtivo(indice)} className={'itape-hero-option' + (indice === destaqueAtivo ? ' ativo' : '')} aria-pressed={indice === destaqueAtivo}>
              <span className="itape-hero-thumb" style={{ backgroundImage: `url("${String(item.imagemUrl).replace(/"/g, '%22')}")` }} />
              <span>{item.titulo}</span>
              <span aria-hidden="true">{indice === destaqueAtivo ? '●' : '○'}</span>
            </button>
          ))}
        </div>}
      </section>

      <section className="itape-section itape-categories" aria-labelledby="categorias-title">
        <div className="itape-section-head">
          <div><span className="itape-kicker">Explore por vertentes</span><h2 id="categorias-title">Categorias Culturais</h2></div>
          <Link to="/eventos" className="itape-text-link">Ver todas <span aria-hidden="true">→</span></Link>
        </div>
        <div className="itape-categories-list">
          {categorias.map((categoria) => (
            <Link key={categoria.slug} className="itape-category" to={'/eventos?categoria=' + categoria.slug}>
              <span className="itape-category-icon" aria-hidden="true">{categoria.icone}</span>
              <span><strong>{categoria.nome}</strong><small>Explorar</small></span>
            </Link>
          ))}
        </div>
      </section>

      <nav className="itape-quick-filters" aria-label="Descobrir eventos por período">
        <span>Descubra eventos:</span>
        <Link to="/eventos?periodo=hoje">Hoje</Link>
        <Link to="/eventos?periodo=amanha">Amanhã</Link>
        <Link to="/eventos?periodo=fim-de-semana" className="selecionado">Este fim de semana</Link>
        <Link to="/eventos?gratuito=true" className="verde">Gratuitos</Link>
        <Link to="/eventos?visualizacao=calendario">Calendário ↗</Link>
      </nav>

      {eventos === null && <p className="itape-api-status" role="status">Carregando a agenda…</p>}
      {eventos !== null && lista.length === 0 && (
        <section className="itape-section itape-agenda-vazia">
          <span className="itape-kicker">Agenda cultural</span>
          <h2>{erro ? 'Não foi possível carregar a agenda' : 'Nenhum evento publicado por enquanto'}</h2>
          <p>{erro ? 'Confira sua conexão e tente novamente em instantes.' : 'Os próximos eventos aparecem aqui assim que forem aprovados pela equipe.'}</p>
        </section>
      )}
      <SecaoEventos id="proximos" etiqueta="Agende seu lazer" titulo="Próximos eventos" eventos={lista.slice(0, 4)} />
      <SecaoEventos id="gratuitos" etiqueta="Cultura para todos" titulo="Cultura Sem Barreiras: 100% Gratuito" descricao="Atividades culturais de acesso gratuito." eventos={gratuitos} link="/eventos?gratuito=true" />

      <section className="itape-organizer-cta">
        <div>
          <span className="itape-kicker">Comunidade cultural de Itapetininga</span>
          <h2>Produz eventos culturais?<br />Divulgue sua cultura com o Itape +</h2>
          <p>Um espaço para produtores, coletivos e artistas da região alcançarem novos públicos.</p>
          <Link to="/cadastro" className="itape-hero-cta">Quero organizar eventos →</Link>
        </div>
        <div className="itape-cta-labels"><span>✦ Cultura regional</span><span>✓ Divulgação de eventos</span><span>♡ Nossa comunidade</span></div>
      </section>

    </div>
  );
}
