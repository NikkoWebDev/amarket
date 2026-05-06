const { Router } = require('express');
const pool = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = Router();

// GET /api/proyectos — Lista proyectos según rol
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { id_usuario, rol } = req.user;
    let rows;

    if (rol === 'admin') {
      [rows] = await pool.query(`
        SELECT p.*, u.nombre AS nombre_cliente
        FROM proyecto p
        JOIN Usuarios u ON u.id_usuario = p.id_cliente
      `);
    } else if (rol === 'cliente') {
      [rows] = await pool.query(`
        SELECT p.*, u.nombre AS nombre_cliente
        FROM proyecto p
        JOIN Usuarios u ON u.id_usuario = p.id_cliente
        WHERE p.id_cliente = ?
      `, [id_usuario]);
    } else if (rol === 'empleado') {
      [rows] = await pool.query(`
        SELECT p.*, u.nombre AS nombre_cliente
        FROM proyecto p
        JOIN Usuarios u ON u.id_usuario = p.id_cliente
        JOIN Asignaciones a ON a.id_proyecto = p.id_proyecto
        WHERE a.id_empleado = ?
      `, [id_usuario]);
    }

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/proyectos/:id — Detalle de proyecto
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id_usuario, rol } = req.user;
    const [rows] = await pool.query('SELECT * FROM proyecto WHERE id_proyecto = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Proyecto no encontrado' });

    const proyecto = rows[0];

    if (rol === 'cliente' && proyecto.id_cliente !== id_usuario) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    if (rol === 'empleado') {
      const [asign] = await pool.query(
        'SELECT 1 FROM Asignaciones WHERE id_proyecto = ? AND id_empleado = ?',
        [proyecto.id_proyecto, id_usuario]
      );
      if (asign.length === 0) return res.status(403).json({ error: 'Acceso denegado' });
    }

    const [etapas] = await pool.query('SELECT * FROM Etapa WHERE id_proyecto = ? ORDER BY num_etapa', [proyecto.id_proyecto]);
    const [asignaciones] = await pool.query(`
      SELECT a.*, u.nombre AS nombre_empleado
      FROM Asignaciones a
      JOIN Usuarios u ON u.id_usuario = a.id_empleado
      WHERE a.id_proyecto = ?
    `, [proyecto.id_proyecto]);
    const [feedback] = await pool.query(`
      SELECT f.*, u.nombre AS nombre_autor
      FROM Feedback f
      JOIN Usuarios u ON u.id_usuario = f.id_autor
      WHERE f.id_proyecto = ?
      ORDER BY f.id_feedback DESC
    `, [proyecto.id_proyecto]);

    res.json({ ...proyecto, etapas, asignaciones, feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/proyectos — Solo admin crea proyectos (crea 4 etapas automáticamente)
router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { titulo, id_cliente } = req.body;
    if (!titulo || !id_cliente) {
      return res.status(400).json({ error: 'titulo e id_cliente son obligatorios' });
    }

    const [clienteRows] = await conn.query(
      'SELECT id_usuario FROM Usuarios WHERE id_usuario = ? AND rol = "cliente"',
      [id_cliente]
    );
    if (clienteRows.length === 0) {
      return res.status(400).json({ error: 'El id_cliente no corresponde a un usuario con rol cliente' });
    }

    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO proyecto (titulo, id_cliente, id_admin) VALUES (?, ?, ?)',
      [titulo, id_cliente, req.user.id_usuario]
    );
    const id_proyecto = result.insertId;

    const etapasDefault = [
      { num_etapa: 1, descripcion: 'Etapa 1 - Planificación' },
      { num_etapa: 2, descripcion: 'Etapa 2 - Diseño' },
      { num_etapa: 3, descripcion: 'Etapa 3 - Desarrollo' },
      { num_etapa: 4, descripcion: 'Etapa 4 - Entrega' },
    ];
    for (const etapa of etapasDefault) {
      await conn.query(
        'INSERT INTO Etapa (id_proyecto, num_etapa, descripcion, estado) VALUES (?, ?, ?, "pendiente")',
        [id_proyecto, etapa.num_etapa, etapa.descripcion]
      );
    }

    await conn.commit();
    res.status(201).json({ id_proyecto, titulo, id_cliente, id_admin: req.user.id_usuario });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// PUT /api/proyectos/:id — Solo admin actualiza proyecto
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { titulo } = req.body;
    if (!titulo) return res.status(400).json({ error: 'titulo es obligatorio' });

    const [result] = await pool.query(
      'UPDATE proyecto SET titulo = ? WHERE id_proyecto = ?',
      [titulo, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Proyecto no encontrado' });

    res.json({ message: 'Proyecto actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/proyectos/:id — Solo admin elimina proyecto
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM Feedback WHERE id_proyecto = ?', [req.params.id]);
    await conn.query('DELETE FROM Asignaciones WHERE id_proyecto = ?', [req.params.id]);
    await conn.query('DELETE FROM Etapa WHERE id_proyecto = ?', [req.params.id]);
    const [result] = await conn.query('DELETE FROM proyecto WHERE id_proyecto = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    await conn.commit();
    res.json({ message: 'Proyecto eliminado' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
