const { Router } = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = Router();

// POST /api/asignaciones — Admin asigna empleado a proyecto
router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id_proyecto, id_empleado } = req.body;
    if (!id_proyecto || !id_empleado) {
      return res.status(400).json({ error: 'id_proyecto e id_empleado son obligatorios' });
    }

    const [empRows] = await pool.query(
      'SELECT id_usuario FROM Usuarios WHERE id_usuario = ? AND rol = "empleado"',
      [id_empleado]
    );
    if (empRows.length === 0) {
      return res.status(400).json({ error: 'El id_empleado no corresponde a un usuario con rol empleado' });
    }

    const [projRows] = await pool.query('SELECT 1 FROM proyecto WHERE id_proyecto = ?', [id_proyecto]);
    if (projRows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    const [existing] = await pool.query(
      'SELECT 1 FROM Asignaciones WHERE id_proyecto = ? AND id_empleado = ?',
      [id_proyecto, id_empleado]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El empleado ya está asignado a este proyecto' });
    }

    const [result] = await pool.query(
      'INSERT INTO Asignaciones (id_proyecto, id_empleado) VALUES (?, ?)',
      [id_proyecto, id_empleado]
    );

    res.status(201).json({ id_asignacion: result.insertId, id_proyecto, id_empleado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/asignaciones/:id — Admin elimina asignación
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Asignaciones WHERE id_asignacion = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Asignación no encontrada' });
    res.json({ message: 'Asignación eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
