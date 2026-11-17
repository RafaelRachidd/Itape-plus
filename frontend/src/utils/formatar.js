// Formatação de datas e preços em português, sempre no horário de Brasília.
const FUSO = 'America/Sao_Paulo';

export function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short', timeZone: FUSO,
  });
}

export function formatarDataCompleta(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: FUSO,
  });
}

export function formatarHora(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit', timeZone: FUSO,
  });
}

export function formatarPreco(gratuito, preco) {
  if (gratuito) return 'Gratuito';
  return Number(preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
