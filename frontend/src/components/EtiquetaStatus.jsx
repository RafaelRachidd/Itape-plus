// Etiqueta colorida com o status de moderação do evento.
const ROTULOS = {
  pendente: 'Em análise',
  aprovado: 'Publicado',
  rejeitado: 'Rejeitado',
};

export default function EtiquetaStatus({ status }) {
  return <span className={`pn-status pn-status-${status}`}>{ROTULOS[status] || status}</span>;
}
