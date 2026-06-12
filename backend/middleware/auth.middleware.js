// Importa JWT
const jwt = require('jsonwebtoken');

// Clave secreta para firmar tokens
const SECRET_KEY = 'clave_secreta_gestor_tareas_2024';

// Middleware para verificar el token
const verifyToken = (req, res, next) => {
  // Obtiene el token del header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Acceso denegado. Token requerido.'
    });
  }

  // Verifica el token
  jwt.verify(token, SECRET_KEY, (error, decoded) => {
    if (error) {
      return res.status(403).json({
        message: 'Token inválido o expirado.'
      });
    }
    // Agrega el usuario decodificado al request
    req.user = decoded;
    next();
  });
};

module.exports = { verifyToken, SECRET_KEY };
