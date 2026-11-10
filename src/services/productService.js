const mongoose = require('mongoose');
const Producto = require('../models/productModel');
const Categoria = require('../models/categoryModel');

// Función auxiliar: tiro un error con el código HTTP que corresponda
const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

// Función auxiliar: me fijo que el id tenga formato válido de MongoDB
const validarId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw crearError('El id no es válido', 400);
  }
};

// Función auxiliar: me fijo que la categoría exista antes de usarla
const validarCategoria = async (idCategoria) => {
  validarId(idCategoria);
  const categoria = await Categoria.findById(idCategoria);
  if (!categoria) {
    throw crearError('La categoría indicada no existe', 400);
  }
};

// Traigo todos los productos. Uso populate para que venga la categoría completa
const obtenerProductos = async () => {
  return await Producto.find().populate('categoria');
};

// Traigo un producto por id, también con populate
const obtenerProductoPorId = async (id) => {
  validarId(id);
  const producto = await Producto.findById(id).populate('categoria');
  if (!producto) {
    throw crearError('Producto no encontrado', 404);
  }
  return producto;
};

// Creo un producto. Antes verifico que la categoría exista
const crearProducto = async (datos) => {
  if (datos.categoria) {
    await validarCategoria(datos.categoria);
  }
  const producto = await Producto.create(datos);
  return await producto.populate('categoria');
};

// Actualizo un producto. runValidators hace que se apliquen las reglas del modelo
const actualizarProducto = async (id, datos) => {
  validarId(id);
  if (datos.categoria) {
    await validarCategoria(datos.categoria);
  }
  const producto = await Producto.findByIdAndUpdate(id, datos, {
    new: true,
    runValidators: true,
  }).populate('categoria');
  if (!producto) {
    throw crearError('Producto no encontrado', 404);
  }
  return producto;
};

// Elimino un producto por id
const eliminarProducto = async (id) => {
  validarId(id);
  const producto = await Producto.findByIdAndDelete(id);
  if (!producto) {
    throw crearError('Producto no encontrado', 404);
  }
  return producto;
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};