// Conexão com o PostgreSQL.
//
// Com o Neon, usamos o driver @neondatabase/serverless, que conversa com o banco
// por WebSocket na porta 443 (a mesma dos sites). Assim a conexão funciona mesmo
// em redes que bloqueiam a porta 5432, como a da FATEC.
// Com um PostgreSQL local (sem "neon.tech" no endereço), usamos o driver pg comum.
//
// Os dois drivers têm a mesma interface (pool.query, pool.end), então o resto
// do código não muda.
require('dotenv').config({ quiet: true });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL não definida. Copie .env.example para .env e preencha.');
  process.exit(1);
}

const url = process.env.DATABASE_URL;
let pool;

if (url.includes('neon.tech')) {
  const { Pool, neonConfig } = require('@neondatabase/serverless');
  neonConfig.webSocketConstructor = require('ws');
  pool = new Pool({ connectionString: url });
} else {
  const { Pool } = require('pg');
  const usarSsl = process.env.DATABASE_SSL !== 'false';
  pool = new Pool({
    connectionString: url,
    ssl: usarSsl ? { rejectUnauthorized: false } : false,
  });
}

module.exports = pool;
