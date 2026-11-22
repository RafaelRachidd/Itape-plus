import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarEventos } from '../services/api';
import './Calendario.css';

// Datas são apresentadas no horário da região, mesmo quando a API retorna UTC.
const FUSO = 'America/Sao_Paulo';
const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const CATEGORIAS = [
  { id: 'musica', nome: 'Música', cor: '#d98c6c' },
  { id: 'teatro', nome: 'Teatro', cor: '#dda758' },
  { id: 'danca', nome: 'Dança', cor: '#8d86ba' },
  { id: 'exposicao', nome: 'Exposição', cor: '#7ba48e' },
  { id: 'cinema', nome: 'Cinema', cor: '#668fad' },
  { id: 'literatura', nome: 'Literatura', cor: '#597eaa' },
  { id: 'educacao', nome: 'Educação', cor: '#8faf9a' },
  { id: 'festival', nome: 'Festival', cor: '#a081bf' },
];
const CIDADES_REFERENCIA = [
  'Itapetininga', 'São Miguel Arcanjo', 'Sarapuí', 'Angatuba', 'Alambari', 'Guareí',
];

function dataEmBrasilia(data) {
  const partes = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: FUSO,
  }).formatToParts(data);
  const valor = (tipo) => partes.find((parte) => parte.type === tipo)?.value;
  return `${valor('year')}-${valor('month')}-${valor('day')}`;
}

// As chaves YYYY-MM-DD são tratadas como datas de calendário, sem fusos horários.
function deChave(chave) {
  return new Date(`${chave}T12:00:00Z`);
}

function chaveUTC(data) {
  return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, '0')}-${String(data.getUTCDate()).padStart(2, '0')}`;
}

function moverDias(chave, quantidade) {
  const data = deChave(chave);
  data.setUTCDate(data.getUTCDate() + quantidade);
  return chaveUTC(data);
}

function moverMes(chave, quantidade) {
  const [ano, mes] = chave.split('-').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1 + quantidade, 1, 12));
  return `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, '0')}`;
}

function tituloMes(chave) {
  const data = deChave(`${chave}-01`);
  const texto = new Intl.DateTimeFormat('pt-BR', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(data);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function tituloDia(chave) {
  const texto = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC',
  }).format(deChave(chave));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function dataCurta(chave) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(deChave(chave));
}

function horaEvento(iso) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit', minute: '2-digit', timeZone: FUSO,
  }).format(new Date(iso));
}

function infoCategoria(id) {
  return CATEGORIAS.find((categoria) => categoria.id === id) ||
    { id: id || 'outros', nome: 'Cultura', cor: '#8d4d32' };
}

function valorEvento(evento) {
  if (evento.gratuito === true) return 'Gratuito';
  if (evento.preco != null && Number(evento.preco) > 0) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
      .format(Number(evento.preco));
  }
  return 'Valor a consultar';
}

function miniatura(evento) {
  return evento.imagemUrl || evento.imagem_url || '';
}

function EventoDia({ evento }) {
  const categoria = infoCategoria(evento.categoriaId);
  const imagem = miniatura(evento);
  const [imagemFalhou, setImagemFalhou] = useState(false);

  return (
    <article className="cal-evento">
      <div className="cal-evento-imagem">
        {imagem && !imagemFalhou
          ? <img src={imagem} alt="" loading="lazy" onError={() => setImagemFalhou(true)} />
          : <span aria-hidden="true">✳</span>}
      </div>
      <div className="cal-evento-corpo">
        <div className="cal-evento-info">
          <span className="cal-evento-hora">◷ {horaEvento(evento.dataInicio)}</span>
          {evento.gratuito === true && <span className="cal-etiqueta-gratis">Gratuito</span>}
        </div>
        <h3>{evento.titulo || 'Evento cultural'}</h3>
        <p className="cal-evento-local">⌖ {evento.localNome || evento.endereco || evento.cidade || 'Local a confirmar'}</p>
        <div className="cal-evento-rodape">
          <span className="cal-categoria-miuda"><i style={{ background: categoria.cor }} />{categoria.nome}</span>
          <span className="cal-preco">{valorEvento(evento)}</span>
        </div>
        <Link className="cal-evento-link" to={`/eventos/${evento.id}`}>Ver detalhes <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}

export default function Calendario() {
  const hoje = useMemo(() => dataEmBrasilia(new Date()), []);
  const [mesAtual, setMesAtual] = useState(hoje.slice(0, 7));
  const [diaSelecionado, setDiaSelecionado] = useState(hoje);
  const [visualizacao, setVisualizacao] = useState('mes');
  const [cidade, setCidade] = useState('todas');
  const [categoria, setCategoria] = useState('todas');
  const [somenteGratuitos, setSomenteGratuitos] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    listarEventos()
      .then((dados) => {
        if (!Array.isArray(dados)) throw new Error('A API retornou um formato inesperado.');
        if (ativo) setEventos(dados);
      })
      .catch((falha) => {
        if (ativo) setErro(falha.message || 'Não foi possível carregar os eventos.');
      })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);

  const eventosValidos = useMemo(() => eventos.flatMap((evento) => {
    const data = evento.dataInicio ? new Date(evento.dataInicio) : null;
    if (!data || Number.isNaN(data.getTime())) return [];
    return [{ ...evento, dia: dataEmBrasilia(data) }];
  }), [eventos]);

  const cidades = useMemo(() => [...new Set([
    ...CIDADES_REFERENCIA, ...eventosValidos.map((evento) => evento.cidade).filter(Boolean),
  ])], [eventosValidos]);

  const filtrados = useMemo(() => eventosValidos.filter((evento) => {
    if (cidade !== 'todas' && evento.cidade !== cidade) return false;
    if (categoria !== 'todas' && evento.categoriaId !== categoria) return false;
    if (somenteGratuitos && evento.gratuito !== true) return false;
    return true;
  }).sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio)),
  [eventosValidos, cidade, categoria, somenteGratuitos]);

  const eventosPorDia = useMemo(() => {
    const grupos = new Map();
    for (const evento of filtrados) {
      if (!grupos.has(evento.dia)) grupos.set(evento.dia, []);
      grupos.get(evento.dia).push(evento);
    }
    return grupos;
  }, [filtrados]);

  const doDia = eventosPorDia.get(diaSelecionado) || [];
  const doMes = filtrados.filter((evento) => evento.dia.startsWith(mesAtual));
  const primeiroDoMes = deChave(`${mesAtual}-01`);
  const primeiroVisivel = moverDias(`${mesAtual}-01`, -primeiroDoMes.getUTCDay());
  const [ano, mes] = mesAtual.split('-').map(Number);
  const ultimoDoMes = new Date(Date.UTC(ano, mes, 0, 12)).getUTCDate();
  const totalCelulas = Math.ceil((primeiroDoMes.getUTCDay() + ultimoDoMes) / 7) * 7;
  const diasCalendario = Array.from({ length: totalCelulas }, (_, indice) => moverDias(primeiroVisivel, indice));
  const inicioSemana = moverDias(diaSelecionado, -deChave(diaSelecionado).getUTCDay());
  const diasSemana = Array.from({ length: 7 }, (_, indice) => moverDias(inicioSemana, indice));
  const proximoEvento = filtrados.find((evento) => evento.dia >= hoje) || filtrados[0];

  function selecionarDia(chave) {
    setDiaSelecionado(chave);
    setMesAtual(chave.slice(0, 7));
  }

  function navegar(direcao) {
    if (visualizacao === 'semana') {
      selecionarDia(moverDias(diaSelecionado, direcao * 7));
    } else {
      const novoMes = moverMes(mesAtual, direcao);
      setMesAtual(novoMes);
      setDiaSelecionado(`${novoMes}-01`);
    }
  }

  function irParaHoje() { selecionarDia(hoje); }

  return (
    <div className="cal-pagina">
      <div className="cal-intro">
        <span className="cal-sobretitulo">▦ Programação cultural da região</span>
        <h1>Calendário Cultural da Região</h1>
        <p>Planeje seus passeios e descubra eventos culturais de Itapetininga e cidades vizinhas. A programação é atualizada conforme os organizadores publicam novos eventos.</p>
      </div>

      <div className="cal-cidades" aria-label="Filtrar por cidade">
        <button type="button" className={cidade === 'todas' ? 'ativo' : ''} onClick={() => setCidade('todas')} aria-pressed={cidade === 'todas'}>Todas as cidades</button>
        {cidades.map((nome) => (
          <button key={nome} type="button" className={cidade === nome ? 'ativo' : ''}
            aria-pressed={cidade === nome} onClick={() => setCidade(nome)}>{nome}</button>
        ))}
      </div>

      <div className="cal-barra">
        <div className="cal-navegacao">
          <button type="button" onClick={() => navegar(-1)} aria-label={visualizacao === 'semana' ? 'Semana anterior' : 'Mês anterior'}>‹</button>
          <h2>{visualizacao === 'semana' ? `Semana de ${dataCurta(inicioSemana)}` : tituloMes(mesAtual)}</h2>
          <button type="button" onClick={() => navegar(1)} aria-label={visualizacao === 'semana' ? 'Próxima semana' : 'Próximo mês'}>›</button>
          <button type="button" className="cal-hoje" onClick={irParaHoje}>▦ Hoje ({deChave(hoje).getUTCDate()})</button>
        </div>
        <div className="cal-visualizacoes" aria-label="Modo de visualização">
          {[['mes', 'Mês'], ['semana', 'Semana'], ['lista', 'Lista']].map(([id, rotulo]) => (
            <button key={id} type="button" onClick={() => setVisualizacao(id)} className={visualizacao === id ? 'ativo' : ''} aria-pressed={visualizacao === id}>{rotulo}</button>
          ))}
        </div>
      </div>

      <div className="cal-filtros" aria-label="Filtros rápidos">
        <span>☷ Filtros rápidos:</span>
        <button type="button" className={categoria === 'todas' ? 'ativo' : ''} onClick={() => setCategoria('todas')} aria-pressed={categoria === 'todas'}>Todas as categorias</button>
        {CATEGORIAS.map((item) => (
          <button key={item.id} type="button" className={categoria === item.id ? 'ativo' : ''}
            aria-pressed={categoria === item.id} onClick={() => setCategoria(item.id)}>
            <i style={{ background: item.cor }} />{item.nome}
          </button>
        ))}
        <button type="button" className={somenteGratuitos ? 'ativo' : ''}
          aria-pressed={somenteGratuitos} onClick={() => setSomenteGratuitos(!somenteGratuitos)}><i style={{ background: '#479169' }} />Gratuitos</button>
      </div>

      {erro && <div className="cal-erro" role="alert">Não foi possível consultar a programação: {erro}. Confira se o backend está iniciado.</div>}
      {carregando && <div className="cal-carregando" role="status">Carregando programação cultural…</div>}

      {!carregando && !erro && (
        <div className="cal-conteudo">
          <section className="cal-quadro" aria-label="Calendário de eventos">
            {visualizacao === 'lista' ? (
              <div className="cal-lista">
                <div className="cal-quadro-titulo"><h2>Programação de {tituloMes(mesAtual)}</h2><p>{doMes.length} {doMes.length === 1 ? 'evento encontrado' : 'eventos encontrados'}</p></div>
                {doMes.length ? doMes.map((evento) => (
                  <div className="cal-linha-evento" key={evento.id}>
                    <div className="cal-linha-data"><strong>{deChave(evento.dia).getUTCDate()}</strong><span>{new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' }).format(deChave(evento.dia))}</span></div>
                    <div className="cal-linha-info"><span>{horaEvento(evento.dataInicio)} · {infoCategoria(evento.categoriaId).nome}</span><h3>{evento.titulo}</h3><p>{evento.localNome || evento.cidade || 'Local a confirmar'}</p></div>
                    <Link to={`/eventos/${evento.id}`}>Ver detalhes →</Link>
                  </div>
                )) : <p className="cal-sem-eventos">Não há eventos cadastrados neste mês com esses filtros.</p>}
              </div>
            ) : (
              <>
                <div className="cal-deslizar">Arraste para os lados para visualizar os sete dias.</div>
                <div className="cal-rolagem">
                  <div className="cal-dias-semana">{DIAS_SEMANA.map((dia) => <span key={dia}>{dia}</span>)}</div>
                  <div className={`cal-grade ${visualizacao === 'semana' ? 'cal-grade-semana' : ''}`}>
                    {(visualizacao === 'semana' ? diasSemana : diasCalendario).map((chave) => {
                      const eventosDia = eventosPorDia.get(chave) || [];
                      const dentroMes = chave.startsWith(mesAtual);
                      const selecionado = chave === diaSelecionado;
                      return (
                        <button type="button" key={chave} className={[
                          'cal-dia', !dentroMes ? 'fora-mes' : '', selecionado ? 'selecionado' : '', chave === hoje ? 'hoje' : '',
                        ].filter(Boolean).join(' ')} onClick={() => selecionarDia(chave)}
                          aria-pressed={selecionado} aria-label={`${tituloDia(chave)} — ${eventosDia.length} ${eventosDia.length === 1 ? 'evento' : 'eventos'}`}>
                          <span className="cal-dia-cabecalho"><strong>{deChave(chave).getUTCDate()}</strong>{selecionado && <small>Selecionado</small>}</span>
                          {eventosDia.length > 0 && <>
                            <div className="cal-dia-nomes">{eventosDia.slice(0, 2).map((evento) => (
                              <span key={evento.id} style={{ '--cor-evento': infoCategoria(evento.categoriaId).cor }}>{evento.titulo}</span>
                            ))}</div>
                            <span className="cal-dia-marcadores" aria-hidden="true">{eventosDia.slice(0, 3).map((evento) => (
                              <i key={evento.id} style={{ background: infoCategoria(evento.categoriaId).cor }} />
                            ))}</span>
                            <span className="cal-dia-quantidade">{eventosDia.length} {eventosDia.length === 1 ? 'evento' : 'eventos'}</span>
                          </>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="cal-rodape-quadro">
                  <span>✳ {doMes.length} {doMes.length === 1 ? 'evento aprovado' : 'eventos aprovados'} em {tituloMes(mesAtual)}.</span>
                  <Link to="/eventos">Explorar todos os eventos →</Link>
                </div>
              </>
            )}
            {doMes.length === 0 && proximoEvento && (
              <div className="cal-proximo">
                <span>Não há eventos neste mês com os filtros atuais.</span>
                <button type="button" onClick={() => selecionarDia(proximoEvento.dia)}>
                  Ir para {proximoEvento.titulo} ({dataCurta(proximoEvento.dia)}) →
                </button>
              </div>
            )}
            {filtrados.length === 0 && <div className="cal-proximo">Nenhum evento aprovado corresponde aos filtros. Experimente selecionar “Todas as cidades” e “Todas as categorias”.</div>}
          </section>

          <aside className="cal-painel" aria-label="Programação do dia selecionado">
            <div className="cal-painel-topo">
              <div><h2>{tituloDia(diaSelecionado)}</h2><p>Programação do dia selecionado</p></div>
              <span className="cal-contagem">{doDia.length} {doDia.length === 1 ? 'evento' : 'eventos'}</span>
            </div>
            {doDia.length ? (
              <div className="cal-eventos-do-dia">{doDia.map((evento) => <EventoDia key={evento.id} evento={evento} />)}</div>
            ) : (
              <div className="cal-painel-vazio"><span aria-hidden="true">◷</span><strong>Nenhum evento neste dia</strong><p>Selecione uma data marcada no calendário ou navegue pelos meses.</p></div>
            )}
            <Link className="cal-painel-ver-todos" to="/eventos">Ver todos os eventos da região →</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
