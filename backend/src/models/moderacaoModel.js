// Consultas da moderação (RF11, RF12, RF13). Só o administrador usa.
const pool = require('../config/db');

const CAMPOS = `
  e.id, e.titulo, e.descricao, e.data_inicio, e.data_fim,
  e.local_nome, e.endereco, e.cidade, e.gratuito, e.preco,
  e.link_inscricao, e.imagem_url, e.status, e.motivo_rejeicao,
  e.criado_em, e.atualizado_em,
  c.nome AS categoria, c.slug AS categoria_slug,
  COALESCE(u.nome_publico, u.nome) AS organizador_nome,
  u.email AS organizador_email, u.contato AS organizador_contato
`;

// RF11: pendentes do mais antigo ao mais novo (quem espera há mais tempo vem primeiro).
// Aprovados e rejeitados: os mais recentes primeiro (histórico).
async function listarPorStatus(status) {
  const ordem = status === 'pendente' ? 'e.atualizado_em ASC' : 'e.atualizado_em DESC';
  const { rows } = await pool.query(
    `SELECT ${CAMPOS}
       FROM eventos e
       JOIN categorias c ON c.id = e.categoria_id
       JOIN usuarios u   ON u.id = e.organizador_id
      WHERE e.status = $1
      ORDER BY ${ordem}`,
    [status]
  );
  return rows;
}

async function buscarPorId(id) {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS}
       FROM eventos e
       JOIN categorias c ON c.id = e.categoria_id
       JOIN usuarios u   ON u.id = e.organizador_id
      WHERE e.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function contarPorStatus() {
  const { rows } = await pool.query(
    `SELECT status, COUNT(*)::int AS total FROM eventos GROUP BY status`
  );
  const resumo = { pendente: 0, aprovado: 0, rejeitado: 0 };
  rows.forEach((r) => { resumo[r.status] = r.total; });
  return resumo;
}

// RF12 + RN03: aprovar limpa um motivo antigo de rejeição.
async function aprovar(id) {
  await pool.query(
    `UPDATE eventos SET status = 'aprovado', motivo_rejeicao = NULL, atualizado_em = NOW() WHERE id = $1`,
    [id]
  );
  return buscarPorId(id);
}

// RF13 + RN04: rejeitar exige motivo (o banco também garante isso).
async function rejeitar(id, motivo) {
  await pool.query(
    `UPDATE eventos SET status = 'rejeitado', motivo_rejeicao = $2, atualizado_em = NOW() WHERE id = $1`,
    [id, motivo]
  );
  return buscarPorId(id);
}

module.exports = { listarPorStatus, buscarPorId, contarPorStatus, aprovar, rejeitar };
