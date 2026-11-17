// Etiqueta colorida do status de aprovação (RF10).
const NOMES = { pendente: 'Pendente', aprovado: 'Aprovado', rejeitado: 'Rejeitado' };

export default function EtiquetaStatus({ status }) {
  return <span className={`status-etiqueta status-${status}`}>{NOMES[status] || status}</span>;
}
