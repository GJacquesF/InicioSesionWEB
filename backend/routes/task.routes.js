// Importa Express
const express = require('express');
// Crea el enrutador
const router = express.Router();
// Importa el controlador de tareas
const taskController = require('../controllers/task.controller');
// Importa el middleware de autenticación
const { verifyToken } = require('../middleware/auth.middleware');

// Todas las rutas de tareas requieren autenticación
// GET    /api/tasks      → Obtener todas las tareas del usuario
router.get('/', verifyToken, taskController.getTasks);

// POST   /api/tasks      → Crear nueva tarea
router.post('/', verifyToken, taskController.createTask);

// PUT    /api/tasks/:id  → Actualizar tarea por ID
router.put('/:id', verifyToken, taskController.updateTask);

// DELETE /api/tasks/:id  → Eliminar tarea por ID
router.delete('/:id', verifyToken, taskController.deleteTask);

// Exporta el router
module.exports = router;
