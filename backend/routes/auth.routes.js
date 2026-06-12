// Importa Express
const express = require('express');
// Crea el enrutador
const router = express.Router();
// Importa el controlador de autenticación
const authController = require('../controllers/auth.controller');

// POST /api/auth/register → Registrar usuario
router.post('/register', authController.register);

// POST /api/auth/login → Iniciar sesión
router.post('/login', authController.login);

// Exporta el router
module.exports = router;
