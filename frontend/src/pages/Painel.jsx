import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexto/AuthContext';
import { atualizarMeuPerfil, excluirEvento, listarCategorias, listarMeusEventos } from '../services/api';
import { formatarDataHora, formatarPreco } from '../utils/formatar';
import Campo from '../components/Campo';
import EtiquetaStatus from '../components/EtiquetaStatus';
import ImagemEvento from '../components/ImagemEvento';
import './Painel.css';

const FILTROS = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'pendente', rotulo: 'Em análise' },
  { id: 'aprovado', rotulo: 'Publicados' },
  { id: 'rejeitado', rotulo: 'Rejeitados' },
];

function CartaoMeuEvento({ evento, categoria, aoExcluir }) {
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  async function excluir() {
    setExcluindo(true);
    try {
      await aoExcluir(evento.id);
    } finally {
      setExcluindo(false);
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
        <h2>{evento.titulo}</h2>
        <p className="pn-card-info">
          <span>◷ {formatarDataHora(evento.dataInicio)}</span>
          <span>⌖ {evento.localNome}{evento.cidade ? ` · ${evento.cidade}` : ''}</span>
          <span>{formatarPreco(evento)}</span>
        </p>

        {evento.status === 'pendente' && (
          <p className="pn-card-nota">Aguardando a análise da equipe. Ele aparece no site assim que for aprovado.</p>
        )}
        {evento.status === 'rejeitado' && evento.motivoRejeicao && (
          <div className="pn-motivo"><strong>Motivo da rejeição</strong>{evento.motivoRejeicao}</div>
        )}
        {evento.status === 'aprovado' && (
          <p className="pn-card-nota">Publicado no catálogo. Se você editar, ele volta para análise.</p>
        )}

        <div className="pn-card-acoes">
          {confirmando ? (
            <div className="pn-confirmar" role="group" aria-label="Confirmar exclusão">
              <span>Excluir este evento?</span>
              <button type="button" className="pn-botao pn-botao-perigo" onClick={excluir} disabled={excluindo}>
                {excluindo ? 'Excluindo…' : 'Sim, excluir'}
              </button>
              <button type="button" className="pn-link" onClick={() => setConfirmando(false)}>Cancelar</button>
            </div>
          ) : (
            <>
              <Link className="pn-botao pn-botao-claro" to={`/painel/eventos/${evento.id}/editar`}>
                {evento.status === 'rejeitado' ? 'Corrigir e reenviar' : 'Editar'}
              </Link>
              {evento.status === 'aprovado' && <Link className="pn-link" to={`/eventos/${evento.id}`}>Ver no site →</Link>}
              <button type="button" className="pn-link" onClick={() => setConfirmando(true)}>Excluir</button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function PerfilPublico() {
  const { usuario, atualizarUsuario } = useAuth();
  const [dados, setDados] = useState({
    nomePublico: usuario.nomePublico || '',
    descricao: usuario.descricao || '',
    contato: usuario.contato || '',
  });
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const alterar = (campo) => (e) => {
    setDados({ ...dados, [campo]: e.target.value });
    setErros({ ...erros, [campo]: undefined });
    setMensagem(null);
  };

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    setMensagem(null);
    try {
      const perfil = await atualizarMeuPerfil(dados);
      atualizarUsuario(perfil);
      setMensagem({ tipo: 'sucesso', texto: 'Perfil atualizado.' });
    } catch (falha) {
      setErros(Object.fromEntries((falha.erros || []).map((x) => [x.campo, x.mensagem])));
      setMensagem({ tipo: 'erro', texto: falha.message });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <aside className="pn-caixa" aria-labelledby="perfil-titulo">
      <span className="pn-kicker">Perfil público</span>
      <h2 id="perfil-titulo">Como você aparece</h2>
      <p>O nome público é exibido na página de cada evento que você publicar.</p>
      <form className="pn-form" onSubmit={salvar} noValidate>
        <Campo id="perfil-nome" rotulo="Nome público" erro={erros.nomePublico}>
          {(props) => <input {...props} value={dados.nomePublico} onChange={alterar('nomePublico')} maxLength={100} required />}
        </Campo>
        <Campo id="perfil-descricao" rotulo="Sobre" opcional erro={erros.descricao}>
          {(props) => <textarea {...props} rows={3} style={{ minHeight: 80 }} value={dados.descricao} onChange={alterar('descricao')} maxLength={1000} />}
        </Campo>
        <Campo id="perfil-contato" rotulo="Contato" opcional erro={erros.contato} ajuda="E-mail, telefone ou rede social.">
          {(props) => <input {...props} value={dados.contato} onChange={alterar('contato')} maxLength={150} />}
        </Campo>
        {mensagem && <p className={`pn-aviso pn-aviso-${mensagem.tipo}`} role={mensagem.tipo === 'erro' ? 'alert' : 'status'}>{mensagem.texto}</p>}
        <button type="submit" className="pn-botao pn-botao-verde" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar perfil'}</button>
      </form>
    </aside>
  );
}

export default function Painel() {
  const { usuario } = useAuth();
  const local = useLocation();
  const [eventos, setEventos] = useState(null);
  const [categorias, setCategorias] = useState({});
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [aviso, setAviso] = useState(local.state?.aviso || '');

  useEffect(() => {
    listarMeusEventos().then(setEventos).catch((falha) => { setErro(falha.message); setEventos([]); });
    listarCategorias()
      .then((lista) => setCategorias(Object.fromEntries(lista.map((c) => [c.id, c.nome]))))
      .catch(() => {});
  }, []);

  const contagem = useMemo(() => {
    const total = { todos: eventos?.length || 0, pendente: 0, aprovado: 0, rejeitado: 0 };
    (eventos || []).forEach((ev) => { total[ev.status] += 1; });
    return total;
  }, [eventos]);

  const visiveis = (eventos || []).filter((ev) => filtro === 'todos' || ev.status === filtro);

  async function aoExcluir(id) {
    try {
      await excluirEvento(id);
      setEventos((lista) => lista.filter((ev) => ev.id !== id));
      setAviso('Evento excluído.');
      setErro('');
    } catch (falha) {
      setErro(falha.message);
    }
  }

  return (
    <div className="pn-page">
      <header className="pn-topo">
        <div>
          <span className="pn-kicker">Painel do organizador</span>
          <h1>Olá, {usuario.nomePublico || usuario.nome}</h1>
          <p>Cadastre seus eventos e acompanhe a análise. Só os eventos aprovados aparecem no site.</p>
        </div>
        <Link to="/painel/novo" className="pn-botao">＋ Cadastrar evento</Link>
      </header>

      {aviso && <p className="pn-aviso pn-aviso-sucesso" role="status">{aviso}</p>}
      {erro && <p className="pn-aviso pn-aviso-erro" role="alert">{erro}</p>}

      <div className="pn-resumo" role="group" aria-label="Filtrar meus eventos por status">
        {FILTROS.map((item) => (
          <button key={item.id} type="button" className={`pn-resumo-item pn-resumo-${item.id}`}
            aria-pressed={filtro === item.id} onClick={() => setFiltro(item.id)}>
            <strong>{contagem[item.id]}</strong>
            <span>{item.rotulo}</span>
          </button>
        ))}
      </div>

      <div className="pn-grade">
        <section aria-label="Meus eventos">
          {eventos === null && <p className="pn-carregando" role="status">Carregando seus eventos…</p>}
          {eventos?.length === 0 && !erro && (
            <div className="pn-vazio">
              <span aria-hidden="true">✳</span>
              <h2>Nenhum evento ainda</h2>
              <p>Cadastre seu primeiro evento. A equipe do Itape + analisa antes de publicar.</p>
              <Link to="/painel/novo" className="pn-botao">＋ Cadastrar evento</Link>
            </div>
          )}
          {eventos?.length > 0 && visiveis.length === 0 && (
            <div className="pn-vazio"><h2>Nada por aqui</h2><p>Nenhum evento com este status.</p></div>
          )}
          <div className="pn-lista">
            {visiveis.map((evento) => (
              <CartaoMeuEvento key={evento.id} evento={evento}
                categoria={categorias[evento.categoriaId] || evento.categoriaId} aoExcluir={aoExcluir} />
            ))}
          </div>
        </section>
        <PerfilPublico />
      </div>
    </div>
  );
}
