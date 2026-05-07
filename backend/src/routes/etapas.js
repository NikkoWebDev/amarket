const { Router } = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = Router();

// GET /api/etapas/:id_proyecto — Listar etapas de un proyecto
router.get('/:id_proyecto', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Etapa WHERE id_proyecto = ? ORDER BY num_etapa',
      [req.params.id_proyecto]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/etapas/:id_etapa — Empleado actualiza estado de etapa
router.put('/:id_etapa', authMiddleware, requireRole('empleado', 'admin'), async (req, res) => {
  try {
    const { estado } = req.body;
    if (!estado || !['pendiente', 'en_proceso', 'completado'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido. Debe ser: pendiente, en_proceso, completado' });
    }

    const [etapaRows] = await pool.query('SELECT * FROM Etapa WHERE id_etapa = ?', [req.params.id_etapa]);
    if (etapaRows.length === 0) return res.status(404).json({ error: 'Etapa no encontrada' });

    const etapa = etapaRows[0];

    if (req.user.rol === 'empleado') {
      const [asign] = await pool.query(
        'SELECT 1 FROM Asignaciones WHERE id_proyecto = ? AND id_empleado = ?',
        [etapa.id_proyecto, req.user.id_usuario]
      );
      if (asign.length === 0) return res.status(403).json({ error: 'No estás asignado a este proyecto' });
    }

    await pool.query('UPDATE Etapa SET estado = ? WHERE id_etapa = ?', [estado, req.params.id_etapa]);

    // Actualizar fecha_modificacion del proyecto
    // Use CURRENT_TIMESTAMP for PostgreSQL compatibility; works for MySQL as well.
    await pool.query('UPDATE proyecto SET fecha_modificacion = CURRENT_TIMESTAMP WHERE id_proyecto = ?', [etapa.id_proyecto]);

    res.json({ message: 'Etapa actualizada', id_etapa: etapa.id_etapa, estado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
