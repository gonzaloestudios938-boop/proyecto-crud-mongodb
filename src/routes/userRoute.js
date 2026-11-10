const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/userController');

// Estas dos rutas son públicas: no se puede pedir token para registrarse o loguearse
router.post('/register', usuarioController.registrar);
router.post('/login', usuarioController.login);

module.exports = router;