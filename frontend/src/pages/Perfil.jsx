import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { atualizarPerfil, buscarPerfil } from '../services/api';
import { useAuth } from '../contexto/AuthContext';
import Campo from '../components/Campo';

// RF16: dados públicos do organizador, exibidos nos detalhes dos eventos (RF15).
export default function Perfil() {
  const { atualizarUsuario } = useAuth();
  const [dados, setDados] = useState({ nome_publico: '', descricao: '', contato: '' });
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    buscarPerfil()
      .then((p) => setDados({ nome_publico: p.nome_publico || p.nome, descricao: p.descricao || '', contato: p.contato || '' }))
      .catch((e) => setMensagem({ tipo: 'erro', texto: e.message }))
      .finally(() => setCarregando(false));
  }, []);

  async function enviar(evento) {
    evento.preventDefault();
    setMensagem(null);
    if (dados.nome_publico.trim().length < 2) {
      setErros({ nome_publico: 'Informe o nome público (pelo menos 2 caracteres).' });
      return;
    }
    setErros({});
    setEnviando(true);
    try {
      const atualizado = await atualizarPerfil(dados);
      atualizarUsuario({ nome_publico: atualizado.nome_publico });
      setMensagem({ tipo: 'sucesso', texto: 'Perfil atualizado. Os novos dados já aparecem nos seus eventos.' });
    } catch (e) {
      setErros(e.campos || {});
      setMensagem({ tipo: 'erro', texto: e.message });
    } finally {
      setEnviando(false);
    }
  }

  // Ao digitar, o erro daquele campo some.
  const mudar = (campo) => (e) => {
    setDados({ ...dados, [campo]: e.target.value });
    if (erros[campo]) setErros({ ...erros, [campo]: undefined });
  };

  if (carregando) return <p className="aviso" role="status">Carregando perfil...</p>;

  return (
    <section className="cartao-form cartao-form-largo">
      <Link to="/painel" className="voltar">← Voltar ao painel</Link>
      <h1>Meu perfil</h1>
      <p className="texto-suave">Estes dados aparecem na página dos seus eventos aprovados.</p>

      {mensagem && (
        <p className={`aviso-form aviso-${mensagem.tipo}`} role={mensagem.tipo === 'erro' ? 'alert' : 'status'}>
          {mensagem.texto}
        </p>
      )}

      <form onSubmit={enviar} noValidate>
        <Campo id="nome_publico" rotulo="Nome público" erro={erros.nome_publico} dica="Como o público vai ver você: nome artístico, coletivo ou instituição.">
          {(p) => <input {...p} value={dados.nome_publico} onChange={mudar('nome_publico')} maxLength={100} />}
        </Campo>
        <Campo id="descricao" rotulo="Sobre (opcional)" erro={erros.descricao}>
          {(p) => <textarea {...p} rows={4} value={dados.descricao} onChange={mudar('descricao')} maxLength={1000} />}
        </Campo>
        <Campo id="contato" rotulo="Contato público (opcional)" erro={erros.contato} dica="Telefone, e-mail ou rede social.">
          {(p) => <input {...p} value={dados.contato} onChange={mudar('contato')} maxLength={150} />}
        </Campo>
        <button type="submit" className="botao" disabled={enviando}>
          {enviando ? 'Salvando...' : 'Salvar perfil'}
        </button>
      </form>

      <div className="previa-organizador" aria-label="Prévia">
        <span className="texto-suave">Prévia na página do evento</span>
        <aside className="organizador">
          <h2>Organização</h2>
          <p><strong>{dados.nome_publico || '—'}</strong></p>
          {dados.contato && <p>Contato: {dados.contato}</p>}
        </aside>
      </div>
    </section>
  );
}
