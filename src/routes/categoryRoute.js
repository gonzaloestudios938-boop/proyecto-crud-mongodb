const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoryController');
const verifyToken = require('../middleware/verifyToken');

// Lectura: pública
router.get('/', categoriaController.obtenerCategorias);

// Crear y eliminar: protegidas, hace falta token
router.post('/', verifyToken, categoriaController.crearCategoria);
router.delete('/:id', verifyToken, categoriaController.eliminarCategoria);

module.exports = router;