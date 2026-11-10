import { useEffect, useState } from 'react';
import { verificarApi } from '../services/api';

// Página inicial. Na v0.1.0 mostra só a conexão com a API;
// a lista dos próximos eventos (RF01) entra na v0.2.0.
export default function Inicio() {
  const [status, setStatus] = useState({ carregando: true });

  useEffect(() => {
    verificarApi()
      .then((dados) => setStatus({ ok: true, dados }))
      .catch((erro) => setStatus({ ok: false, mensagem: erro.message }));
  }, []);

  return (
    <section className="destaque">
      <h1>A cultura da nossa região em um só lugar</h1>
      <p>Eventos culturais e educacionais de Itapetininga e região.</p>

      <div className="status" role="status">
        {status.carregando && 'Verificando a conexão com a API...'}
        {status.ok && `API conectada: ${status.dados.categorias} categorias no banco.`}
        {status.ok === false && `API indisponível: ${status.mensagem}`}
      </div>
    </section>
  );
}
