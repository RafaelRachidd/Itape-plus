// Consultas de eventos do painel do organizador.
// O dono é sempre conferido no controller (RN06) antes de editar ou excluir.
// As datas chegam do formulário sem fuso ("2026-11-20T19:00") e são
// interpretadas no horário de Brasília.
const pool = require('../config/db');

const FUSO = 'America/Sao_Paulo';

const CAMPOS = `
  e.id, e.organizador_id, e.categoria_id, e.titulo, e.descricao,
  e.data_inicio, e.data_fim, e.local_nome, e.endereco, e.cidade,
  e.gratuito, e.preco, e.link_inscricao, e.imagem_url,
  e.status, e.motivo_rejeicao, e.criado_em, e.atualizado_em,
  c.nome AS categoria, c.slug AS categoria_slug
`;

// RF10: todos os eventos do organizador, com status, do mais próximo ao mais distante.
async function listarDoOrganizador(organizadorId) {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS}
       FROM eventos e
       JOIN categorias c ON c.id = e.categoria_id
      WHERE e.organizador_id = $1
      ORDER BY e.data_inicio`,
    [organizadorId]
  );
  return rows;
}

async function buscarPorId(id) {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS}
       FROM eventos e
       JOIN categorias c ON c.id = e.categoria_id
      WHERE e.id = $1`,
    [id]
  );
  return rows[0] || null;
}

// Valores na ordem dos campos editáveis ($2 a $12).
function valoresDoEvento(dados) {
  return [
    dados.categoria_id,
    dados.titulo,
    dados.descricao,
    dados.data_inicio,
    dados.data_fim || null,
    dados.local_nome,
    dados.endereco,
    dados.cidade || 'Itapetininga',
    dados.gratuito,
    dados.gratuito ? null : dados.preco,
    dados.link_inscricao || null,
    dados.imagem_url || null,
  ];
}

// RF08 + RN01: todo evento nasce pendente.
async function criar(organizadorId, dados) {
  const { rows } = await pool.query(
    `INSERT INTO eventos
       (organizador_id, categoria_id, titulo, descricao, data_inicio, data_fim,
        local_nome, endereco, cidade, gratuito, preco, link_inscricao, imagem_url, status)
     VALUES
       ($1, $2, $3, $4,
        $5::timestamp AT TIME ZONE '${FUSO}',
        $6::timestamp AT TIME ZONE '${FUSO}',
        $7, $8, $9, $10, $11, $12, $13, 'pendente')
     RETURNING id`,
    [organizadorId, ...valoresDoEvento(dados)]
  );
  return buscarPorId(rows[0].id);
}

// RF09 + RN05: qualquer edição devolve o evento para pendente e limpa o motivo da rejeição.
async function atualizar(id, dados) {
  await pool.query(
    `UPDATE eventos
        SET categoria_id = $2, titulo = $3, descricao = $4,
            data_inicio = $5::timestamp AT TIME ZONE '${FUSO}',
            data_fim = $6::timestamp AT TIME ZONE '${FUSO}',
            local_nome = $7, endereco = $8, cidade = $9,
            gratuito = $10, preco = $11, link_inscricao = $12, imagem_url = $13,
            status = 'pendente', motivo_rejeicao = NULL, atualizado_em = NOW()
      WHERE id = $1`,
    [id, ...valoresDoEvento(dados)]
  );
  return buscarPorId(id);
}

async function excluir(id) {
  await pool.query('DELETE FROM eventos WHERE id = $1', [id]);
}

module.exports = { listarDoOrganizador, buscarPorId, criar, atualizar, excluir };
