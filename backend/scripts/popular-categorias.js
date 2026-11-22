
require('dotenv').config();

const { db } = require('../src/config/firebase');

const categorias = [
  { nome: 'Música', slug: 'musica' },
  { nome: 'Teatro', slug: 'teatro' },
  { nome: 'Dança', slug: 'danca' },
  { nome: 'Exposição', slug: 'exposicao' },
  { nome: 'Cinema', slug: 'cinema' },
  { nome: 'Literatura', slug: 'literatura' },
  { nome: 'Educação', slug: 'educacao' },
  { nome: 'Festival', slug: 'festival' }
];

async function cadastrarCategorias() {
  try {
    const batch = db.batch();

    for (const categoria of categorias) {
      const referencia = db.collection('categorias')
        .doc(categoria.slug);

      batch.set(referencia, categoria, { merge: true });
    }

    await batch.commit();

    console.log('Categorias cadastradas com sucesso!');
  } catch (erro) {
    console.error('Erro:', erro.message);
    process.exitCode = 1;
  }
}

cadastrarCategorias();
