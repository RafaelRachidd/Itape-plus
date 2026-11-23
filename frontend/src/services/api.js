// Comunicação com a API do Itape +.
// Todas as chamadas ao back-end passam por aqui.
import { auth } from '../firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Erro com os detalhes da API (status e erros por campo do formulário).
export class ErroApi extends Error {
  constructor(mensagem, status, erros = []) {
    super(mensagem);
    this.status = status;
    this.erros = erros;
  }
}

export async function requisitar(caminho, opcoes = {}) {
  // Quem está logado envia o ID token do Firebase; a API confere o token e o perfil.
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

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
    throw new ErroApi('Não foi possível conectar à API. Confira se o backend está rodando.', 0);
  }

  if (resposta.status === 204) return null;
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new ErroApi(dados.mensagem || 'Não foi possível concluir a ação.', resposta.status, dados.erros);
  }
  return dados;
}

const enviar = (metodo, caminho, corpo) =>
  requisitar(caminho, { method: metodo, body: corpo === undefined ? undefined : JSON.stringify(corpo) });

const idUrl = (id) => encodeURIComponent(id);

// Públicas
export const verificarApi = () => requisitar('/health');
export const listarCategorias = () => requisitar('/categorias');
export const listarEventos = () => requisitar('/eventos');
export const buscarEventoPorId = (id) => requisitar(`/eventos/${idUrl(id)}`);

// Conta logada
export const buscarMeuPerfil = () => requisitar('/eu');
export const atualizarMeuPerfil = (dados) => enviar('PUT', '/eu', dados);

// Painel do organizador
export const listarMeusEventos = () => requisitar('/painel/eventos');
export const buscarMeuEvento = (id) => requisitar(`/painel/eventos/${idUrl(id)}`);
export const criarEvento = (dados) => enviar('POST', '/painel/eventos', dados);
export const atualizarEvento = (id, dados) => enviar('PUT', `/painel/eventos/${idUrl(id)}`, dados);
export const excluirEvento = (id) => enviar('DELETE', `/painel/eventos/${idUrl(id)}`);

// Moderação
export const buscarResumoModeracao = () => requisitar('/admin/resumo');
export const listarEventosModeracao = (status = 'pendente') =>
  requisitar(`/admin/eventos?status=${encodeURIComponent(status)}`);
export const aprovarEvento = (id) => enviar('PATCH', `/admin/eventos/${idUrl(id)}/aprovar`);
export const rejeitarEvento = (id, motivo) => enviar('PATCH', `/admin/eventos/${idUrl(id)}/rejeitar`, { motivo });
