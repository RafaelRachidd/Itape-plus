// Converte um documento do Firestore em JSON (datas viram texto ISO 8601).
function paraIso(valor) {
  if (!valor) return null;
  if (typeof valor.toDate === 'function') return valor.toDate().toISOString();
  return valor;
}

const CAMPOS_DATA = ['dataInicio', 'dataFim', 'criadoEm', 'atualizadoEm', 'moderadoEm'];

function serializarEvento(doc) {
  const dados = { id: doc.id, ...doc.data() };
  for (const campo of CAMPOS_DATA) {
    if (campo in dados) dados[campo] = paraIso(dados[campo]);
  }
  return dados;
}

// Versão pública: sem dados internos de moderação nem identificadores de conta.
function eventoPublico(doc) {
  const { organizadorId, moderadoPor, moderadoPorNome, moderadoEm, motivoRejeicao, ...resto } = serializarEvento(doc);
  return resto;
}

// Ordena por data de início (mais próximos primeiro).
function porDataInicio(a, b) {
  return (Date.parse(a.dataInicio) || 0) - (Date.parse(b.dataInicio) || 0);
}

// Ordena pelos cadastrados mais recentemente.
function maisRecentes(a, b) {
  return (Date.parse(b.criadoEm) || 0) - (Date.parse(a.criadoEm) || 0);
}

module.exports = { serializarEvento, eventoPublico, porDataInicio, maisRecentes };
