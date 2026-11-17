import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarProximosEventos } from '../services/api';
import ListaEventos from '../components/ListaEventos';

// RF01: próximos eventos aprovados, do mais próximo ao mais distante.
export default function Inicio() {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    listarProximosEventos(6)
      .then(setEventos)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <>
      <section className="destaque">
        <h1>A cultura da nossa região em um só lugar</h1>
        <p>Eventos culturais e educacionais de Itapetininga e região.</p>
        <Link to="/eventos" className="botao">Ver todos os eventos</Link>
      </section>

      <section aria-labelledby="titulo-proximos">
        <h2 id="titulo-proximos" className="titulo-secao">Próximos eventos</h2>
        <ListaEventos
          eventos={eventos}
          carregando={carregando}
          erro={erro}
          vazio="Nenhum evento programado no momento."
        />
      </section>
    </>
  );
}
