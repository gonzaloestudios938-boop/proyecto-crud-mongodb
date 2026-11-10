require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const categoriaRoute = require('./src/routes/categoryRoute');
const productoRoute = require('./src/routes/productRoute');
const usuarioRoute = require('./src/routes/userRoute');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Recuerdo: acá sirvo el front, todo lo que esté en la carpeta public
app.use(express.static('public'));

// Ruta de prueba (la moví a /api porque la raíz ahora muestra el front)
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'API funcionando' });
});

// Rutas de categorías: /api/categorias
app.use('/api/categorias', categoriaRoute);

// Rutas de productos: /api/productos
app.use('/api/productos', productoRoute);

// Rutas de usuarios (registro y login): /api/usuarios
app.use('/api/usuarios', usuarioRoute);

// Conexión a la DB y arranque del servidor
connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});