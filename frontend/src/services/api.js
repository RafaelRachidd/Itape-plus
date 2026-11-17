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

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    const erro = new Error(dados.mensagem || 'Não foi possível concluir a ação.');
    erro.status = resposta.status;
    throw erro;
  }
  return dados;
}

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

export const verificarApi = () => requisitar('/health');
export const listarCategorias = () => requisitar('/categorias');
export const listarProximosEventos = (limite = 6) => requisitar(`/eventos/proximos?limite=${limite}`);
export const listarEventos = (filtros) => requisitar(`/eventos${montarQuery(filtros)}`);
export const buscarEvento = (id) => requisitar(`/eventos/${id}`);
