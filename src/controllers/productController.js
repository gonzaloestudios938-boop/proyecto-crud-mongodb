const productoService = require('../services/productService');

// Recuerdo: si el error trae status (404, 400) lo uso, si no es un 500.
// Los errores de validación del modelo los trato como 400
const manejarError = (error, res) => {
  const status = error.status || (error.name === 'ValidationError' ? 400 : 500);
  res.status(status).json({ mensaje: error.message });
};

const obtenerProductos = async (req, res) => {
  try {
    const productos = await productoService.obtenerProductos();
    res.status(200).json(productos);
  } catch (error) {
    manejarError(error, res);
  }
};

const obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await productoService.obtenerProductoPorId(req.params.id);
    res.status(200).json(producto);
  } catch (error) {
    manejarError(error, res);
  }
};

// 201 porque se creó un recurso nuevo
const crearProducto = async (req, res) => {
  try {
    const producto = await productoService.crearProducto(req.body);
    res.status(201).json(producto);
  } catch (error) {
    manejarError(error, res);
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const producto = await productoService.actualizarProducto(req.params.id, req.body);
    res.status(200).json(producto);
  } catch (error) {
    manejarError(error, res);
  }
};

const eliminarProducto = async (req, res) => {
  try {
    await productoService.eliminarProducto(req.params.id);
    res.status(200).json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    manejarError(error, res);
  }
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};