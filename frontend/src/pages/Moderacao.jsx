import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  aprovarEvento, buscarResumoModeracao, listarCategorias, listarEventosModeracao, rejeitarEvento,
} from '../services/api';
import { formatarDataCurta, formatarDataHora, formatarPreco } from '../utils/formatar';
import Campo from '../components/Campo';
import EtiquetaStatus from '../components/EtiquetaStatus';
import ImagemEvento from '../components/ImagemEvento';
import './Painel.css';

const ABAS = [
  { id: 'pendente', rotulo: 'Aguardando análise' },
  { id: 'aprovado', rotulo: 'Aprovados' },
  { id: 'rejeitado', rotulo: 'Rejeitados' },
];

function CartaoModeracao({ evento, categoria, aoModerar }) {
  const [rejeitando, setRejeitando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function executar(acao) {
    setErro('');
    setEnviando(true);
    try {
      await aoModerar(evento, acao, motivo.trim());
    } catch (falha) {
      setErro(falha.erros?.[0]?.mensagem || falha.message);
      setEnviando(false);
    }
  }

  return (
    <article className="pn-card">
      <ImagemEvento url={evento.imagemUrl} titulo={evento.titulo} className="pn-card-imagem" />
      <div className="pn-card-corpo">
        <div className="pn-card-topo">
          <EtiquetaStatus status={evento.status} />
          <span className="pn-card-categoria">{categoria}</span>
        </div>
        <h3>{evento.titulo}</h3>
        <p className="pn-card-info">
          <span>◷ {formatarDataHora(evento.dataInicio)}</span>
          <span>⌖ {evento.localNome} · {evento.endereco}{evento.cidade ? ` · ${evento.cidade}` : ''}</span>
          <span>{formatarPreco(evento)}</span>
        </p>
        <p className="pn-moderacao-meta">
          Organizador: <strong>{evento.organizadorNome}</strong> · Enviado em {formatarDataCurta(evento.atualizadoEm || evento.criadoEm)}
        </p>
        <p className="pn-card-descricao">{evento.descricao}</p>
        {evento.programacao?.length > 0 && (
          <p className="pn-card-nota">Programação: {evento.programacao.map((item) => [item.horario, item.titulo].filter(Boolean).join(' ')).join(' · ')}</p>
        )}
        {evento.linkInscricao && (
          <p className="pn-card-nota">Inscrição: <a href={evento.linkInscricao} target="_blank" rel="noreferrer">{evento.linkInscricao}</a></p>
        )}

        {evento.status !== 'pendente' && (
          <p className="pn-moderacao-meta">
            {evento.status === 'aprovado' ? 'Aprovado' : 'Rejeitado'} por <strong>{evento.moderadoPorNome || 'administrador'}</strong> em {formatarDataCurta(evento.moderadoEm)}
          </p>
        )}
        {evento.status === 'rejeitado' && evento.motivoRejeicao && (
          <div className="pn-motivo"><strong>Motivo informado</strong>{evento.motivoRejeicao}</div>
        )}
        {erro && <p className="pn-aviso pn-aviso-erro" role="alert">{erro}</p>}

        {evento.status === 'pendente' && !rejeitando && (
          <div className="pn-card-acoes">
            <button type="button" className="pn-botao pn-botao-verde" disabled={enviando} onClick={() => executar('aprovar')}>✓ Aprovar</button>
            <button type="button" className="pn-botao pn-botao-perigo" disabled={enviando} onClick={() => setRejeitando(true)}>Rejeitar</button>
          </div>
        )}
        {evento.status === 'pendente' && rejeitando && (
          <form className="pn-rejeitar" onSubmit={(e) => { e.preventDefault(); executar('rejeitar'); }} noValidate>
            <Campo id={`motivo-${evento.id}`} rotulo="Motivo da rejeição" ajuda="O organizador verá este texto no painel. Mínimo de 10 caracteres.">
              {(p) => <textarea {...p} rows={3} style={{ minHeight: 80 }} value={motivo} maxLength={500}
                onChange={(e) => { setMotivo(e.target.value); setErro(''); }} autoFocus />}
            </Campo>
            <div className="pn-card-acoes" style={{ borderTop: 0, paddingTop: 0 }}>
              <button type="submit" className="pn-botao pn-botao-perigo" disabled={enviando}>{enviando ? 'Enviando…' : 'Confirmar rejeição'}</button>
              <button type="button" className="pn-link" onClick={() => { setRejeitando(false); setMotivo(''); setErro(''); }}>Cancelar</button>
            </div>
          </form>
        )}
        {evento.status === 'aprovado' && (
          <div className="pn-card-acoes"><Link className="pn-link" to={`/eventos/${evento.id}`}>Ver no site →</Link></div>
        )}
      </div>
    </article>
  );
}

export default function Moderacao() {
  const [aba, setAba] = useState('pendente');
  const [resumo, setResumo] = useState({ pendente: 0, aprovado: 0, rejeitado: 0 });
  const [eventos, setEventos] = useState(null);
  const [categorias, setCategorias] = useState({});
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

  const carregar = useCallback(async (status) => {
    setEventos(null);
    setErro('');
    try {
      const [lista, contagem] = await Promise.all([listarEventosModeracao(status), buscarResumoModeracao()]);
      setEventos(lista);
      setResumo(contagem);
    } catch (falha) {
      setErro(falha.message);
      setEventos([]);
    }
  }, []);

  useEffect(() => { carregar(aba); }, [aba, carregar]);
  useEffect(() => {
    listarCategorias().then((lista) => setCategorias(Object.fromEntries(lista.map((c) => [c.id, c.nome])))).catch(() => {});
  }, []);

  async function aoModerar(evento, acao, motivo) {
    if (acao === 'aprovar') await aprovarEvento(evento.id);
    else await rejeitarEvento(evento.id, motivo);
    setEventos((lista) => lista.filter((ev) => ev.id !== evento.id));
    setResumo((atual) => ({
      ...atual,
      pendente: atual.pendente - 1,
      [acao === 'aprovar' ? 'aprovado' : 'rejeitado']: atual[acao === 'aprovar' ? 'aprovado' : 'rejeitado'] + 1,
    }));
    setAviso(acao === 'aprovar'
      ? `“${evento.titulo}” foi aprovado e já aparece no site.`
      : `“${evento.titulo}” foi rejeitado. O organizador verá o motivo no painel.`);
  }

  return (
    <div className="pn-page">
      <header className="pn-topo">
        <div>
          <span className="pn-kicker">Moderação</span>
          <h1>Eventos para análise</h1>
          <p>Aprove os eventos que podem ir ao ar ou rejeite explicando o que precisa ser corrigido.</p>
        </div>
      </header>

      {aviso && <p className="pn-aviso pn-aviso-sucesso" role="status">{aviso}</p>}
      {erro && <p className="pn-aviso pn-aviso-erro" role="alert">{erro}</p>}

      <div className="pn-resumo" role="group" aria-label="Escolher lista por status">
        {ABAS.map((item) => (
          <button key={item.id} type="button" className={`pn-resumo-item pn-resumo-${item.id}`}
            aria-pressed={aba === item.id} onClick={() => { setAba(item.id); setAviso(''); }}>
            <strong>{resumo[item.id]}</strong>
            <span>{item.rotulo}</span>
          </button>
        ))}
      </div>

      {eventos === null && <p className="pn-carregando" role="status">Carregando eventos…</p>}
      {eventos?.length === 0 && !erro && (
        <div className="pn-vazio">
          <span aria-hidden="true">✓</span>
          <h2>{aba === 'pendente' ? 'Tudo em dia' : 'Nenhum evento aqui'}</h2>
          <p>{aba === 'pendente' ? 'Não há eventos aguardando análise.' : 'Nenhum evento com este status ainda.'}</p>
        </div>
      )}
      <div className="pn-lista">
        {eventos?.map((evento) => (
          <CartaoModeracao key={evento.id} evento={evento}
            categoria={categorias[evento.categoriaId] || evento.categoriaId} aoModerar={aoModerar} />
        ))}
      </div>
    </div>
  );
}
