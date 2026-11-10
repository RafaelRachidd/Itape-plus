// Conexão com o PostgreSQL (Neon em produção, ou um Postgres local).
// O Pool reaproveita conexões entre as requisições.
const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL não definida. Copie .env.example para .env e preencha.');
  process.exit(1);
}

// O Neon exige SSL; um Postgres local normalmente não.
const usarSsl = process.env.DATABASE_SSL !== 'false';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: usarSsl ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
