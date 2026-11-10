const jwt = require('jsonwebtoken');

// Recuerdo: el token llega en el header Authorization con el formato "Bearer <token>"
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Acceso denegado: falta el token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decodificado; // guardo los datos del token por si los necesito después
    next(); // el token es válido, dejo pasar al controlador
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o vencido' });
  }
};

module.exports = verifyToken;