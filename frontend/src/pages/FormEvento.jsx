import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { atualizarEvento, buscarMeuEvento, criarEvento, listarCategorias } from '../services/api';
import Campo from '../components/Campo';
import EtiquetaStatus from '../components/EtiquetaStatus';
import { agoraCampoDataHora, paraCampoDataHora } from '../utils/formatar';

const VAZIO = {
  titulo: '', categoria_id: '', descricao: '', data_inicio: '', data_fim: '',
  local_nome: '', endereco: '', cidade: 'Itapetininga',
  gratuito: true, preco: '', link_inscricao: '', imagem_url: '',
};

// RF08 (cadastrar) e RF09 (editar). Ao salvar, o evento vai (ou volta) para análise (RN01, RN05).
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
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    if (!editando) return;
    buscarMeuEvento(id)
      .then((evento) => {
        setOriginal(evento);
        setDados({
          titulo: evento.titulo,
          categoria_id: String(evento.categoria_id),
          descricao: evento.descricao,
          data_inicio: paraCampoDataHora(evento.data_inicio),
          data_fim: paraCampoDataHora(evento.data_fim),
          local_nome: evento.local_nome,
          endereco: evento.endereco,
          cidade: evento.cidade,
          gratuito: evento.gratuito,
          preco: evento.preco ?? '',
          link_inscricao: evento.link_inscricao ?? '',
          imagem_url: evento.imagem_url ?? '',
        });
      })
      .catch((e) => setErroGeral(e.status === 403 || e.status === 404 ? 'Evento não encontrado.' : e.message))
      .finally(() => setCarregando(false));
  }, [editando, id]);

  // Validação no navegador (RNF04); a API valida de novo e devolve o erro de cada campo.
  function validar() {
    const e = {};
    if (dados.titulo.trim().length < 3) e.titulo = 'Informe o título (pelo menos 3 caracteres).';
    if (!dados.categoria_id) e.categoria_id = 'Escolha uma categoria.';
    if (dados.descricao.trim().length < 10) e.descricao = 'Descreva o evento (pelo menos 10 caracteres).';
    if (!dados.data_inicio) e.data_inicio = 'Informe a data e o horário de início.';
    else if (dados.data_inicio < agoraCampoDataHora()) e.data_inicio = 'A data de início não pode estar no passado.';
    if (dados.data_fim && dados.data_inicio && dados.data_fim < dados.data_inicio) e.data_fim = 'O término deve ser depois do início.';
    if (dados.local_nome.trim().length < 2) e.local_nome = 'Informe o nome do local.';
    if (dados.endereco.trim().length < 5) e.endereco = 'Informe o endereço completo.';
    if (!dados.gratuito && !(Number(dados.preco) > 0)) e.preco = 'Informe o preço do ingresso.';
    for (const campo of ['link_inscricao', 'imagem_url']) {
      if (dados[campo] && !/^https?:\/\//i.test(dados[campo])) e[campo] = 'Deve começar com http:// ou https://';
    }
    return e;
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErroGeral('');
    const encontrados = validar();
    setErros(encontrados);
    if (Object.keys(encontrados).length) {
      document.getElementById(Object.keys(encontrados)[0])?.focus();
      return;
    }

    const corpo = {
      ...dados,
      categoria_id: Number(dados.categoria_id),
      preco: dados.gratuito ? null : Number(dados.preco),
    };

    setEnviando(true);
    try {
      if (editando) await atualizarEvento(id, corpo);
      else await criarEvento(corpo);
      navegar('/painel', {
        state: { aviso: 'Evento enviado para análise. Ele aparecerá no catálogo depois da aprovação.' },
      });
    } catch (e) {
      setErros(e.campos || {});
      setErroGeral(Object.keys(e.campos || {}).length ? 'Confira os campos destacados.' : e.message);
      setEnviando(false);
    }
  }

  // Ao digitar, o erro daquele campo some.
  const mudar = (campo) => (e) => {
    setDados({ ...dados, [campo]: e.target.value });
    if (erros[campo]) setErros({ ...erros, [campo]: undefined });
  };

  if (carregando) return <p className="aviso" role="status">Carregando evento...</p>;

  if (editando && !original) {
    return (
      <section className="destaque">
        <h1>{erroGeral || 'Evento não encontrado.'}</h1>
        <Link to="/painel" className="botao">Voltar ao painel</Link>
      </section>
    );
  }

  return (
    <section className="form-evento">
      <Link to="/painel" className="voltar">← Voltar ao painel</Link>
      <h1 className="titulo-pagina">{editando ? 'Editar evento' : 'Cadastrar evento'}</h1>

      {editando && original.status === 'rejeitado' && (
        <p className="motivo-rejeicao">
          <strong>Motivo da rejeição:</strong> {original.motivo_rejeicao}
        </p>
      )}
      {editando && (
        <p className="aviso-form aviso-atencao">
          Situação atual: <EtiquetaStatus status={original.status} />.{' '}
          Ao salvar, o evento volta para análise
          {original.status === 'aprovado' ? ' e sai do catálogo até ser aprovado de novo' : ''}.
        </p>
      )}
      {erroGeral && <p className="aviso-form aviso-erro" role="alert">{erroGeral}</p>}

      <form onSubmit={enviar} noValidate>
        <fieldset>
          <legend>Informações</legend>
          <Campo id="titulo" rotulo="Título" erro={erros.titulo}>
            {(p) => <input {...p} value={dados.titulo} onChange={mudar('titulo')} maxLength={150} />}
          </Campo>
          <Campo id="categoria_id" rotulo="Categoria" erro={erros.categoria_id}>
            {(p) => (
              <select {...p} value={dados.categoria_id} onChange={mudar('categoria_id')}>
                <option value="">Escolha...</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            )}
          </Campo>
          <Campo id="descricao" rotulo="Descrição" erro={erros.descricao} dica="O que vai acontecer, para quem é, o que levar.">
            {(p) => <textarea {...p} rows={5} value={dados.descricao} onChange={mudar('descricao')} maxLength={5000} />}
          </Campo>
        </fieldset>

        <fieldset>
          <legend>Data e local</legend>
          <div className="grade-campos">
            <Campo id="data_inicio" rotulo="Início" erro={erros.data_inicio}>
              {(p) => <input {...p} type="datetime-local" min={agoraCampoDataHora()} value={dados.data_inicio} onChange={mudar('data_inicio')} />}
            </Campo>
            <Campo id="data_fim" rotulo="Término (opcional)" erro={erros.data_fim}>
              {(p) => <input {...p} type="datetime-local" min={dados.data_inicio || undefined} value={dados.data_fim} onChange={mudar('data_fim')} />}
            </Campo>
          </div>
          <Campo id="local_nome" rotulo="Nome do local" erro={erros.local_nome} dica="Ex.: Teatro Municipal">
            {(p) => <input {...p} value={dados.local_nome} onChange={mudar('local_nome')} maxLength={150} />}
          </Campo>
          <div className="grade-campos">
            <Campo id="endereco" rotulo="Endereço" erro={erros.endereco}>
              {(p) => <input {...p} value={dados.endereco} onChange={mudar('endereco')} maxLength={255} />}
            </Campo>
            <Campo id="cidade" rotulo="Cidade" erro={erros.cidade}>
              {(p) => <input {...p} value={dados.cidade} onChange={mudar('cidade')} maxLength={100} />}
            </Campo>
          </div>
        </fieldset>

        <fieldset>
          <legend>Valor e divulgação</legend>
          <div className="campo campo-check">
            <input
              id="gratuito"
              type="checkbox"
              checked={dados.gratuito}
              onChange={(e) => setDados({ ...dados, gratuito: e.target.checked, preco: e.target.checked ? '' : dados.preco })}
            />
            <label htmlFor="gratuito">Evento gratuito</label>
          </div>
          {!dados.gratuito && (
            <Campo id="preco" rotulo="Preço (R$)" erro={erros.preco}>
              {(p) => <input {...p} type="number" min="0.01" step="0.01" inputMode="decimal" value={dados.preco} onChange={mudar('preco')} />}
            </Campo>
          )}
          <Campo id="link_inscricao" rotulo="Link de inscrição (opcional)" erro={erros.link_inscricao}>
            {(p) => <input {...p} type="url" placeholder="https://" value={dados.link_inscricao} onChange={mudar('link_inscricao')} maxLength={500} />}
          </Campo>
          <Campo id="imagem_url" rotulo="URL da imagem de divulgação (opcional)" erro={erros.imagem_url}>
            {(p) => <input {...p} type="url" placeholder="https://" value={dados.imagem_url} onChange={mudar('imagem_url')} maxLength={500} />}
          </Campo>
        </fieldset>

        <div className="form-botoes">
          <Link to="/painel" className="botao-texto">Cancelar</Link>
          <button type="submit" className="botao" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar para análise'}
          </button>
        </div>
      </form>
    </section>
  );
}
