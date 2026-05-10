const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const axios = require('axios');

// Middleware para verificar token en todas las rutas
router.use(authMiddleware);

// Configuración de OpenRouter
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'tencent/hy3-preview:free';
const OPENROUTER_MODEL_2 = process.env.OPENROUTER_MODEL_2 || 'openrouter/free';

/**
 * POST /api/ai/chat
 * Endpoint para chat con IA usando OpenRouter
 * Solo puede acceder a información de proyectos del usuario autenticado
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, context, model } = req.body;
    const user = req.user;

    if (!message) {
      return res.status(400).json({ error: 'El mensaje es requerido' });
    }

    // Validar que el contexto pertenece al usuario (seguridad)
    if (!context || context.userRole !== user.rol) {
      return res.status(403).json({ error: 'Contexto no autorizado' });
    }

    // Construir el system prompt seguro
    const systemPrompt = buildSecureSystemPrompt(context, user);

    // Seleccionar modelo
    const selectedModel = model === 'secondary' ? OPENROUTER_MODEL_2 : OPENROUTER_MODEL;

    // Verificar que tenemos API key
    if (!OPENROUTER_API_KEY) {
      // Modo simulación si no hay API key
      console.log('[AI] Modo simulación - No hay OPENROUTER_API_KEY');
      const simulatedResponse = generateSimulatedResponse(message, context, user);
      return res.json({ 
        response: simulatedResponse,
        model: 'simulated',
        timestamp: new Date().toISOString()
      });
    }

    // Llamar a OpenRouter API
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
          'X-Title': 'BoomLab AI Assistant'
        },
        timeout: 30000 // 30 segundos timeout
      }
    );

    const aiResponse = response.data.choices[0]?.message?.content || 
                       'Lo siento, no pude procesar tu consulta.';

    res.json({
      response: aiResponse,
      model: selectedModel,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[AI] Error en chat:', error.response?.data || error.message);
    
    // Si falla la API, usar respuesta simulada como fallback
    if (req.body.context) {
      const simulatedResponse = generateSimulatedResponse(
        req.body.message, 
        req.body.context, 
        req.user
      );
      return res.json({ 
        response: simulatedResponse,
        model: 'simulated-fallback',
        timestamp: new Date().toISOString(),
        error: 'API no disponible, usando modo simulación'
      });
    }

    res.status(500).json({ 
      error: 'Error al procesar la consulta con la IA',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/ai/quick-summary
 * Resumen rápido de proyectos del usuario
 */
router.post('/quick-summary', async (req, res) => {
  try {
    const { context } = req.body;
    const user = req.user;

    // Validar contexto
    if (!context || context.userRole !== user.rol) {
      return res.status(403).json({ error: 'Contexto no autorizado' });
    }

    const summary = generateProjectSummary(context, user);

    res.json({
      summary,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[AI] Error en summary:', error);
    res.status(500).json({ error: 'Error al generar resumen' });
  }
});

// Funciones auxiliares

function buildSecureSystemPrompt(context, user) {
  const projectList = context.projects?.map(p => 
    `- ${p.titulo} (Estado: ${p.estado}, Cliente: ${p.cliente || 'N/A'})`
  ).join('\n') || 'No hay proyectos disponibles.';

  return `Eres un asistente de IA para BoomLab, una plataforma de gestión de proyectos.

INFORMACIÓN DEL USUARIO:
- Nombre: ${context.userName || user.nombre}
- Rol: ${context.userRole}
- Total de proyectos accesibles: ${context.totalProjects || 0}
- Proyectos pendientes: ${context.pendingProjects || 0}
- Proyectos activos: ${context.activeProjects || 0}
- Proyectos completados: ${context.completedProjects || 0}

LISTA DE PROYECTOS DEL USUARIO:
${projectList}

REGLAS DE SEGURIDAD CRÍTICAS:
1. SOLO puedes hablar sobre los proyectos listados arriba.
2. NUNCA inventes información sobre proyectos que no están en la lista.
3. NUNCA reveles información de otros usuarios o proyectos no autorizados.
4. Si te preguntan sobre información no disponible, indica claramente que no tienes acceso a esos datos.
5. Mantén las respuestas profesionales, concisas y enfocadas en los proyectos del usuario.
6. Responde en español.

TIPOS DE CONSULTAS QUE PUEDES MANEJAR:
- Estado de proyectos (pendientes, activos, completados)
- Información específica de proyectos listados
- Resúmenes de workload
- Preguntas generales sobre la plataforma

Recuerda: Eres un asistente especializado SOLO en la información de proyectos del usuario actual.`;
}

function generateSimulatedResponse(message, context, user) {
  const query = message.toLowerCase();
  const { 
    projects = [], 
    userRole, 
    totalProjects = 0, 
    pendingProjects = 0, 
    activeProjects = 0, 
    completedProjects = 0,
    userName = user.nombre
  } = context;

  // Respuestas basadas en palabras clave
  if (query.includes('cuántos proyectos') || query.includes('cuantos proyectos') || query.includes('total')) {
    if (userRole === 'admin') {
      return `Como administrador, tienes visibilidad de ${totalProjects} proyectos en total:\n- ${pendingProjects} pendientes\n- ${activeProjects} en proceso\n- ${completedProjects} completados`;
    }
    return `Tienes ${totalProjects} proyectos asignados:\n- ${pendingProjects} pendientes\n- ${activeProjects} en proceso\n- ${completedProjects} completados`;
  }

  if (query.includes('pendiente') || query.includes('falta') || query.includes('por hacer') || query.includes('trabajo pendiente')) {
    const pending = projects.filter(p => p.estado === 'pendiente');
    if (pending.length === 0) return '¡Excelente! No tienes proyectos pendientes.';
    const list = pending.map(p => `- ${p.titulo}`).join('\n');
    return `Tienes ${pending.length} proyectos pendientes:\n${list}`;
  }

  if (query.includes('activo') || query.includes('en proceso') || query.includes('trabajando')) {
    const active = projects.filter(p => p.estado === 'en_proceso');
    if (active.length === 0) return 'No tienes proyectos activos actualmente.';
    const list = active.map(p => `- ${p.titulo}`).join('\n');
    return `Estás trabajando en ${active.length} proyectos:\n${list}`;
  }

  if (query.includes('completado') || query.includes('terminado') || query.includes('finalizado')) {
    const completed = projects.filter(p => p.estado === 'completado');
    if (completed.length === 0) return 'Aún no tienes proyectos completados.';
    const list = completed.map(p => `- ${p.titulo}`).join('\n');
    return `Has completado ${completed.length} proyectos:\n${list}`;
  }

  if (query.includes('hola') || query.includes('buenos días') || query.includes('buenas')) {
    return `¡Hola ${userName}! Soy tu asistente de IA para BoomLab. Estoy aquí para ayudarte con información sobre tus proyectos. ¿Qué necesitas saber?`;
  }

  if (query.includes('ayuda') || query.includes('qué puedes hacer') || query.includes('que puedes hacer')) {
    return `Puedo ayudarte con:\n- Consultar el estado de tus proyectos\n- Listar proyectos pendientes, activos o completados\n- Responder preguntas sobre tus proyectos asignados\n- Proporcionar información general sobre tu workload\n\nSolo tengo acceso a la información de tus proyectos autorizados.`;
  }

  // Buscar proyecto específico mencionado
  const mentionedProject = projects.find(p => 
    query.includes(p.titulo.toLowerCase()) || 
    (p.cliente && query.includes(p.cliente.toLowerCase()))
  );

  if (mentionedProject) {
    return `El proyecto "${mentionedProject.titulo}" está actualmente en estado: **${mentionedProject.estado}**.\n\nCliente: ${mentionedProject.cliente || 'N/A'}\nCreado: ${new Date(mentionedProject.fecha_creacion).toLocaleDateString('es-ES')}`;
  }

  return `Entiendo tu consulta. Basándome en tu información de proyectos:\n\nTienes ${totalProjects} proyectos en total (${pendingProjects} pendientes, ${activeProjects} activos, ${completedProjects} completados).\n\n¿Te gustaría saber más detalles sobre algún proyecto específico?`;
}

function generateProjectSummary(context, user) {
  const { projects = [], userRole, totalProjects } = context;
  
  const pending = projects.filter(p => p.estado === 'pendiente').length;
  const active = projects.filter(p => p.estado === 'en_proceso').length;
  const completed = projects.filter(p => p.estado === 'completado').length;

  let summary = `Resumen de proyectos de ${user.nombre}:\n\n`;
  summary += `Total: ${totalProjects}\n`;
  summary += `Pendientes: ${pending}\n`;
  summary += `En proceso: ${active}\n`;
  summary += `Completados: ${completed}\n\n`;

  if (pending > 0) {
    summary += `Proyectos que requieren atención: ${pending}`;
  } else if (active > 0) {
    summary += `Todos los proyectos están en progreso.`;
  } else if (completed === totalProjects && totalProjects > 0) {
    summary += `¡Todos los proyectos están completados! 🎉`;
  } else {
    summary += `No hay proyectos registrados.`;
  }

  return summary;
}

module.exports = router;
