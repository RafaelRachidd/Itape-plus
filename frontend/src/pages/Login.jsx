import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexto/AuthContext';
import Campo from '../components/Campo';

// RF07: login de organizador e administrador.
export default function Login() {
  const { usuario, entrar } = useAuth();
  const navegar = useNavigate();
  const [params] = useSearchParams();
  const [dados, setDados] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const destinoPadrao = (u) => (u.perfil === 'admin' ? '/admin' : '/painel');

  // Já logado ao abrir a página: vai direto para a sua área.
  if (usuario && !enviando) return <Navigate to={destinoPadrao(usuario)} replace />;

  async function enviar(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const logado = await entrar(dados);
      navegar(params.get('voltar') || destinoPadrao(logado), { replace: true });
    } catch (e) {
      setErro(e.message);
      setEnviando(false);
    }
  }

  const mudar = (campo) => (e) => setDados({ ...dados, [campo]: e.target.value });

  return (
    <section className="cartao-form">
      <h1>Entrar</h1>
      <p className="texto-suave">Área para organizadores e administração.</p>

      {erro && <p className="aviso-form aviso-erro" role="alert">{erro}</p>}

      <form onSubmit={enviar} noValidate>
        <Campo id="email" rotulo="E-mail">
          {(props) => <input {...props} type="email" autoComplete="email" required value={dados.email} onChange={mudar('email')} />}
        </Campo>
        <Campo id="senha" rotulo="Senha">
          {(props) => <input {...props} type="password" autoComplete="current-password" required value={dados.senha} onChange={mudar('senha')} />}
        </Campo>
        <button type="submit" className="botao botao-largo" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="rodape-form">
        Ainda não tem conta? <Link to="/cadastro">Cadastre-se como organizador</Link>
      </p>
    </section>
  );
}
