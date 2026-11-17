import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { verificarApi } from '../services/api';
import './Inicio.css';

// Imagens presentes no código HTML exportado pelo Google Stitch.
// URLs externas: futuramente, substituiremos por imagens armazenadas no projeto.
const imagens = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD_RBRl3GAGNg13YqT6jPcEEHOJnJiUhU2MeZmRwx-WoSmKUY6Xa308at2oZtD2j2494HAveyjxbX6YRJ9EYNXo6kwlr-YpFIDe865jtEbME8yZjgZD-qTnjtZIAtalUQBzaeM9exDXodW-dcN7ZrIyfAd7rbJMtgCHzT98SJ5p1dJh31iTwdNV1r7HoBzn-H6DZaUOGYsQc1jerl86cwDRbSjFlTGji6zQrD7zNHs",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC3hVMc41sqALM9C0Ug0WXag6FKlQZaMXOY7raqiEFDgX4ZkItdy0ejT8GKB9zg6jW4PS7adhwwgeNivuwuACn-HBN3kBv6pfySi9L4ZQRswspM2HAx-NGqc5A60iF4yVIS3wfovT6moWTMfFtJunTyHIkYgxQh98fppAFDcnTvj6tQ68NdVYId49Qu88sfIxQprePRNj6tGAMN_ixKa_cfTprY6zw9UhTt7Ln-IYY",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBMcq9JoIRe88PGkN3JOERa5zUs0sKAnDiww0zUAqGOdP8KFH_dqC0LUySATQBlraobv96EfxJNrHFiX8p9V9Fp5oa2-HqG8-qT0kMpML_FAVx4lssBai4DkVJQL-PabI0RPQaWD5p8UdbE9MAU2NbndZ087ruHdazRzSYsLYtkm3W8wqvY7kq5dbxyMie4jmXj_b6QLKlt25vBYsJQ4YSFhGfHC4U3j55EjxIHsDU",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCpzb7yT8kIS0ZW21JlZVCpXfGCNTxjgZBSdNw5q5Fgy_wZTjYIhubjbCGr3cdZHSF0nG1LRst7Ab6-RFe8M1KASiJX_tGEXD7zaGhGazGfxbix8oZgfP0tAV3K6qwqwmVkAfhULy7LNGu2Jrujuwc-vTb_f0i2ySdJHaRt6eS3F5qKv1aQGdzd_Ol_Qh5iDpNngss8mmyQWpEiU2pneL7DFu6QvIy7xVWeVD6ZHws",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDSYyB7Ay3fRb3lrScKYP64KdXs3Wja6D60ccy_neRKb4h2jGSW6cpe31pC0lOqQklv9Tjkf6MBPvAVStBptwfXIURWSiy-brcXJdAFfoS7l3uoowQSuWofGNHEaXXJEArFWHm9SHvw7Jeq8-BTDCrSpAE6KydCYSAY7IsrY9zoJl2yqYLhbgjKGRyVxZqI1iSLfDCbjltNccnoenWsq3I8cfsZ0XkejPzePPuLnW8",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDGdBMHr9ULyKu9y-6qMqQOzOvzG2jTsbueX01KdFPg2daEKeUmMNBSJgXGHJhNirhtMY20EfXcvToNQqT3p0Rag8qUWGA1e8Pll623g-5QNBUsgRVtjccATJRoqeYtOJMPsjLlKK0l_0Q6AzmwlfvONUfyOf8B2jsc-xi-gO8cSItQ5i9H7lAqzos-rUSflF2KEpbjVMnwPw5o0ASz--mEpgON5fwJ5X9-9ISRIDE",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBtgjxb9DWGcTihPUFClqegM9X_PrDA20kwhXReRzjzoOnEBZ-ALCWgKo5ZLwiFL-stANmVq7VJtIOKmX5NWIqtTdw_pgaciH2a2n8O8yW4Y82eZ5gjohCtpBr3Vcd29dQdFauz6gK06nDUN3NuQp6Jd408WL5es_0IBPSKOYxmSnErQotsnSoW5OMCAre2KCbcNLt9juxLSELBWB63NIqMTcgCwh8DcGOECRGsIws",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBjjZOeX7VTnSCtvncipfuJ0Oexcxs5vksNDExp7GOwzSctSpjIyICMGjOvWZzELHFdXAaoIWi70yJdkqO5gwsFBkQqq1aucUET1HsjYBvgsv8QTQ5z0eLrALz5moOm6gLtY_wUYCeC_i8wzlEQRobgDKZhzGBk_87BGJfKJ5_GbYOmvgoeQfB-KnJDb_IBSi025OMXDAIa0jQpQ5u6n0FcdXHFd4Zj0B2U1ZVYUeI",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDtO1x6pmmVXy83l04bN1gMvB1szK7YEvqG6frf6yuwQcUWggkIg8DRoWAIH4C6Vs_mQ1Sue_mfmxNJX0dsz2IlAqvLNCGnq8aj18_vl96yxb72Ls-E967x8XPZItb1yWcKFFB7O3X08TS0cJyukDCk4XDNR3l7yuMreJLCa8CXi3_zqIiCJW7GSmzg5PZy440QQw4FGTDB9ientC7RBSLWADV-GCy8n-mrv7Sxw7w",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCbIb7iBXzaeMAe-YisXB3yGOmzdmH3NRpBsmBgBKxq2HcXCVttHUWcZkfCr2iT9ZfYeH3DWmvcIxY8IuF1q0MdhQX9uqZoDXo81t_sdGFMGru9D26G9jGh6oESLnaoD47PW_Yr0cw9IZGBiygM_GNMlEeJAn2ULD7ahseFPaiNiDrFPliODDCOUM6vLDb6c20j3YkH8uPgdjTB_zRw4JpNoSKcLJI9sh1gUvb4hr0",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBuZ2FHD8VtLlYm53My7VID2LkEgT742cqrzfeZVJoqHqVJR1znfXkzEz20xO4bjP0My_fCjhPkql3Bu9JUNPyBHdNnOHZKtiJ0QxMVnf_F2yWp3QRCkhX7EyZj0iLsldtJoCwsHUFFQ84RtmU3WH1mVBFUU0YC-vTuXpbrlFvNm1gqmnTDbm7RXa79u_IrepjeleTPvX3fal8fphbAo2u2EE8b_x2OWbcIFJVTfcU",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCzPtEquS05gwvYMZyDoPZOurRkyQ1BRXijmsZaTt3uHcaCXzxNJtaUDOChEj9woWgeOIhfkW7bg-h-IWdtEFEIJ6THOKEnA6kzXTlxVM2T_bl4s1_uEuhcf8c_mXsjZqwzI-986F5kqkV9qawfBACuL30b70riobDrLUwo1IAqSNFnKklGlhL3nGoDkAaSBFLa4L_7l0HQVXbZrTrdLX2Fj9iJMHmrFTQ3Ui9Krxg",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDWZeNH1mQsM-R72evhgLuSzhaMpiMCtNm90jcY32npcMti9eej2FOKnCH9CCAkr4tHCbffyJ7FReFpZRjYFAfTkq-EBl5u8StCLWRwyNuMkDla5R-xE2WG-Hi5iT5r5eo-rZ8W_CqqprEPFfQsIUwnZw3nOLhjBy9k3O0Vz3d_LFnfOh6AHHc6Mbtg-KyXcmulQmmTVBS21NN5Z8LWb6HyVBnZ9mZRS9ZFKUuJ7FU",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC5i6UbLBa_LaiSnuL3NYqR9gnYNJ_qMOrWJLDyH6tYpQY1dxAKZiUiUYUKmBF0mObskpvIAxlqXiwB7KOkx8btFZLzxAOIWcByYEuYQRkA7JeUxfWcG8uLZIe1Ga4ud7yb3lDtTL_33q84Vc-Ii0gsjryQgyzM39Tcfiz7vI710l4FacZWOaERmuZEPNuQsomTL-wvlD2thSjyuauedWtIRRqcO9DjN0zvEF0dbdE",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCdjq4MWPra8F7QqFmVSWRtAklP0Aou6DOwRCY4mJPQK-G0D8NB072EQTB2Q_bZvz7cqNgUfcHcmtQMBW8CMj3zna4HTfDi-jhswmvks5YR4kFhPYovdzwf-HX4WpjKZW-fig4zq0fMZIQw7_GqPyFBtl6-nwLQLTxjXwaWltoNqEc6nvFM5oEluicKxfJa_eKxWd63SuyhVB10ieuNjzpNlV6br-iS7qNHisMwt_o",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDeFrTe7Gm9bcDmrAv_HUomV4SzKDdMDR78Wby9KKEjLLSZ90mHGmD8m2TPqz7vyiwL0bXrQjxTzJcZERkGmTdW1qOb51tFDCZc3y8np18lSCGWKWIFsTkVMNO7k5h_sxE3L8Rx764hRFxVLlSYJ1sdUUFu8fW2yvMBn7t1PafL7JkkoHqWyLayy3uO3k6gtlwWD1g3WRpFO8RVG7J98ka3-uOLIN9L7fMUQ77GvoM",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBpsIQ_50qw84g2YehdfJHXA3ne_8UPp_mSDS6dq3FfXBsV3mZNnndMWj5PRzUq7U3O8wtDXUQwr7BooDcTJpUUCx_v5jEBsYDIDDNBQd6YV7p3GCVJN7sMCB8cXCE8KPceL4_SeNLXUR0wG15tlKzrZMwpaLxg3XS37tU4gELJri2MQhzs48TK7PwNTiCKnc0Kol70V0xPKqfI1_1aOt-5XX6A0bcSBkzS2DWT6Mg",
];

// Conteúdo ilustrativo exportado do protótipo Stitch, NÃO cadastrado no Firestore.
const destaques = [
  { titulo: 'Festival de Inverno & Viola de Itapetininga 2026', subtitulo: 'Destaque da região', local: 'Praça Marechal Deodoro', imagem: imagens[0], chamada: 'Uma celebração da cultura e da música da nossa região.' },
  { titulo: 'Memórias Tropeiras', subtitulo: 'Teatro e memória', local: 'Teatro Municipal', imagem: imagens[2], chamada: 'Histórias que mantêm nossas tradições vivas.' },
  { titulo: 'Bienal da Cerâmica', subtitulo: 'Arte e tradição', local: 'Centro Histórico', imagem: imagens[3], chamada: 'Conheça o artesanato e a criatividade regional.' },
];

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

const emAlta = [
  { id: 'exemplo-violeiros', nome: 'Encontro de Violeiros do Vale do Paranapanema', categoria: 'Música', local: 'Teatro Municipal de Itapetininga', imagem: imagens[4], cidade: 'Itapetininga', preco: 'A partir de R$ 35,00' },
  { id: 'exemplo-tropeiro', nome: 'A Farsa do Auto Tropeiro', categoria: 'Teatro', local: 'Espaço Cultural SiriMób', imagem: imagens[5], cidade: 'Itapetininga', preco: 'A partir de R$ 25,00' },
  { id: 'exemplo-ceramica', nome: 'Oficina Viva: Cerâmica e Barro da Região', categoria: 'Oficina', local: 'Centro Cultural Alambari', imagem: imagens[6], cidade: 'Alambari', preco: 'Gratuito' },
  { id: 'exemplo-sarapui', nome: 'Grande Festa Tradicional de Sarapuí', categoria: 'Festival', local: 'Parque de Exposições', imagem: imagens[7], cidade: 'Sarapuí', preco: 'A partir de R$ 15,00' },
];

const fimDeSemana = [
  { id: 'exemplo-coreto', nome: 'Sexta no Coreto: Chorinho e MPB Instrumental', categoria: 'Música', local: 'Praça da Matriz', imagem: imagens[8], cidade: 'Itapetininga', preco: 'R$ 20,00' },
  { id: 'exemplo-cavalgada', nome: 'Cavalgada da Tradição & Queima do Alho', categoria: 'Cultura Raiz', local: 'Recinto Santo Antônio', imagem: imagens[9], cidade: 'Guareí', preco: 'R$ 40,00' },
  { id: 'exemplo-circuito', nome: 'Circuito Enogastronômico das Colinas', categoria: 'Gastronomia', local: 'Vinícola & Parque Ecológico', imagem: imagens[10], cidade: 'São Miguel Arcanjo', preco: 'R$ 55,00' },
];

const gratuitos = [
  { id: 'exemplo-cinema', nome: 'Cine Pipoca: Mostra Paulistana de Curta-metragem', categoria: 'Cinema ao ar livre', local: 'Praça Peixoto Gomide', imagem: imagens[11], cidade: 'Itapetininga', preco: 'Entrada franca' },
  { id: 'exemplo-historias', nome: 'Lendas do Vale: Contação de Histórias para Pequenos', categoria: 'Infantil e família', local: 'Biblioteca Municipal', imagem: imagens[12], cidade: 'Itapetininga', preco: 'Entrada franca' },
  { id: 'exemplo-historia', nome: 'História Viva: Os Casarões Centenários da Região', categoria: 'Palestra & memória', local: 'Instituto Histórico e Geográfico', imagem: imagens[13], cidade: 'Itapetininga', preco: 'Entrada franca' },
];

const oficinas = [
  { id: 'exemplo-fotografia', nome: 'Fotografia do Patrimônio Histórico', categoria: 'Oficina prática', imagem: imagens[14], preco: 'R$ 60,00' },
  { id: 'exemplo-culinaria', nome: 'Sabores do Fogão a Lenha: Culinária Caipira', categoria: 'Gastronomia', imagem: imagens[15], preco: 'R$ 45,00' },
  { id: 'exemplo-danca', nome: 'Catira e Danças de Fandango do Interior', categoria: 'Dança raiz', imagem: imagens[16], preco: 'Gratuito' },
];

function CartaoEvento({ evento, pequeno = false }) {
  return (
    <article className={'itape-event-card' + (pequeno ? ' compacto' : '')}>
      <Link to="/eventos" className="itape-event-image" aria-label={'Ver eventos como ' + evento.nome} style={{ backgroundImage: `url("${evento.imagem}")` }}>
        <span className="itape-event-tag">{evento.categoria}</span>
      </Link>
      <div className="itape-event-body">
        {evento.cidade && <span className="itape-event-city">{evento.cidade}</span>}
        <h3>{evento.nome}</h3>
        {evento.local && <p className="itape-event-location">⌖ {evento.local}</p>}
        <div className="itape-event-foot">
          <strong>{evento.preco}</strong>
          <Link to="/eventos" className="itape-mini-button">Explorar</Link>
        </div>
      </div>
    </article>
  );
}

function SecaoEventos({ etiqueta, titulo, descricao, eventos, id }) {
  return (
    <section className="itape-section" aria-labelledby={id}>
      <div className="itape-section-head">
        <div>
          <span className="itape-kicker">{etiqueta}</span>
          <h2 id={id}>{titulo}</h2>
          {descricao && <p>{descricao}</p>}
        </div>
        <Link to="/eventos" className="itape-text-link">Ver programação <span aria-hidden="true">→</span></Link>
      </div>
      <div className={'itape-event-grid cols-' + Math.min(4, eventos.length)}>
        {eventos.map((evento) => <CartaoEvento evento={evento} key={evento.id} />)}
      </div>
    </section>
  );
}

export default function Inicio() {
  const [destaqueAtivo, setDestaqueAtivo] = useState(0);
  const [api, setApi] = useState({ carregando: true });
  const destaque = destaques[destaqueAtivo];

  useEffect(() => {
    verificarApi()
      .then((dados) => setApi({ ok: true, dados }))
      .catch(() => setApi({ ok: false }));
  }, []);

  return (
    <div className="itape-inicio">
      <div className="itape-prototype-notice" role="note">
        <span>Prévia visual baseada no Stitch</span>
        <span>Eventos e valores abaixo são ilustrativos; ainda não são dados publicados no Firestore.</span>
      </div>

      <section className="itape-hero" aria-label="Destaque cultural" style={{ backgroundImage: `linear-gradient(90deg, rgba(26,25,24,.74) 0%, rgba(26,25,24,.36) 52%, rgba(26,25,24,.58) 100%), url("${destaque.imagem}")` }}>
        <div className="itape-hero-copy">
          <span className="itape-hero-badge">✦ {destaque.subtitulo}</span>
          <div className="itape-hero-eyebrow">Itapetininga & Vale do Paranapanema</div>
          <h1>{destaque.titulo}</h1>
          <p>{destaque.chamada}</p>
          <div className="itape-hero-meta"><span>⌖ {destaque.local}</span><span>📍 Região de Itapetininga</span></div>
          <Link to="/eventos" className="itape-hero-cta">Explorar eventos <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="itape-hero-switcher">
          <span className="itape-hero-switcher-label">Em destaque no protótipo</span>
          {destaques.map((item, indice) => (
            <button key={item.titulo} type="button" onClick={() => setDestaqueAtivo(indice)} className={'itape-hero-option' + (indice === destaqueAtivo ? ' ativo' : '')} aria-pressed={indice === destaqueAtivo}>
              <span className="itape-hero-thumb" style={{ backgroundImage: `url("${item.imagem}")` }} />
              <span>{item.titulo}</span>
              <span aria-hidden="true">{indice === destaqueAtivo ? '●' : '○'}</span>
            </button>
          ))}
        </div>
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

      <SecaoEventos id="em-alta" etiqueta="Destaques da comunidade" titulo="Em alta na região" eventos={emAlta} />
      <SecaoEventos id="fim-de-semana" etiqueta="Agende seu lazer" titulo="Neste fim de semana" descricao="Inspirações do protótipo para descobrir a programação regional." eventos={fimDeSemana} />
      <SecaoEventos id="gratuitos" etiqueta="Cultura para todos" titulo="Cultura Sem Barreiras: 100% Gratuito" descricao="Espaço dedicado a atividades culturais de acesso gratuito." eventos={gratuitos} />
      <SecaoEventos id="oficinas" etiqueta="Aprenda com mestres locais" titulo="Cursos, Vivências e Oficinas" eventos={oficinas} />

      <section className="itape-organizer-cta">
        <div>
          <span className="itape-kicker">Comunidade cultural de Itapetininga</span>
          <h2>Produz eventos culturais?<br />Divulgue sua cultura com o Itape +</h2>
          <p>Um espaço para produtores, coletivos e artistas da região alcançarem novos públicos.</p>
          <Link to="/cadastro" className="itape-hero-cta">Quero organizar eventos →</Link>
        </div>
        <div className="itape-cta-labels"><span>✦ Cultura regional</span><span>✓ Divulgação de eventos</span><span>♡ Nossa comunidade</span></div>
      </section>

      <div className="itape-api-status" role="status">
        {api.carregando && 'Verificando conexão com a API…'}
        {api.ok === true && `API conectada ao Firestore · ${api.dados.categorias} categorias cadastradas`}
        {api.ok === false && 'API indisponível no momento — confira o backend.'}
      </div>
    </div>
  );
}
