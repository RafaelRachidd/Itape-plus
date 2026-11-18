import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase';
import './Cadastro.css';

const mensagensErro = {
  'auth/email-already-in-use': 'Este e-mail já está cadastrado. Tente entrar na sua conta.',
  'auth/invalid-email': 'Informe um endereço de e-mail válido.',
  'auth/weak-password': 'A senha não atende aos requisitos de segurança do Firebase.',
  'auth/operation-not-allowed': 'O cadastro por e-mail e senha não está habilitado no Firebase.',
  'auth/network-request-failed': 'Não foi possível conectar ao Firebase. Confira sua internet.',
  'auth/too-many-requests': 'Muitas tentativas em pouco tempo. Tente novamente mais tarde.',
};

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function cadastrar(evento) {
    evento.preventDefault();
    if (enviando || sucesso) return;

    setErro('');
    if (nome.trim().length < 3) {
      setErro('Informe seu nome com pelo menos 3 caracteres.');
      return;
    }
    if (senha.length < 8) {
      setErro('Escolha uma senha com pelo menos 8 caracteres.');
      return;
    }
    if (senha !== confirmacao) {
      setErro('A confirmação de senha não corresponde à senha informada.');
      return;
    }

    setEnviando(true);
    try {
      // Esta etapa cria SOMENTE a conta no Firebase Authentication.
      // O perfil de organizador e as permissões serão definidos pelo backend em etapa futura.
      const credencial = await createUserWithEmailAndPassword(auth, email.trim(), senha);
      try {
        await updateProfile(credencial.user, { displayName: nome.trim() });
      } catch (falhaPerfil) {
        console.warn('Conta criada, mas não foi possível salvar o nome de exibição.', falhaPerfil);
      }

      let emailEnviado = false;
      try {
        await sendEmailVerification(credencial.user);
        emailEnviado = true;
      } catch (falhaEmail) {
        console.warn('Conta criada, mas o e-mail de verificação não pôde ser enviado.', falhaEmail);
      }

      setSucesso(emailEnviado
        ? 'Conta criada com sucesso! Confira sua caixa de entrada para verificar o e-mail.'
        : 'Conta criada com sucesso! Não foi possível enviar a verificação por e-mail agora.');
      setSenha('');
      setConfirmacao('');
    } catch (falha) {
      setErro(mensagensErro[falha.code] || 'Não foi possível criar a conta. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="cad-page">
      <section className="cad-intro" aria-labelledby="cad-intro-titulo">
        <span className="cad-kicker">ITAPE + · CULTURA DA NOSSA REGIÃO</span>
        <div className="cad-intro-texto">
          <span className="cad-simbolo" aria-hidden="true">✳</span>
          <h1 id="cad-intro-titulo">Faça parte da cena cultural.</h1>
          <p>Crie sua conta para, em breve, cadastrar e acompanhar seus eventos na plataforma cultural de Itapetininga e região.</p>
          <div className="cad-traco" aria-hidden="true" />
          <span className="cad-rodape-intro">Arte, encontros e novas histórias começam aqui.</span>
        </div>
      </section>

      <section className="cad-form-area" aria-labelledby="cad-form-titulo">
        <div className="cad-form-card">
          <p className="cad-etapa">ÁREA DO ORGANIZADOR</p>
          <h2 id="cad-form-titulo">Criar minha conta</h2>
          <p className="cad-subtitulo">Informe seus dados para começar. O acesso ao painel de organizadores será liberado nas próximas etapas.</p>

          {sucesso ? (
            <div className="cad-feedback cad-sucesso" role="status">
              <strong>Cadastro realizado!</strong>
              <p>{sucesso}</p>
              <p>O painel de organizadores ainda está em desenvolvimento.</p>
              <Link to="/eventos">Explorar eventos →</Link>
            </div>
          ) : (
            <form onSubmit={cadastrar} className="cad-formulario">
              <label htmlFor="cad-nome">Nome completo</label>
              <input id="cad-nome" type="text" autoComplete="name" required maxLength={100}
                value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome completo" />

              <label htmlFor="cad-email">E-mail</label>
              <input id="cad-email" type="email" autoComplete="email" required maxLength={150}
                value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />

              <label htmlFor="cad-senha">Senha</label>
              <div className="cad-campo-senha">
                <input id="cad-senha" type={mostrarSenha ? 'text' : 'password'} autoComplete="new-password" required minLength={8}
                  value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="No mínimo 8 caracteres" />
                <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}>
                  {mostrarSenha ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>

              <label htmlFor="cad-confirmacao">Confirmar senha</label>
              <input id="cad-confirmacao" type="password" autoComplete="new-password" required minLength={8}
                value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} placeholder="Digite a senha novamente" />

              {erro && <p className="cad-feedback cad-erro" role="alert">{erro}</p>}

              <button type="submit" className="cad-botao" disabled={enviando}>
                {enviando ? 'Criando conta…' : 'Criar conta gratuita →'}
              </button>
              <p className="cad-observacao">O cadastro cria uma conta no Firebase Authentication. O gerenciamento de eventos será implementado depois.</p>
            </form>
          )}
          <div className="cad-login-nota">
            Já tem uma conta? <Link to="/login">Entre na sua conta</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
