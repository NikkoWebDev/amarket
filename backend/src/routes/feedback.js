const { Router } = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = Router();

// GET /api/feedback/:id_proyecto — Listar feedback de un proyecto
router.get('/:id_proyecto', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT f.*, u.nombre AS nombre_autor
      FROM Feedback f
      JOIN Usuarios u ON u.id_usuario = f.id_autor
      WHERE f.id_proyecto = ?
      ORDER BY f.id_feedback DESC
    `, [req.params.id_proyecto]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/feedback — Cliente crea feedback
router.post('/', authMiddleware, requireRole('cliente'), async (req, res) => {
  try {
    const { id_proyecto, comentario, aprobado } = req.body;
    if (!id_proyecto || !comentario || aprobado === undefined) {
      return res.status(400).json({ error: 'id_proyecto, comentario y aprobado son obligatorios' });
    }

    const [projRows] = await pool.query(
      'SELECT 1 FROM proyecto WHERE id_proyecto = ? AND id_cliente = ?',
      [id_proyecto, req.user.id_usuario]
    );
    if (projRows.length === 0) {
      return res.status(403).json({ error: 'No tienes acceso a este proyecto' });
    }

    const [result] = await pool.query(
      'INSERT INTO Feedback (id_proyecto, id_autor, comentario, aprobado) VALUES (?, ?, ?, ?)',
      [id_proyecto, req.user.id_usuario, comentario, aprobado ? 1 : 0]
    );

    res.status(201).json({ id_feedback: result.insertId, id_proyecto, comentario, aprobado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/feedback/:id — Cliente actualiza feedback (aprobado)
router.put('/:id', authMiddleware, requireRole('cliente'), async (req, res) => {
  try {
    const { aprobado, comentario } = req.body;

    const [fbRows] = await pool.query('SELECT * FROM Feedback WHERE id_feedback = ?', [req.params.id]);
    if (fbRows.length === 0) return res.status(404).json({ error: 'Feedback no encontrado' });

    const fb = fbRows[0];
    if (fb.id_autor !== req.user.id_usuario) {
      return res.status(403).json({ error: 'Solo el autor puede modificar este feedback' });
    }

    const updates = [];
    const values = [];
    if (aprobado !== undefined) { updates.push('aprobado = ?'); values.push(aprobado ? 1 : 0); }
    if (comentario) { updates.push('comentario = ?'); values.push(comentario); }
    if (updates.length === 0) return res.status(400).json({ error: 'Nada que actualizar' });

    values.push(req.params.id);
    await pool.query(`UPDATE Feedback SET ${updates.join(', ')} WHERE id_feedback = ?`, values);

    res.json({ message: 'Feedback actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
