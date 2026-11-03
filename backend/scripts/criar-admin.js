// Cria (ou atualiza) o administrador a partir das variáveis do .env.
// RN08: o perfil admin não pode ser escolhido no cadastro; só existe por aqui.
// A senha é gravada com hash bcrypt (RNF02), nunca em texto.
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

async function criarAdmin() {
  const { ADMIN_NOME, ADMIN_EMAIL, ADMIN_SENHA } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_SENHA) {
    console.error('Defina ADMIN_EMAIL e ADMIN_SENHA no .env.');
    process.exit(1);
  }
  if (ADMIN_SENHA.length < 8) {
    console.error('ADMIN_SENHA precisa ter pelo menos 8 caracteres.');
    process.exit(1);
  }

  try {
    const hash = await bcrypt.hash(ADMIN_SENHA, 10);
    await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, perfil)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email)
       DO UPDATE SET nome = EXCLUDED.nome, senha_hash = EXCLUDED.senha_hash, perfil = 'admin'`,
      [ADMIN_NOME || 'Administrador', ADMIN_EMAIL.toLowerCase(), hash]
    );
    console.log(`OK: administrador ${ADMIN_EMAIL} pronto.`);
  } catch (erro) {
    console.error(`Erro ao criar administrador: ${erro.message}`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

criarAdmin();
