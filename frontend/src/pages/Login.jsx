import { useState } from 'react';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword, reload, signOut } from 'firebase/auth';
import { auth } from '../firebase';
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
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState('');
  const [usuario, setUsuario] = useState(null);

  async function entrar(evento) {
    evento.preventDefault();
    if (entrando) return;
    setErro('');
    setEntrando(true);

    try {
      const credencial = await signInWithEmailAndPassword(auth, email.trim(), senha);
      await reload(credencial.user);

      // Bloqueio de interface nesta etapa. O backend deverá validar o token
      // e email_verified antes de permitir ações protegidas de verdade.
      if (!credencial.user.emailVerified) {
        await signOut(auth);
        setErro('Verifique seu e-mail antes de entrar. Abra a mensagem de confirmação enviada no cadastro, inclusive a pasta de spam.');
        return;
      }

      setUsuario({
        nome: credencial.user.displayName || 'Organizador',
        email: credencial.user.email,
      });
      setSenha('');
    } catch (falha) {
      setErro(mensagensErro[falha.code] || 'Não foi possível entrar. Tente novamente.');
    } finally {
      setEntrando(false);
    }
  }

  async function sair() {
    try {
      await signOut(auth);
      setUsuario(null);
      setSenha('');
      setErro('');
    } catch {
      setErro('Não foi possível encerrar a sessão. Tente novamente.');
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

          {usuario ? (
            <div className="cad-feedback cad-sucesso login-sucesso" role="status">
              <strong>Login realizado!</strong>
              <p>Bem-vindo(a), {usuario.nome}.</p>
              <p>Conta: {usuario.email}</p>
              <p>O painel e a publicação de eventos serão implementados na próxima etapa.</p>
              <div className="login-acoes">
                <Link to="/eventos">Explorar eventos →</Link>
                <button type="button" onClick={sair}>Sair da conta</button>
              </div>
            </div>
          ) : (
            <form onSubmit={entrar} className="cad-formulario">
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

              <button type="submit" className="cad-botao" disabled={entrando}>
                {entrando ? 'Entrando…' : 'Entrar na minha conta →'}
              </button>
              <p className="cad-observacao">O login usa Firebase Authentication. O perfil de organizador e as permissões do servidor serão implementados separadamente.</p>
            </form>
          )}

          <div className="cad-login-nota">
            Ainda não tem conta? <Link to="/cadastro">Cadastre-se gratuitamente</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
