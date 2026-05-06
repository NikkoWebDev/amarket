require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const proyectosRoutes = require('./routes/proyectos');
const etapasRoutes = require('./routes/etapas');
const asignacionesRoutes = require('./routes/asignaciones');
const feedbackRoutes = require('./routes/feedback');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/etapas', etapasRoutes);
app.use('/api/asignaciones', asignacionesRoutes);
app.use('/api/feedback', feedbackRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
