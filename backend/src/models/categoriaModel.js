// Consultas da tabela categorias.
const pool = require('../config/db');

async function listar() {
  const { rows } = await pool.query('SELECT id, nome, slug FROM categorias ORDER BY nome');
  return rows;
}

module.exports = { listar };
