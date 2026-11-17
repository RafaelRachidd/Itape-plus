import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listarCategorias, listarEventos } from '../services/api';
import ListaEventos from '../components/ListaEventos';

// RF02, RF03, RF04, RF14: catálogo com busca e filtros combináveis.
// Os filtros ficam na URL (?categoria=musica...), então o link pode ser compartilhado.
export default function Eventos() {
  const [params, setParams] = useSearchParams();
  const [categorias, setCategorias] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState(params.get('busca') || '');

  const filtros = {
    busca: params.get('busca') || '',
    categoria: params.get('categoria') || '',
    dataInicio: params.get('dataInicio') || '',
    dataFim: params.get('dataFim') || '',
    gratuito: params.get('gratuito') === 'true',
  };
  const chave = params.toString();

  useEffect(() => {
    listarCategorias().then(setCategorias).catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    setCarregando(true);
    setErro('');
    listarEventos(filtros)
      .then(setEventos)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  function atualizar(campo, valor) {
    const novos = new URLSearchParams(params);
    if (valor) novos.set(campo, valor);
    else novos.delete(campo);
    setParams(novos);
  }

  function enviarBusca(evento) {
    evento.preventDefault();
    atualizar('busca', busca.trim());
  }

  function limpar() {
    setBusca('');
    setParams({});
  }

  const temFiltro = chave.length > 0;
  const categoriaAtual = categorias.find((c) => c.slug === filtros.categoria);

  return (
    <>
      <h1 className="titulo-pagina">{categoriaAtual ? categoriaAtual.nome : 'Eventos'}</h1>

      <form className="filtros" onSubmit={enviarBusca} role="search">
        <div className="campo campo-busca">
          <label htmlFor="busca">Buscar por título</label>
          <div className="busca-linha">
            <input
              id="busca"
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Ex.: teatro, oficina..."
              maxLength={100}
            />
            <button type="submit" className="botao">Buscar</button>
          </div>
        </div>

        <div className="campo">
          <label htmlFor="categoria">Categoria</label>
          <select
            id="categoria"
            value={filtros.categoria}
            onChange={(e) => atualizar('categoria', e.target.value)}
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.slug}>{c.nome}</option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="dataInicio">De</label>
          <input
            id="dataInicio"
            type="date"
            value={filtros.dataInicio}
            onChange={(e) => atualizar('dataInicio', e.target.value)}
          />
        </div>

        <div className="campo">
          <label htmlFor="dataFim">Até</label>
          <input
            id="dataFim"
            type="date"
            value={filtros.dataFim}
            min={filtros.dataInicio || undefined}
            onChange={(e) => atualizar('dataFim', e.target.value)}
          />
        </div>

        <div className="campo campo-check">
          <input
            id="gratuito"
            type="checkbox"
            checked={filtros.gratuito}
            onChange={(e) => atualizar('gratuito', e.target.checked ? 'true' : '')}
          />
          <label htmlFor="gratuito">Somente gratuitos</label>
        </div>

        {temFiltro && (
          <button type="button" className="botao-texto" onClick={limpar}>
            Limpar filtros
          </button>
        )}
      </form>

      {!carregando && !erro && (
        <p className="contagem" role="status">
          {eventos.length === 1 ? '1 evento encontrado' : `${eventos.length} eventos encontrados`}
        </p>
      )}

      <ListaEventos eventos={eventos} carregando={carregando} erro={erro} />
    </>
  );
}
