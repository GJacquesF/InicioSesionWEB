// Importa la conexión a la base de datos
const db = require('../config/db');
// Importa bcrypt para hashear contraseñas
const bcrypt = require('bcrypt');
// Importa JWT y la clave secreta
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../middleware/auth.middleware');

// ────────────────────────────────────────────────
// REGISTRO DE USUARIO
// ────────────────────────────────────────────────
exports.register = async (req, res) => {
  const { correo, password } = req.body;

  // Validación de campos vacíos
  if (!correo || !password) {
    return res.status(400).json({
      message: 'Debe ingresar correo y contraseña.'
    });
  }

  // Validación básica de formato de correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    return res.status(400).json({
      message: 'El formato del correo no es válido.'
    });
  }

  // Verifica si el correo ya está registrado
  const sqlSearch = 'SELECT * FROM usuarios WHERE correo = ?';
  db.query(sqlSearch, [correo], async (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Error del servidor.' });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: 'El correo ya está registrado.' });
    }

    // Genera el hash de la contraseña (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserta el nuevo usuario
    const sqlInsert = 'INSERT INTO usuarios (correo, password) VALUES (?, ?)';
    db.query(sqlInsert, [correo, hashedPassword], (error, result) => {
      if (error) {
        return res.status(500).json({ message: 'No se pudo registrar el usuario.' });
      }
      res.status(201).json({ message: 'Usuario registrado correctamente.' });
    });
  });
};

// ────────────────────────────────────────────────
// INICIO DE SESIÓN
// ────────────────────────────────────────────────
exports.login = (req, res) => {
  const { correo, password } = req.body;

  // Validación de campos vacíos
  if (!correo || !password) {
    return res.status(400).json({ message: 'Debe ingresar correo y contraseña.' });
  }

  // Busca el usuario por correo
  const sql = 'SELECT * FROM usuarios WHERE correo = ?';
  db.query(sql, [correo], async (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Error del servidor.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'El usuario no existe.' });
    }

    const user = results[0];

    // Compara la contraseña con el hash almacenado
    const coincide = await bcrypt.compare(password, user.password);

    if (!coincide) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    // Genera el token JWT (expira en 8 horas)
    const token = jwt.sign(
      { id: user.id, correo: user.correo },
      SECRET_KEY,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      message: `Bienvenido ${user.correo}`,
      token,
      user: { id: user.id, correo: user.correo }
    });
  });
};
