// Consultas da tabela usuarios.
// A senha nunca sai do model: só o login lê o senha_hash, para comparar.
const pool = require('../config/db');

const CAMPOS_PUBLICOS = 'id, nome, email, perfil, nome_publico, descricao, contato, criado_em';

async function buscarPorEmailComSenha(email) {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS}, senha_hash FROM usuarios WHERE email = $1`,
    [email]
  );
  return rows[0] || null;
}

async function buscarPorId(id) {
  const { rows } = await pool.query(`SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = $1`, [id]);
  return rows[0] || null;
}

// RF06 + RN07 + RN08: a conta nasce ativa e sempre como organizador.
async function criarOrganizador({ nome, email, senhaHash }) {
  const { rows } = await pool.query(
    `INSERT INTO usuarios (nome, email, senha_hash, perfil, nome_publico)
     VALUES ($1, $2, $3, 'organizador', $1)
     RETURNING ${CAMPOS_PUBLICOS}`,
    [nome, email, senhaHash]
  );
  return rows[0];
}

// RF16: dados públicos do organizador, exibidos nos detalhes dos eventos dele.
async function atualizarPerfil(id, { nome_publico, descricao, contato }) {
  const { rows } = await pool.query(
    `UPDATE usuarios
        SET nome_publico = $2, descricao = $3, contato = $4
      WHERE id = $1
      RETURNING ${CAMPOS_PUBLICOS}`,
    [id, nome_publico || null, descricao || null, contato || null]
  );
  return rows[0] || null;
}

module.exports = { buscarPorEmailComSenha, buscarPorId, criarOrganizador, atualizarPerfil };
