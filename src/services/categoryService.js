const mongoose = require('mongoose');
const Categoria = require('../models/categoryModel');
const Producto = require('../models/productModel');

// Traigo todas las categorías de la base
const obtenerCategorias = async () => {
  return await Categoria.find();
};

// Creo una categoría nueva. Si el nombre ya existe, tiro error 400
const crearCategoria = async (datos) => {
  const existente = await Categoria.findOne({ nombre: datos.nombre });
  if (existente) {
    const error = new Error('Ya existe una categoría con ese nombre');
    error.status = 400;
    throw error;
  }
  return await Categoria.create(datos);
};

// Elimino una categoría por id. Me fijo que el id sea válido, que exista
// y que no tenga productos asociados
const eliminarCategoria = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error('El id no es válido');
    error.status = 400;
    throw error;
  }

  const productosAsociados = await Producto.countDocuments({ categoria: id });
  if (productosAsociados > 0) {
    const error = new Error('No se puede eliminar: hay productos con esta categoría');
    error.status = 400;
    throw error;
  }

  const categoria = await Categoria.findByIdAndDelete(id);
  if (!categoria) {
    const error = new Error('Categoría no encontrada');
    error.status = 404;
    throw error;
  }
  return categoria;
};

module.exports = { obtenerCategorias, crearCategoria, eliminarCategoria };