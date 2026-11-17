const { Router } = require('express');
const controller = require('../controllers/categoriaController');

const router = Router();

// GET /api/categorias
router.get('/', controller.listar);

module.exports = router;
