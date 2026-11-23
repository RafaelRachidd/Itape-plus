// Formatação de datas e valores no padrão brasileiro (horário de Brasília).
const FUSO = 'America/Sao_Paulo';

const dataHora = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO, weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
});
const dataCurta = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
});
const dinheiro = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatarDataHora(iso) {
  const data = iso ? new Date(iso) : null;
  return data && !Number.isNaN(data.getTime()) ? dataHora.format(data).replace('.', '') : 'Data a confirmar';
}

export function formatarDataCurta(iso) {
  const data = iso ? new Date(iso) : null;
  return data && !Number.isNaN(data.getTime()) ? dataCurta.format(data) : '—';
}

export function formatarPreco(evento) {
  if (evento.gratuito) return 'Gratuito';
  const valor = Number(evento.preco);
  return Number.isFinite(valor) && valor > 0 ? dinheiro.format(valor) : 'Consulte';
}

// ISO (UTC) -> valor do <input type="datetime-local"> no horário de Brasília.
export function paraCampoDataHora(iso) {
  if (!iso) return '';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '';
  return new Date(data.getTime() - 3 * 3600e3).toISOString().slice(0, 16);
}
