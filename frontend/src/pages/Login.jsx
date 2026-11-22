import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { areaDoPerfil, useAuth } from '../contexto/AuthContext';
import './Cadastro.css';
import './Login.css';

const mensagensErro = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/invalid-email': 'Informe um e-mail válido.',
  'auth/user-disabled': 'Esta conta está desativada.',
  'auth/network-request-failed': 'Sem conexão com o Firebase. Confira sua internet.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.',
};

export default function Login() {
  const { usuario, carregando, entrar } = useAuth();
  const navegar = useNavigate();
  const [parametros] = useSearchParams();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState('');
  const [naoVerificado, setNaoVerificado] = useState(false);
  const [reenvio, setReenvio] = useState('');

  // Volta para a página protegida que pediu o login, se for do perfil certo.
  const destino = (perfil) => {
    const voltar = parametros.get('voltar');
    const area = areaDoPerfil(perfil);
    return voltar && voltar.startsWith(area) ? voltar : area;
  };

  // Quem já está logado vai direto para a sua área.
  if (!carregando && usuario && !entrando) {
    return <Navigate to={destino(usuario.perfil)} replace />;
  }

  async function aoEntrar(evento) {
    evento.preventDefault();
    if (entrando) return;
    setErro('');
    setReenvio('');
    setNaoVerificado(false);
    setEntrando(true);

    try {
      const perfil = await entrar(email.trim(), senha);
      setSenha('');
      navegar(destino(perfil.perfil), { replace: true });
    } catch (falha) {
      if (falha.code === 'itape/email-nao-verificado') {
        setNaoVerificado(true);
        setErro('Verifique seu e-mail antes de entrar. Abra a mensagem de confirmação enviada no cadastro, inclusive a pasta de spam.');
      } else {
        if (auth.currentUser) await signOut(auth).catch(() => {});
        setErro(mensagensErro[falha.code] || falha.message || 'Não foi possível entrar. Tente novamente.');
      }
    } finally {
      setEntrando(false);
    }
  }

  async function reenviarVerificacao() {
    try {
      if (auth.currentUser) await sendEmailVerification(auth.currentUser);
      setReenvio('Enviamos um novo e-mail de verificação. Depois de confirmar, entre novamente.');
    } catch {
      setReenvio('Não foi possível reenviar agora. Aguarde alguns minutos e tente de novo.');
    } finally {
      setNaoVerificado(false);
      await signOut(auth).catch(() => {});
    }
  }

  return (
    <div className="cad-page login-page">
      <section className="cad-intro" aria-labelledby="login-intro-titulo">
        <span className="cad-kicker">ITAPE + · CULTURA DA NOSSA REGIÃO</span>
        <div className="cad-intro-texto">
          <span className="cad-simbolo" aria-hidden="true">✳</span>
          <h1 id="login-intro-titulo">A cultura nos conecta.</h1>
          <p>Entre na sua conta e acompanhe o que acontece em Itapetininga e região.</p>
          <div className="cad-traco" aria-hidden="true" />
          <span className="cad-rodape-intro">Seu espaço na cena cultural começa aqui.</span>
        </div>
      </section>

      <section className="cad-form-area" aria-labelledby="login-form-titulo">
        <div className="cad-form-card">
          <p className="cad-etapa">ÁREA DO ORGANIZADOR</p>
          <h2 id="login-form-titulo">Entrar na minha conta</h2>
          <p className="cad-subtitulo">Use o e-mail e a senha cadastrados. A verificação do e-mail é necessária para entrar.</p>

          <form onSubmit={aoEntrar} className="cad-formulario">
            <label htmlFor="login-email">E-mail</label>
            <input id="login-email" type="email" autoComplete="email" required maxLength={150}
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com" />

            <label htmlFor="login-senha">Senha</label>
            <div className="cad-campo-senha">
              <input id="login-senha" type={mostrarSenha ? 'text' : 'password'}
                autoComplete="current-password" required value={senha}
                onChange={(e) => setSenha(e.target.value)} placeholder="Sua senha" />
              <button type="button" onClick={() => setMostrarSenha((valor) => !valor)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}>
                {mostrarSenha ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            {erro && <p className="cad-feedback cad-erro" role="alert">{erro}</p>}
            {naoVerificado && (
              <button type="button" className="login-reenviar" onClick={reenviarVerificacao}>Reenviar e-mail de verificação</button>
            )}
            {reenvio && <p className="cad-feedback cad-sucesso" role="status">{reenvio}</p>}

            <button type="submit" className="cad-botao" disabled={entrando}>
              {entrando ? 'Entrando…' : 'Entrar na minha conta →'}
            </button>
            <p className="cad-observacao">Organizadores vão para o painel de eventos; a equipe de moderação, para a área de análise.</p>
          </form>

          <div className="cad-login-nota">
            Ainda não tem conta? <Link to="/cadastro">Cadastre-se gratuitamente</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
