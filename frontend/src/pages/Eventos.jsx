import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { listarEventos } from '../services/api';
import './Eventos.css';

// Os rótulos são os das oito categorias já cadastradas no Firestore.
// Os eventos são carregados da API, não são dados fictícios do protótipo.
const CATEGORIAS = [
  { id: 'musica', nome: 'Música' },
  { id: 'teatro', nome: 'Teatro' },
  { id: 'danca', nome: 'Dança' },
  { id: 'exposicao', nome: 'Exposição' },
  { id: 'cinema', nome: 'Cinema' },
  { id: 'literatura', nome: 'Literatura' },
  { id: 'educacao', nome: 'Educação' },
  { id: 'festival', nome: 'Festival' },
];

const dataBR = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo',
});
const horaBR = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo',
});
const dinheiroBR = new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL',
});

function normalizar(valor) {
  return String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function chaveDia(data) {
  const partes = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'America/Sao_Paulo',
  }).formatToParts(data);
  const parte = (nome) => partes.find((item) => item.type === nome)?.value;
  return `${parte('year')}-${parte('month')}-${parte('day')}`;
}

function adicionarDias(chave, dias) {
  const data = new Date(`${chave}T12:00:00Z`);
  data.setUTCDate(data.getUTCDate() + dias);
  return data.toISOString().slice(0, 10);
}

function dentroDoPeriodo(data, periodo) {
  if (!periodo || periodo === 'todos') return true;
  if (!data || Number.isNaN(data.getTime())) return false;
  const hoje = chaveDia(new Date());
  const diaEvento = chaveDia(data);

  if (periodo === 'hoje') return diaEvento === hoje;
  if (periodo === 'amanha') return diaEvento === adicionarDias(hoje, 1);
  if (periodo === 'proximos-30') {
    return diaEvento >= hoje && diaEvento <= adicionarDias(hoje, 30);
  }
  if (periodo === 'fim-de-semana') {
    // Sábado e domingo mais próximos, incluindo o domingo atual, se for o caso.
    const diaSemana = new Date(`${hoje}T12:00:00Z`).getUTCDay();
    const distanciaSabado = diaSemana === 0 ? -1 : (6 - diaSemana + 7) % 7;
    const sabado = adicionarDias(hoje, distanciaSabado);
    return diaEvento === sabado || diaEvento === adicionarDias(sabado, 1);
  }
  return true;
}

function nomeCategoria(id) {
  return CATEGORIAS.find((categoria) => categoria.id === id)?.nome || id || 'Cultura';
}

function precoEvento(evento) {
  if (evento.gratuito === true) return 'Gratuito';
  if (evento.preco != null && !Number.isNaN(Number(evento.preco)) && Number(evento.preco) > 0) {
    return dinheiroBR.format(Number(evento.preco));
  }
  return 'Valor a consultar';
}

function CartaoEvento({ evento }) {
  const data = evento.dataInicio ? new Date(evento.dataInicio) : null;
  const dataValida = data && !Number.isNaN(data.getTime());
  const imagem = evento.imagemUrl || evento.imagem_url;
  // RF12: se a imagem não carregar, mostra a capa padrão.
  const [imagemFalhou, setImagemFalhou] = useState(false);

  return (
    <article className="ev-card">
      <div className="ev-card-cover">
        {imagem && !imagemFalhou ? (
          <img src={imagem} alt={`Imagem do evento ${evento.titulo}`} loading="lazy" onError={() => setImagemFalhou(true)} />
        ) : (
          <div className="ev-cover-placeholder" aria-label="Evento sem imagem cadastrada">
            <span aria-hidden="true">✦</span><strong>Itape +</strong><small>Cultura da nossa região</small>
          </div>
        )}
        <span className="ev-card-category">{nomeCategoria(evento.categoriaId)}</span>
        {dataValida && (
          <div className="ev-date-stamp" aria-label={`Data do evento: ${dataBR.format(data)}`}>
            <b>{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', timeZone: 'America/Sao_Paulo' }).format(data)}</b>
            <small>{new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'America/Sao_Paulo' }).format(data).replace('.', '').toUpperCase()}</small>
          </div>
        )}
      </div>
      <div className="ev-card-body">
        <p className="ev-meta">
          {dataValida ? `${dataBR.format(data)} · ${horaBR.format(data)}` : 'Data a confirmar'}
          {evento.localNome ? ` · ${evento.localNome}` : ''}
        </p>
        <h3>{evento.titulo || 'Evento cultural'}</h3>
        <p className="ev-description">{evento.descricao || 'Confira as informações deste evento cultural.'}</p>
        <p className="ev-place">⌖ {evento.cidade || 'Cidade a confirmar'}</p>
        <div className="ev-card-bottom">
          <strong>{precoEvento(evento)}</strong>
          <Link to={`/eventos/${evento.id}`} className="ev-card-action">Ver detalhes <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </article>
  );
}

export default function Eventos() {
  const [parametros, setParametros] = useSearchParams();
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const busca = parametros.get('q') || '';
  const categoria = parametros.get('categoria') || 'todas';
  const cidade = parametros.get('cidade') || 'todas';
  const periodo = parametros.get('periodo') || 'todos';
  const gratuito = parametros.get('gratuito') === 'true';
  const ordem = parametros.get('ordem') || 'proximos';

  useEffect(() => {
    let ativo = true;
    listarEventos()
      .then((dados) => {
        if (!Array.isArray(dados)) throw new Error('A API retornou um formato inesperado.');
        if (ativo) setEventos(dados);
      })
      .catch((e) => { if (ativo) setErro(e.message || 'Não foi possível carregar os eventos.'); })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  function atualizarParametro(chave, valor, padrao = '') {
    const novos = new URLSearchParams(parametros);
    if (!valor || valor === padrao) novos.delete(chave);
    else novos.set(chave, valor);
    setParametros(novos, { replace: true });
  }

  function limparFiltros() {
    // Mantém a visualização solicitada, mas remove os filtros e a busca.
    const novos = new URLSearchParams();
    const visualizacao = parametros.get('visualizacao');
    if (visualizacao) novos.set('visualizacao', visualizacao);
    setParametros(novos, { replace: true });
  }

  const cidades = useMemo(() => [...new Set(eventos.map((e) => e.cidade).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [eventos]);
  const eventosFiltrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    const filtrados = eventos.filter((evento) => {
      const dadosPesquisaveis = [evento.titulo, evento.descricao, evento.localNome, evento.cidade, nomeCategoria(evento.categoriaId)].join(' ');
      if (termo && !normalizar(dadosPesquisaveis).includes(termo)) return false;
      if (categoria !== 'todas' && evento.categoriaId !== categoria) return false;
      if (cidade !== 'todas' && evento.cidade !== cidade) return false;
      if (gratuito && evento.gratuito !== true) return false;
      const data = evento.dataInicio ? new Date(evento.dataInicio) : null;
      return dentroDoPeriodo(data, periodo);
    });

    return filtrados.sort((a, b) => {
      const da = Date.parse(a.dataInicio) || 0;
      const db = Date.parse(b.dataInicio) || 0;
      if (ordem === 'recentes') return db - da;
      return (da || Number.MAX_SAFE_INTEGER) - (db || Number.MAX_SAFE_INTEGER);
    });
  }, [eventos, busca, categoria, cidade, gratuito, periodo, ordem]);

  return (
    <div className="ev-page">
      <section className="ev-search-panel" aria-label="Buscar eventos">
        <div className="ev-search-panel-top">
          <label className="ev-search-field">
            <span aria-hidden="true">⌕</span>
            <input type="search" placeholder="Viola, teatro infantil, cerâmica, Sarapuí..." value={busca}
              onChange={(e) => atualizarParametro('q', e.target.value)} aria-label="Pesquisar eventos" />
          </label>
          <div className="ev-view-mode" aria-label="Visualizações">
            <span className="ev-view-active">☷ Lista</span>
            <span className="ev-view-future" title="Calendário em desenvolvimento">▦ Calendário · em breve</span>
          </div>
          <button className="ev-clear" type="button" onClick={limparFiltros}>Limpar filtros</button>
        </div>
        <div className="ev-search-panel-bottom">
          <p aria-live="polite">● {carregando ? 'Carregando eventos…' : erro ? 'Não foi possível consultar os eventos' : `${eventosFiltrados.length} ${eventosFiltrados.length === 1 ? 'evento encontrado' : 'eventos encontrados'} na região`}</p>
          <label className="ev-order">Classificar:
            <select value={ordem} onChange={(e) => atualizarParametro('ordem', e.target.value, 'proximos')}>
              <option value="proximos">Data mais próxima</option>
              <option value="recentes">Data mais distante</option>
            </select>
          </label>
        </div>
      </section>

      <div className="ev-layout">
        <aside className="ev-sidebar" aria-label="Filtros de eventos">
          <div className="ev-sidebar-heading"><h2>Filtros avançados</h2><button type="button" onClick={limparFiltros}>Redefinir tudo</button></div>
          <label className="ev-filter-label" htmlFor="filtro-categoria">Categoria</label>
          <select id="filtro-categoria" value={categoria} onChange={(e) => atualizarParametro('categoria', e.target.value, 'todas')}>
            <option value="todas">Todas as categorias</option>
            {CATEGORIAS.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
          </select>

          <label className="ev-filter-label" htmlFor="filtro-cidade">Cidades da região</label>
          <select id="filtro-cidade" value={cidade} onChange={(e) => atualizarParametro('cidade', e.target.value, 'todas')}>
            <option value="todas">Todas as cidades</option>
            {cidades.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>

          <label className="ev-filter-label" htmlFor="filtro-periodo">Período</label>
          <select id="filtro-periodo" value={periodo} onChange={(e) => atualizarParametro('periodo', e.target.value, 'todos')}>
            <option value="todos">Todas as datas</option>
            <option value="hoje">Hoje</option>
            <option value="amanha">Amanhã</option>
            <option value="fim-de-semana">Este fim de semana</option>
            <option value="proximos-30">Próximos 30 dias</option>
          </select>

          <label className="ev-check"><input type="checkbox" checked={gratuito} onChange={(e) => atualizarParametro('gratuito', e.target.checked ? 'true' : '')}/><span>Somente eventos gratuitos</span></label>
          <div className="ev-sidebar-note">As opções exibidas utilizam os dados realmente disponíveis no Firestore. Outros filtros do protótipo serão adicionados nas próximas etapas.</div>
        </aside>

        <section className="ev-results" aria-label="Resultados da busca">
          {carregando ? (
            <div className="ev-empty" role="status"><span aria-hidden="true">◌</span><h2>Carregando programação cultural…</h2></div>
          ) : erro ? (
            <div className="ev-empty" role="alert"><span aria-hidden="true">!</span><h2>Não foi possível carregar os eventos</h2><p>{erro}</p><p>Confira se o backend está ligado em localhost:3000.</p></div>
          ) : eventosFiltrados.length > 0 ? (
            <div className="ev-grid">{eventosFiltrados.map((evento) => <CartaoEvento key={evento.id} evento={evento}/>)}</div>
          ) : (
            <div className="ev-empty"><span aria-hidden="true">⌕</span><h2>Nenhum evento encontrado</h2><p>Tente outra categoria, cidade ou período. Apenas os eventos aprovados cadastrados no Firestore são exibidos.</p><button type="button" onClick={limparFiltros}>Ver todos os eventos</button></div>
          )}
          <div className="ev-more-note"><strong>Não encontrou o que procura?</strong><p>Continue explorando a cultura de Itapetininga e região. Novos eventos poderão ser publicados pelos organizadores.</p></div>
        </section>
      </div>
    </div>
  );
}
