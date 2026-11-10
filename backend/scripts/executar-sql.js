// Executa um arquivo .sql no banco do DATABASE_URL.
// Uso: node scripts/executar-sql.js database/schema.sql
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function executar() {
  const arquivo = process.argv[2];
  if (!arquivo) {
    console.error('Informe o arquivo .sql. Ex.: node scripts/executar-sql.js database/schema.sql');
    process.exit(1);
  }

  const sql = fs.readFileSync(path.resolve(arquivo), 'utf8');
  try {
    await pool.query(sql);
    console.log(`OK: ${arquivo} executado.`);
  } catch (erro) {
    // Falhas de conexão chegam como AggregateError, com a mensagem vazia.
    const detalhes = erro.errors ? erro.errors.map((e) => e.message).join(' | ') : '';
    console.error(`Erro ao executar ${arquivo}: ${erro.message || erro.code || ''} ${detalhes}`);
    if (['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'].includes(erro.code) || erro.errors) {
      console.error('Não foi possível conectar ao banco. Confira o DATABASE_URL no .env e se a rede libera a porta 5432.');
    }
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

executar();
