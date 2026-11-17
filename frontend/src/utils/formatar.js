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

// Converte a data da API para o valor de um <input type="datetime-local">
// ("2026-11-20T19:00"), no horário de Brasília.
export function paraCampoDataHora(iso) {
  if (!iso) return '';
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date(iso)).map((p) => [p.type, p.value])
  );
  return `${partes.year}-${partes.month}-${partes.day}T${partes.hour}:${partes.minute}`;
}

// Agora, no horário de Brasília, no mesmo formato do campo (usado como mínimo).
export function agoraCampoDataHora() {
  return paraCampoDataHora(new Date().toISOString());
}

export function formatarPreco(gratuito, preco) {
  if (gratuito) return 'Gratuito';
  return Number(preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
