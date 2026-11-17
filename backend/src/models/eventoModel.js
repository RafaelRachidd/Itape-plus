// Consultas de eventos do catálogo público.
// Todas filtram status = 'aprovado' (RN02): visitante nunca vê pendente ou rejeitado.
// Os valores sempre entram como parâmetros ($1, $2...), nunca concatenados (RNF06).
const pool = require('../config/db');

const FUSO = 'America/Sao_Paulo';

// Campos exibidos nos cartões do catálogo.
const CAMPOS_CARTAO = `
  e.id, e.titulo, e.data_inicio, e.local_nome, e.cidade,
  e.gratuito, e.preco, e.imagem_url,
  c.nome AS categoria, c.slug AS categoria_slug
`;

// Escapa % e _ para a busca tratar o texto digitado de forma literal.
function escaparLike(texto) {
  return texto.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// RF01 + RN09: próximos eventos aprovados, do mais próximo ao mais distante.
async function listarProximos(limite = 6) {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS_CARTAO}
       FROM eventos e
       JOIN categorias c ON c.id = e.categoria_id
      WHERE e.status = 'aprovado' AND e.data_inicio >= NOW()
      ORDER BY e.data_inicio
      LIMIT $1`,
    [limite]
  );
  return rows;
}

// RF02, RF03, RF04, RF14: catálogo com busca e filtros combináveis.
// Sem data inicial, mostra a partir de agora (eventos já realizados ficam de fora).
async function listarAprovados({ busca, categoria, dataInicio, dataFim, gratuito } = {}) {
  const condicoes = [`e.status = 'aprovado'`];
  const valores = [];
  const param = (valor) => {
    valores.push(valor);
    return `$${valores.length}`;
  };

  if (busca) {
    // Ignora maiúsculas/minúsculas (ILIKE) e acentos (unaccent).
    condicoes.push(`unaccent(e.titulo) ILIKE unaccent(${param(`%${escaparLike(busca)}%`)})`);
  }
  if (categoria) {
    condicoes.push(`c.slug = ${param(categoria)}`);
  }
  if (dataInicio) {
    // Início do dia escolhido, no horário de Brasília.
    condicoes.push(`e.data_inicio >= (${param(dataInicio)}::date)::timestamp AT TIME ZONE '${FUSO}'`);
  } else {
    condicoes.push('e.data_inicio >= NOW()');
  }
  if (dataFim) {
    // Até o fim do dia escolhido (inclusive).
    condicoes.push(`e.data_inicio < ((${param(dataFim)}::date + 1)::timestamp AT TIME ZONE '${FUSO}')`);
  }
  if (gratuito) {
    condicoes.push('e.gratuito = TRUE');
  }

  const { rows } = await pool.query(
    `SELECT ${CAMPOS_CARTAO}
       FROM eventos e
       JOIN categorias c ON c.id = e.categoria_id
      WHERE ${condicoes.join(' AND ')}
      ORDER BY e.data_inicio`,
    valores
  );
  return rows;
}

// RF05 + RF15: detalhes de um evento aprovado, com dados públicos do organizador.
async function buscarAprovadoPorId(id) {
  const { rows } = await pool.query(
    `SELECT e.id, e.titulo, e.descricao, e.data_inicio, e.data_fim,
            e.local_nome, e.endereco, e.cidade, e.gratuito, e.preco,
            e.link_inscricao, e.imagem_url,
            c.nome AS categoria, c.slug AS categoria_slug,
            COALESCE(u.nome_publico, u.nome) AS organizador_nome,
            u.contato AS organizador_contato
       FROM eventos e
       JOIN categorias c ON c.id = e.categoria_id
       JOIN usuarios u   ON u.id = e.organizador_id
      WHERE e.id = $1 AND e.status = 'aprovado'`,
    [id]
  );
  return rows[0] || null;
}

module.exports = { listarProximos, listarAprovados, buscarAprovadoPorId };
