
import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [mensagem, setMensagem] = useState('Conectando...');
  const [erro, setErro] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3001/api/health')
      .then((resposta) => {
        if (!resposta.ok) {
          throw new Error('Erro ao consultar API');
        }
        return resposta.json();
      })
      .then((dados) => {
        setMensagem(dados.mensagem);
        setErro(false);
      })
      .catch(() => {
        setMensagem('Não foi possível conectar à API.');
        setErro(true);
      });
  }, []);

  return (
    <main>
      <h1>Itape+</h1>
      <h2>Mais cultura e mais acesso à educação</h2>

      <p>
        Descubra eventos culturais, cursos e oficinas
        em Itapetininga.
      </p>

      <h3>Status da API</h3>
      <p>{mensagem}</p>

      {erro && <p>Verifique se o Express está ligado.</p>}
    </main>
  );
}

export default App;
