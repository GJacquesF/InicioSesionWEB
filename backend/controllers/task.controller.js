// Importa la conexión a la base de datos
const db = require('../config/db');

// ────────────────────────────────────────────────
// OBTENER TODAS LAS TAREAS DEL USUARIO
// ────────────────────────────────────────────────
exports.getTasks = (req, res) => {
  const userId = req.user.id;

  const sql = 'SELECT * FROM tareas WHERE id_usuario = ? ORDER BY id DESC';
  db.query(sql, [userId], (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Error al obtener las tareas.' });
    }
    res.status(200).json(results);
  });
};

// ────────────────────────────────────────────────
// CREAR UNA NUEVA TAREA
// ────────────────────────────────────────────────
exports.createTask = (req, res) => {
  const userId = req.user.id;
  const { titulo } = req.body;

  if (!titulo || titulo.trim() === '') {
    return res.status(400).json({ message: 'El título de la tarea es requerido.' });
  }

  const sql = 'INSERT INTO tareas (titulo, id_usuario) VALUES (?, ?)';
  db.query(sql, [titulo.trim(), userId], (error, result) => {
    if (error) {
      return res.status(500).json({ message: 'No se pudo crear la tarea.' });
    }
    res.status(201).json({
      message: 'Tarea creada correctamente.',
      task: { id: result.insertId, titulo: titulo.trim(), id_usuario: userId }
    });
  });
};

// ────────────────────────────────────────────────
// ACTUALIZAR UNA TAREA
// ────────────────────────────────────────────────
exports.updateTask = (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;
  const { titulo } = req.body;

  if (!titulo || titulo.trim() === '') {
    return res.status(400).json({ message: 'El título es requerido.' });
  }

  // Solo permite actualizar tareas del propio usuario
  const sql = 'UPDATE tareas SET titulo = ? WHERE id = ? AND id_usuario = ?';
  db.query(sql, [titulo.trim(), taskId, userId], (error, result) => {
    if (error) {
      return res.status(500).json({ message: 'No se pudo actualizar la tarea.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }
    res.status(200).json({ message: 'Tarea actualizada correctamente.' });
  });
};

// ────────────────────────────────────────────────
// ELIMINAR UNA TAREA
// ────────────────────────────────────────────────
exports.deleteTask = (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;

  // Solo permite eliminar tareas del propio usuario
  const sql = 'DELETE FROM tareas WHERE id = ? AND id_usuario = ?';
  db.query(sql, [taskId, userId], (error, result) => {
    if (error) {
      return res.status(500).json({ message: 'No se pudo eliminar la tarea.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada.' });
    }
    res.status(200).json({ message: 'Tarea eliminada correctamente.' });
  });
};
