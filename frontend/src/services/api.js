// Comunicação com a API do Itape +.
// Todas as chamadas ao back-end passam por aqui.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function requisitar(caminho, opcoes = {}) {
  const token = localStorage.getItem('token');

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opcoes.headers,
    },
  });

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Não foi possível concluir a ação.');
  }
  return dados;
}

export const verificarApi = () => requisitar('/health');
