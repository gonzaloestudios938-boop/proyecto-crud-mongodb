const jwt = require('jsonwebtoken');
const Usuario = require('../models/userModel');

// Función auxiliar: tiro un error con el código HTTP que corresponda
const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

// Registro un usuario nuevo. La contraseña la encripta el pre-save hook del modelo
const registrarUsuario = async (datos) => {
  const { nombre, email, password } = datos;

  const existente = await Usuario.findOne({ email });
  if (existente) {
    throw crearError('Ya existe un usuario con ese email', 400);
  }

  const usuario = await Usuario.create({ nombre, email, password });

  // Recuerdo: nunca devuelvo la contraseña, ni siquiera encriptada
  return {
    _id: usuario._id,
    nombre: usuario.nombre,
    email: usuario.email,
  };
};

// Hago el login: verifico email y contraseña, y si están bien genero el token
const loginUsuario = async (datos) => {
  const { email, password } = datos;

  if (!email || !password) {
    throw crearError('Email y contraseña son obligatorios', 400);
  }

  const usuario = await Usuario.findOne({ email: email.toLowerCase() });

  // Uso el mismo mensaje si falla el email o la contraseña, así no doy pistas
  if (!usuario) {
    throw crearError('Credenciales incorrectas', 401);
  }

  const coincide = await usuario.compararPassword(password);
  if (!coincide) {
    throw crearError('Credenciales incorrectas', 401);
  }

  // El token guarda el id del usuario y vence en 2 horas
  const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });

  return {
    token,
    usuario: {
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
    },
  };
};

module.exports = { registrarUsuario, loginUsuario };