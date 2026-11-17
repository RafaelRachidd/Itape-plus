// Comunicação com a API do Itape +.
// Todas as chamadas ao back-end passam por aqui.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function requisitar(caminho, opcoes = {}) {
  const token = localStorage.getItem('token');

  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...opcoes,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...opcoes.headers,
      },
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Tente novamente em instantes.');
  }

  // Token vencido ou inválido: avisa o contexto de login para encerrar a sessão.
  if (resposta.status === 401 && token) {
    window.dispatchEvent(new Event('sessao-expirada'));
  }

  const dados = resposta.status === 204 ? null : await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    const erro = new Error(dados?.mensagem || 'Não foi possível concluir a ação.');
    erro.status = resposta.status;
    erro.campos = Object.fromEntries((dados?.erros || []).map((e) => [e.campo, e.mensagem]));
    throw erro;
  }
  return dados;
}

const enviar = (metodo, caminho, corpo) =>
  requisitar(caminho, { method: metodo, body: corpo === undefined ? undefined : JSON.stringify(corpo) });

// Monta "?a=1&b=2" ignorando filtros vazios.
function montarQuery(filtros = {}) {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '' && valor !== false) {
      params.set(chave, valor);
    }
  });
  const texto = params.toString();
  return texto ? `?${texto}` : '';
}

// Catálogo público
export const verificarApi = () => requisitar('/health');
export const listarCategorias = () => requisitar('/categorias');
export const listarProximosEventos = (limite = 6) => requisitar(`/eventos/proximos?limite=${limite}`);
export const listarEventos = (filtros) => requisitar(`/eventos${montarQuery(filtros)}`);
export const buscarEvento = (id) => requisitar(`/eventos/${id}`);

// Cadastro e login
export const cadastrarConta = (dados) => enviar('POST', '/auth/cadastro', dados);
export const fazerLogin = (dados) => enviar('POST', '/auth/login', dados);

// Painel do organizador
export const listarMeusEventos = () => requisitar('/painel/eventos');
export const buscarMeuEvento = (id) => requisitar(`/painel/eventos/${id}`);
export const criarEvento = (dados) => enviar('POST', '/painel/eventos', dados);
export const atualizarEvento = (id, dados) => enviar('PUT', `/painel/eventos/${id}`, dados);
export const excluirEvento = (id) => enviar('DELETE', `/painel/eventos/${id}`);
export const buscarPerfil = () => requisitar('/painel/perfil');
export const atualizarPerfil = (dados) => enviar('PUT', '/painel/perfil', dados);

// Moderação (administrador)
export const buscarResumoModeracao = () => requisitar('/admin/resumo');
export const listarParaModeracao = (status = 'pendente') => requisitar(`/admin/eventos?status=${status}`);
export const aprovarEvento = (id) => enviar('PATCH', `/admin/eventos/${id}/aprovar`);
export const rejeitarEvento = (id, motivo) => enviar('PATCH', `/admin/eventos/${id}/rejeitar`, { motivo });
