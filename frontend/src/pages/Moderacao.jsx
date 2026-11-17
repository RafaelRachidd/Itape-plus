import { useCallback, useEffect, useState } from 'react';
import {
  aprovarEvento, buscarResumoModeracao, listarParaModeracao, rejeitarEvento,
} from '../services/api';
import EtiquetaStatus from '../components/EtiquetaStatus';
import { formatarDataCompleta, formatarHora, formatarPreco } from '../utils/formatar';

const ABAS = [
  { status: 'pendente', nome: 'Pendentes' },
  { status: 'aprovado', nome: 'Aprovados' },
  { status: 'rejeitado', nome: 'Rejeitados' },
];

const SUGESTOES = [
  'Informações incompletas na descrição.',
  'Data ou horário inválidos.',
  'Endereço incompleto.',
  'Conteúdo fora do escopo cultural ou educacional.',
];

function dataEnvio(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo',
  });
}

// RF11, RF12, RF13: fila de moderação do administrador.
export default function Moderacao() {
  const [aba, setAba] = useState('pendente');
  const [resumo, setResumo] = useState({ pendente: 0, aprovado: 0, rejeitado: 0 });
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState(null);
  const [rejeitando, setRejeitando] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [erroMotivo, setErroMotivo] = useState('');
  const [mensagem, setMensagem] = useState(null);

  const carregar = useCallback(async (status) => {
    setCarregando(true);
    try {
      const [lista, contagem] = await Promise.all([listarParaModeracao(status), buscarResumoModeracao()]);
      setEventos(lista);
      setResumo(contagem);
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar(aba);
  }, [aba, carregar]);

  function trocarAba(status) {
    setAba(status);
    setAberto(null);
    setRejeitando(null);
    setMensagem(null);
  }

  async function aprovar(evento) {
    try {
      await aprovarEvento(evento.id);
      setMensagem({ tipo: 'sucesso', texto: `"${evento.titulo}" foi aprovado e já aparece no catálogo.` });
      carregar(aba);
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
      carregar(aba);
    }
  }

  async function confirmarRejeicao(evento) {
    if (motivo.trim().length < 5) {
      setErroMotivo('Escreva o motivo (pelo menos 5 caracteres). O organizador vai ler esta mensagem.');
      return;
    }
    try {
      await rejeitarEvento(evento.id, motivo.trim());
      setMensagem({ tipo: 'sucesso', texto: `"${evento.titulo}" foi rejeitado. O organizador verá o motivo no painel.` });
      setRejeitando(null);
      setMotivo('');
      carregar(aba);
    } catch (e) {
      setErroMotivo(e.campos?.motivo || e.message);
    }
  }

  return (
    <>
      <h1 className="titulo-pagina">Moderação</h1>
      <p className="texto-suave">Confira data, local, preço e descrição antes de publicar.</p>

      <div className="abas" role="tablist" aria-label="Situação dos eventos">
        {ABAS.map((a) => (
          <button
            key={a.status}
            type="button"
            role="tab"
            aria-selected={aba === a.status}
            className={`aba ${aba === a.status ? 'aba-ativa' : ''}`}
            onClick={() => trocarAba(a.status)}
          >
            {a.nome} <span className="contador">{resumo[a.status]}</span>
          </button>
        ))}
      </div>

      {mensagem && (
        <p className={`aviso-form aviso-${mensagem.tipo}`} role={mensagem.tipo === 'erro' ? 'alert' : 'status'}>
          {mensagem.texto}
        </p>
      )}

      {carregando && <p className="aviso" role="status">Carregando...</p>}
      {!carregando && eventos.length === 0 && (
        <p className="aviso" role="status">
          {aba === 'pendente' ? 'Nenhum evento aguardando análise.' : 'Nenhum evento nesta lista.'}
        </p>
      )}

      <ul className="lista-painel">
        {!carregando && eventos.map((evento) => (
          <li key={evento.id} className="item-painel item-moderacao">
            <div className="item-painel-info">
              <div className="item-painel-titulo">
                <h2>{evento.titulo}</h2>
                <EtiquetaStatus status={evento.status} />
              </div>
              <p className="texto-suave">
                {evento.categoria} · por {evento.organizador_nome} · enviado em {dataEnvio(evento.atualizado_em)}
              </p>
              {evento.status === 'rejeitado' && (
                <p className="motivo-rejeicao"><strong>Motivo:</strong> {evento.motivo_rejeicao}</p>
              )}

              <button
                type="button"
                className="botao-texto"
                aria-expanded={aberto === evento.id}
                onClick={() => setAberto(aberto === evento.id ? null : evento.id)}
              >
                {aberto === evento.id ? 'Ocultar detalhes' : 'Ver detalhes'}
              </button>

              {aberto === evento.id && (
                <dl className="detalhes-info detalhes-moderacao">
                  <div><dt>Data</dt><dd>{formatarDataCompleta(evento.data_inicio)}, {formatarHora(evento.data_inicio)}{evento.data_fim && ` às ${formatarHora(evento.data_fim)}`}</dd></div>
                  <div><dt>Local</dt><dd>{evento.local_nome}<br />{evento.endereco} · {evento.cidade}</dd></div>
                  <div><dt>Valor</dt><dd>{formatarPreco(evento.gratuito, evento.preco)}</dd></div>
                  <div><dt>Organizador</dt><dd>{evento.organizador_nome}<br />{evento.organizador_email}{evento.organizador_contato && <><br />{evento.organizador_contato}</>}</dd></div>
                  <div className="detalhes-largo"><dt>Descrição</dt><dd className="descricao">{evento.descricao}</dd></div>
                  {evento.link_inscricao && <div className="detalhes-largo"><dt>Inscrição</dt><dd>{evento.link_inscricao}</dd></div>}
                  {evento.imagem_url && <div className="detalhes-largo"><dt>Imagem</dt><dd>{evento.imagem_url}</dd></div>}
                </dl>
              )}

              {rejeitando === evento.id && (
                <div className="caixa-rejeicao">
                  <label htmlFor={`motivo-${evento.id}`}>Motivo da rejeição (obrigatório)</label>
                  <div className="sugestoes">
                    {SUGESTOES.map((s) => (
                      <button key={s} type="button" className="chip" onClick={() => { setMotivo(s); setErroMotivo(''); }}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <textarea
                    id={`motivo-${evento.id}`}
                    rows={3}
                    maxLength={500}
                    value={motivo}
                    aria-invalid={erroMotivo ? true : undefined}
                    onChange={(e) => { setMotivo(e.target.value); setErroMotivo(''); }}
                  />
                  {erroMotivo && <small className="campo-erro" role="alert">{erroMotivo}</small>}
                  <div className="form-botoes">
                    <button type="button" className="botao-texto" onClick={() => { setRejeitando(null); setMotivo(''); setErroMotivo(''); }}>Cancelar</button>
                    <button type="button" className="botao-perigo" disabled={motivo.trim().length < 5} onClick={() => confirmarRejeicao(evento)}>
                      Confirmar rejeição
                    </button>
                  </div>
                </div>
              )}
            </div>

            {evento.status === 'pendente' && rejeitando !== evento.id && (
              <div className="item-painel-acoes">
                <button type="button" className="botao botao-sem-margem" onClick={() => aprovar(evento)}>Aprovar</button>
                <button type="button" className="botao-secundario" onClick={() => { setRejeitando(evento.id); setMotivo(''); setErroMotivo(''); }}>
                  Rejeitar
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
