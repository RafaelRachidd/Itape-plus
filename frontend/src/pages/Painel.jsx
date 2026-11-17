import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { excluirEvento, listarMeusEventos } from '../services/api';
import { useAuth } from '../contexto/AuthContext';
import EtiquetaStatus from '../components/EtiquetaStatus';
import { formatarData, formatarHora } from '../utils/formatar';

// RF09 + RF10 + RF13: eventos do organizador, com status e motivo da rejeição.
export default function Painel() {
  const { usuario } = useAuth();
  const local = useLocation();
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState(local.state?.aviso || '');
  const [confirmando, setConfirmando] = useState(null);

  useEffect(() => {
    listarMeusEventos()
      .then(setEventos)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  async function excluir(evento) {
    try {
      await excluirEvento(evento.id);
      setEventos((lista) => lista.filter((e) => e.id !== evento.id));
      setAviso(`"${evento.titulo}" foi excluído.`);
    } catch (e) {
      setAviso('');
      setErro(e.message);
    } finally {
      setConfirmando(null);
    }
  }

  const contar = (status) => eventos.filter((e) => e.status === status).length;

  return (
    <>
      <div className="painel-topo">
        <div>
          <h1 className="titulo-pagina">Olá, {usuario.nome_publico || usuario.nome}</h1>
          <p className="texto-suave">Acompanhe e gerencie os seus eventos.</p>
        </div>
        <div className="painel-acoes">
          <Link to="/painel/perfil" className="botao-secundario">Meu perfil</Link>
          <Link to="/painel/eventos/novo" className="botao">Cadastrar evento</Link>
        </div>
      </div>

      {aviso && <p className="aviso-form aviso-sucesso" role="status">{aviso}</p>}
      {erro && <p className="aviso-form aviso-erro" role="alert">{erro}</p>}

      <div className="resumo">
        <div className="resumo-item"><strong>{eventos.length}</strong><span>Total</span></div>
        <div className="resumo-item resumo-aprovado"><strong>{contar('aprovado')}</strong><span>Aprovados</span></div>
        <div className="resumo-item resumo-pendente"><strong>{contar('pendente')}</strong><span>Em análise</span></div>
        <div className="resumo-item resumo-rejeitado"><strong>{contar('rejeitado')}</strong><span>Rejeitados</span></div>
      </div>

      {carregando && <p className="aviso" role="status">Carregando seus eventos...</p>}

      {!carregando && !erro && eventos.length === 0 && (
        <div className="aviso">
          <p>Você ainda não cadastrou eventos.</p>
          <Link to="/painel/eventos/novo" className="botao">Cadastrar o primeiro evento</Link>
        </div>
      )}

      <ul className="lista-painel">
        {eventos.map((evento) => (
          <li key={evento.id} className="item-painel">
            <div className="item-painel-info">
              <div className="item-painel-titulo">
                <h2>{evento.titulo}</h2>
                <EtiquetaStatus status={evento.status} />
              </div>
              <p className="texto-suave">
                {evento.categoria} · {formatarData(evento.data_inicio)} · {formatarHora(evento.data_inicio)} · {evento.local_nome}
              </p>
              {evento.status === 'pendente' && (
                <p className="nota-status">Em análise pela administração. Ainda não aparece no catálogo.</p>
              )}
              {evento.status === 'rejeitado' && (
                <p className="motivo-rejeicao">
                  <strong>Motivo da rejeição:</strong> {evento.motivo_rejeicao}
                </p>
              )}
            </div>

            <div className="item-painel-acoes">
              {evento.status === 'aprovado' && (
                <Link to={`/eventos/${evento.id}`} className="botao-texto">Ver publicado</Link>
              )}
              <Link to={`/painel/eventos/${evento.id}/editar`} className="botao-secundario">
                {evento.status === 'rejeitado' ? 'Corrigir e reenviar' : 'Editar'}
              </Link>
              {confirmando === evento.id ? (
                <span className="confirmar-exclusao" role="group" aria-label="Confirmar exclusão">
                  Excluir mesmo?
                  <button type="button" className="botao-perigo" onClick={() => excluir(evento)}>Sim, excluir</button>
                  <button type="button" className="botao-texto" onClick={() => setConfirmando(null)}>Cancelar</button>
                </span>
              ) : (
                <button type="button" className="botao-texto botao-texto-perigo" onClick={() => setConfirmando(evento.id)}>
                  Excluir
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
