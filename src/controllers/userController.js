const usuarioService = require('../services/userService');

// Recuerdo: si el error trae status lo uso, si no es 500.
// Los errores de validación del modelo los trato como 400
const manejarError = (error, res) => {
  const status = error.status || (error.name === 'ValidationError' ? 400 : 500);
  res.status(status).json({ mensaje: error.message });
};

// 201 porque se creó un usuario nuevo
const registrar = async (req, res) => {
  try {
    const usuario = await usuarioService.registrarUsuario(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    manejarError(error, res);
  }
};

const login = async (req, res) => {
  try {
    const resultado = await usuarioService.loginUsuario(req.body);
    res.status(200).json(resultado);
  } catch (error) {
    manejarError(error, res);
  }
};

module.exports = { registrar, login };