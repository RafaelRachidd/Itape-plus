import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { atualizarEvento, buscarMeuEvento, criarEvento, listarCategorias } from '../services/api';
import { paraCampoDataHora } from '../utils/formatar';
import Campo from '../components/Campo';
import EtiquetaStatus from '../components/EtiquetaStatus';
import ImagemEvento from '../components/ImagemEvento';
import './Painel.css';

const VAZIO = {
  titulo: '', categoriaId: '', descricao: '', dataInicio: '', dataFim: '',
  localNome: '', endereco: '', cidade: 'Itapetininga', gratuito: true, preco: '',
  linkInscricao: '', imagemUrl: '', programacao: [],
};

// Converte o evento da API para os valores dos campos do formulário.
function paraFormulario(evento) {
  return {
    ...VAZIO,
    ...Object.fromEntries(Object.keys(VAZIO).map((campo) => [campo, evento[campo] ?? VAZIO[campo]])),
    dataInicio: paraCampoDataHora(evento.dataInicio),
    dataFim: paraCampoDataHora(evento.dataFim),
    preco: evento.preco != null ? String(evento.preco) : '',
    programacao: (evento.programacao || []).map((item) => ({ horario: item.horario || '', titulo: item.titulo || '' })),
  };
}

// Mínimo do campo de data: agora, no horário de Brasília.
const agoraBrasilia = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 16);

export default function FormEvento() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navegar = useNavigate();
  const [dados, setDados] = useState(VAZIO);
  const [original, setOriginal] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => setErroGeral('Não foi possível carregar as categorias.'));
  }, []);

  useEffect(() => {
    if (!editando) return;
    buscarMeuEvento(id)
      .then((evento) => { setOriginal(evento); setDados(paraFormulario(evento)); })
      .catch((falha) => setErroGeral(falha.message))
      .finally(() => setCarregando(false));
  }, [editando, id]);

  function alterar(campo, valor) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  }
  const campoTexto = (campo) => ({ value: dados[campo], onChange: (e) => alterar(campo, e.target.value) });

  function alterarAtividade(indice, campo, valor) {
    alterar('programacao', dados.programacao.map((item, i) => (i === indice ? { ...item, [campo]: valor } : item)));
  }

  async function salvar(e) {
    e.preventDefault();
    if (salvando) return;
    setErroGeral('');
    setErros({});
    setSalvando(true);

    const corpo = {
      ...dados,
      preco: dados.gratuito ? null : dados.preco.replace(',', '.'),
      dataFim: dados.dataFim || null,
      programacao: dados.programacao.filter((item) => item.titulo.trim() || item.horario.trim()),
    };

    try {
      if (editando) {
        await atualizarEvento(id, corpo);
        navegar('/painel', { state: { aviso: 'Alterações salvas. O evento voltou para análise da moderação.' } });
      } else {
        await criarEvento(corpo);
        navegar('/painel', { state: { aviso: 'Evento enviado! Ele aparece no site depois da aprovação.' } });
      }
    } catch (falha) {
      const porCampo = {};
      (falha.erros || []).forEach(({ campo, mensagem }) => {
        const chave = campo.startsWith('programacao') ? 'programacao' : campo;
        porCampo[chave] = porCampo[chave] || mensagem;
      });
      setErros(porCampo);
      setErroGeral(falha.erros?.length ? 'Confira os campos destacados.' : falha.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <div className="pn-page"><p className="pn-carregando" role="status">Carregando evento…</p></div>;

  if (editando && !original) {
    return (
      <div className="pn-page">
        <section className="pn-vazio">
          <h1>Evento indisponível</h1>
          <p>{erroGeral || 'Não encontramos este evento.'}</p>
          <Link to="/painel" className="pn-botao">Voltar ao painel</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="pn-page">
      <Link to="/painel" className="pn-voltar">← Voltar ao painel</Link>
      <header className="pn-topo">
        <div>
          <span className="pn-kicker">{editando ? 'Editar evento' : 'Novo evento'}</span>
          <h1>{editando ? dados.titulo || 'Editar evento' : 'Cadastrar evento'}</h1>
          <p>Preencha as informações do evento. A equipe do Itape + analisa antes de publicar no site.</p>
        </div>
        {original && <EtiquetaStatus status={original.status} />}
      </header>

      {editando && original?.status === 'aprovado' && (
        <p className="pn-aviso pn-aviso-info" role="note">Este evento já está publicado. Ao salvar, ele sai do site e volta para análise.</p>
      )}
      {original?.status === 'rejeitado' && original.motivoRejeicao && (
        <div className="pn-motivo"><strong>Motivo da rejeição</strong>{original.motivoRejeicao}</div>
      )}
      {erroGeral && <p className="pn-aviso pn-aviso-erro" role="alert">{erroGeral}</p>}

      <form className="pn-form" onSubmit={salvar} noValidate>
        <section className="pn-form-card" aria-labelledby="sec-sobre">
          <h2 id="sec-sobre">Sobre o evento</h2>
          <p>Título, categoria e uma descrição que ajude o público a decidir.</p>
          <div className="pn-campos">
            <Campo id="ev-titulo" rotulo="Título" erro={erros.titulo} largo>
              {(p) => <input {...p} {...campoTexto('titulo')} maxLength={150} placeholder="Ex.: Sarau na Praça" required />}
            </Campo>
            <Campo id="ev-categoria" rotulo="Categoria" erro={erros.categoriaId}>
              {(p) => (
                <select {...p} {...campoTexto('categoriaId')} required>
                  <option value="">Escolha uma categoria</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              )}
            </Campo>
            <Campo id="ev-inscricao" rotulo="Link de inscrição" opcional erro={erros.linkInscricao}>
              {(p) => <input {...p} type="url" {...campoTexto('linkInscricao')} placeholder="https://" maxLength={500} />}
            </Campo>
            <Campo id="ev-descricao" rotulo="Descrição" erro={erros.descricao} largo>
              {(p) => <textarea {...p} {...campoTexto('descricao')} maxLength={5000} placeholder="Conte o que vai acontecer, para quem é, o que levar…" required />}
            </Campo>
          </div>
        </section>

        <section className="pn-form-card" aria-labelledby="sec-quando">
          <h2 id="sec-quando">Quando e onde</h2>
          <p>Horário de Brasília.</p>
          <div className="pn-campos">
            <Campo id="ev-inicio" rotulo="Início" erro={erros.dataInicio}>
              {(p) => <input {...p} type="datetime-local" min={editando ? undefined : agoraBrasilia()} {...campoTexto('dataInicio')} required />}
            </Campo>
            <Campo id="ev-fim" rotulo="Término" opcional erro={erros.dataFim}>
              {(p) => <input {...p} type="datetime-local" min={dados.dataInicio || undefined} {...campoTexto('dataFim')} />}
            </Campo>
            <Campo id="ev-local" rotulo="Nome do local" erro={erros.localNome}>
              {(p) => <input {...p} {...campoTexto('localNome')} maxLength={150} placeholder="Ex.: Teatro Municipal" required />}
            </Campo>
            <Campo id="ev-cidade" rotulo="Cidade" opcional erro={erros.cidade}>
              {(p) => <input {...p} {...campoTexto('cidade')} maxLength={100} />}
            </Campo>
            <Campo id="ev-endereco" rotulo="Endereço" erro={erros.endereco} largo>
              {(p) => <input {...p} {...campoTexto('endereco')} maxLength={255} placeholder="Rua, número e bairro" required />}
            </Campo>
          </div>
        </section>

        <section className="pn-form-card" aria-labelledby="sec-entrada">
          <h2 id="sec-entrada">Entrada e imagem</h2>
          <p>Use uma imagem pública (link começando com https://). Se ela não carregar, o site mostra uma capa padrão.</p>
          <label className="pn-check">
            <input type="checkbox" checked={dados.gratuito} onChange={(e) => alterar('gratuito', e.target.checked)} />
            Entrada gratuita
          </label>
          <div className="pn-campos">
            {!dados.gratuito && (
              <Campo id="ev-preco" rotulo="Preço do ingresso (R$)" erro={erros.preco}>
                {(p) => <input {...p} inputMode="decimal" {...campoTexto('preco')} placeholder="Ex.: 25,00" required />}
              </Campo>
            )}
            <Campo id="ev-imagem" rotulo="URL da imagem" opcional erro={erros.imagemUrl} largo>
              {(p) => <input {...p} type="url" {...campoTexto('imagemUrl')} placeholder="https://…" maxLength={500} />}
            </Campo>
          </div>
          <div className="pn-previa" aria-live="polite">
            <ImagemEvento key={dados.imagemUrl} url={dados.imagemUrl} titulo={dados.titulo} className="pn-previa-imagem" />
            <span>Prévia da capa do evento.</span>
          </div>
        </section>

        <section className="pn-form-card" aria-labelledby="sec-programacao">
          <h2 id="sec-programacao">Programação <small style={{ fontSize: 14, color: '#8f7f75' }}>(opcional)</small></h2>
          <p>Liste as atividades na ordem em que acontecem.</p>
          {erros.programacao && <p className="pn-campo-erro" role="alert" style={{ marginBottom: 12 }}>{erros.programacao}</p>}
          {dados.programacao.map((item, indice) => (
            <div className="pn-programacao-linha" key={indice}>
              <Campo id={`ev-prog-hora-${indice}`} rotulo="Horário">
                {(p) => <input {...p} value={item.horario} maxLength={20} placeholder="19:00"
                  onChange={(e) => alterarAtividade(indice, 'horario', e.target.value)} />}
              </Campo>
              <Campo id={`ev-prog-titulo-${indice}`} rotulo="Atividade">
                {(p) => <input {...p} value={item.titulo} maxLength={150} placeholder="Ex.: Abertura com a banda municipal"
                  onChange={(e) => alterarAtividade(indice, 'titulo', e.target.value)} />}
              </Campo>
              <button type="button" className="pn-botao pn-botao-perigo" style={{ marginTop: 26 }}
                aria-label={`Remover atividade ${indice + 1}`}
                onClick={() => alterar('programacao', dados.programacao.filter((_, i) => i !== indice))}>✕</button>
            </div>
          ))}
          {dados.programacao.length < 20 && (
            <button type="button" className="pn-botao pn-botao-claro"
              onClick={() => alterar('programacao', [...dados.programacao, { horario: '', titulo: '' }])}>＋ Adicionar atividade</button>
          )}
        </section>

        <div className="pn-form-acoes">
          <Link to="/painel" className="pn-link">Cancelar</Link>
          <button type="submit" className="pn-botao" disabled={salvando}>
            {salvando ? 'Enviando…' : editando ? 'Salvar e reenviar para análise' : 'Enviar para análise →'}
          </button>
        </div>
      </form>
    </div>
  );
}
