// Importa Express
const express = require('express');
// Importa CORS
const cors = require('cors');
// Crea la aplicación
const app = express();

// ─── Middlewares globales ───────────────────────
// Permite recibir JSON en el body
app.use(express.json());
// Permite peticiones desde el frontend (localhost)
app.use(cors());

// ─── Rutas ─────────────────────────────────────
// Rutas de autenticación
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Rutas de tareas (protegidas por JWT)
const taskRoutes = require('./routes/task.routes');
app.use('/api/tasks', taskRoutes);

// ─── Inicio del servidor ────────────────────────
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
