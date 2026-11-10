const categoriaService = require('../services/categoryService');

// Recuerdo: el controlador no toca la base, solo llama al servicio y responde
const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await categoriaService.obtenerCategorias();
    res.status(200).json(categorias);
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message });
  }
};

// Devuelvo 201 porque se creó algo nuevo
const crearCategoria = async (req, res) => {
  try {
    const categoria = await categoriaService.crearCategoria(req.body);
    res.status(201).json(categoria);
  } catch (error) {
    // Si falla una validación del modelo (ej: falta el nombre) es 400
    const status = error.status || (error.name === 'ValidationError' ? 400 : 500);
    res.status(status).json({ mensaje: error.message });
  }
};

const eliminarCategoria = async (req, res) => {
  try {
    await categoriaService.eliminarCategoria(req.params.id);
    res.status(200).json({ mensaje: 'Categoría eliminada correctamente' });
  } catch (error) {
    res.status(error.status || 500).json({ mensaje: error.message });
  }
};

module.exports = { obtenerCategorias, crearCategoria, eliminarCategoria };