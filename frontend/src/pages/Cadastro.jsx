import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexto/AuthContext';
import Campo from '../components/Campo';

// RF06: cadastro de organizador. A conta fica ativa na hora (RN07);
// quem passa por aprovação é cada evento.
export default function Cadastro() {
  const { usuario, cadastrar } = useAuth();
  const navegar = useNavigate();
  const [dados, setDados] = useState({ nome: '', email: '', senha: '', confirmar: '' });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Já logado ao abrir a página: vai direto para a sua área.
  // Durante o envio, quem navega é a função enviar (com a mensagem de sucesso).
  if (usuario && !enviando) return <Navigate to={usuario.perfil === 'admin' ? '/admin' : '/painel'} replace />;

  // Validação no navegador (RNF04); a API valida de novo.
  function validar() {
    const e = {};
    if (dados.nome.trim().length < 2) e.nome = 'Informe o nome (pelo menos 2 caracteres).';
    if (!/^\S+@\S+\.\S+$/.test(dados.email.trim())) e.email = 'Informe um e-mail válido.';
    if (dados.senha.length < 8) e.senha = 'A senha deve ter pelo menos 8 caracteres.';
    if (dados.confirmar !== dados.senha) e.confirmar = 'As senhas não conferem.';
    return e;
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErroGeral('');
    const encontrados = validar();
    setErros(encontrados);
    if (Object.keys(encontrados).length) return;

    setEnviando(true);
    try {
      await cadastrar({ nome: dados.nome.trim(), email: dados.email.trim(), senha: dados.senha });
      navegar('/painel', { replace: true, state: { aviso: 'Conta criada! Agora você já pode cadastrar seus eventos.' } });
    } catch (e) {
      setErros(e.campos || {});
      setErroGeral(Object.keys(e.campos || {}).length ? '' : e.message);
      setEnviando(false);
    }
  }

  // Ao digitar, o erro daquele campo some.
  const mudar = (campo) => (e) => {
    setDados({ ...dados, [campo]: e.target.value });
    if (erros[campo]) setErros({ ...erros, [campo]: undefined });
  };

  return (
    <section className="cartao-form">
      <h1>Criar conta de organizador</h1>
      <p className="texto-suave">
        Artistas, coletivos e instituições divulgam seus eventos de graça. Sua conta fica ativa na hora;
        cada evento enviado passa por uma revisão antes de ser publicado.
      </p>

      {erroGeral && <p className="aviso-form aviso-erro" role="alert">{erroGeral}</p>}

      <form onSubmit={enviar} noValidate>
        <Campo id="nome" rotulo="Nome ou nome do coletivo" erro={erros.nome}>
          {(props) => <input {...props} autoComplete="name" value={dados.nome} onChange={mudar('nome')} maxLength={100} />}
        </Campo>
        <Campo id="email" rotulo="E-mail" erro={erros.email}>
          {(props) => <input {...props} type="email" autoComplete="email" value={dados.email} onChange={mudar('email')} maxLength={150} />}
        </Campo>
        <Campo id="senha" rotulo="Senha" erro={erros.senha} dica="Pelo menos 8 caracteres.">
          {(props) => <input {...props} type="password" autoComplete="new-password" value={dados.senha} onChange={mudar('senha')} />}
        </Campo>
        <Campo id="confirmar" rotulo="Confirme a senha" erro={erros.confirmar}>
          {(props) => <input {...props} type="password" autoComplete="new-password" value={dados.confirmar} onChange={mudar('confirmar')} />}
        </Campo>

        <p className="aviso-lgpd">
          Usamos seus dados apenas para identificar você como organizador e para exibir seu nome e
          contato nos eventos aprovados (LGPD).
        </p>

        <button type="submit" className="botao botao-largo" disabled={enviando}>
          {enviando ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <p className="rodape-form">
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </section>
  );
}
