const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productController');
const verifyToken = require('../middleware/verifyToken');

// Lecturas: públicas
router.get('/', productoController.obtenerProductos);
router.get('/:id', productoController.obtenerProductoPorId);

// Crear, actualizar y eliminar: protegidas, hace falta token
router.post('/', verifyToken, productoController.crearProducto);
router.put('/:id', verifyToken, productoController.actualizarProducto);
router.delete('/:id', verifyToken, productoController.eliminarProducto);

module.exports = router;