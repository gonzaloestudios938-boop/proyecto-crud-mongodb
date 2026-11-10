const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
      default: '',
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    stock: {
      type: Number,
      required: [true, 'El stock es obligatorio'],
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
    },
    // Recuerdo: la imagen es opcional y guardo solo el link, no el archivo
    imagen: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: (valor) => !valor || /^https?:\/\/.+/i.test(valor),
        message: 'La imagen debe ser un link que empiece con http:// o https://',
      },
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categoria',
      required: [true, 'La categoría es obligatoria'],
    },
  },
  { timestamps: true }
);
// Recuerdo: índice sobre la categoría para que filtrar productos por categoría sea rápido
productoSchema.index({ categoria: 1 });
module.exports = mongoose.model('Producto', productoSchema);