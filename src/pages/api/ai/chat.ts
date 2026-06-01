import type { APIRoute } from 'astro';
import { getUserFromRequest } from '@/lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Token no proporcionado' }), { status: 401 });
    }

    const { message, context } = await request.json();

    // Try OpenRouter
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (apiKey) {
      try {
        const projectList = (context?.projects || []).map(p =>
          `- ${p.titulo} (Estado: ${p.estado}, Cliente: ${p.cliente || 'N/A'})`
        ).join('\n');

        const systemPrompt = `Eres un asistente de IA para BoomLab, un sistema de gestión de proyectos. Tu nombre de usuario es ${context?.userName || user.nombre} con rol ${context?.userRole || user.rol}. Tienes acceso a ${context?.totalProjects || 0} proyectos:\n${projectList || 'No hay proyectos.'}\n\nSolo puedes responder usando la información de los proyectos listados. No inventes información.`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message },
            ],
            max_tokens: 500,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return new Response(JSON.stringify({
            response: data.choices?.[0]?.message?.content || 'No pude generar una respuesta.',
          }));
        }
      } catch (e) {
        // Fall through to fallback
        console.error('OpenRouter error:', e);
      }
    }

    // Fallback response based on context
    const q = message.toLowerCase();
    const { projects = [], totalProjects = 0, pendingProjects = 0, activeProjects = 0, completedProjects = 0 } = context || {};

    let response = '';
    if (q.includes('cuántos') || q.includes('cuantos') || q.includes('total')) {
      response = `Tienes ${totalProjects} proyectos:\n- ${pendingProjects} pendientes\n- ${activeProjects} en proceso\n- ${completedProjects} completados`;
    } else if (q.includes('pendiente') || q.includes('por hacer')) {
      const p = projects.filter(x => x.estado === 'pendiente');
      response = p.length ? `Tienes ${p.length} pendientes:\n${p.map(x => `- ${x.titulo}`).join('\n')}` : '¡No tienes proyectos pendientes!';
    } else if (q.includes('activo') || q.includes('en proceso')) {
      const a = projects.filter(x => x.estado === 'en_proceso');
      response = a.length ? `Trabajando en ${a.length}:\n${a.map(x => `- ${x.titulo}`).join('\n')}` : 'No hay proyectos activos.';
    } else if (q.includes('completado') || q.includes('terminado')) {
      const c = projects.filter(x => x.estado === 'completado');
      response = c.length ? `Completados: ${c.length}\n${c.map(x => `- ${x.titulo}`).join('\n')}` : 'Aún no hay completados.';
    } else if (q.includes('hola') || q.includes('buenos días') || q.includes('buenas')) {
      response = `¡Hola ${context?.userName || user.nombre}! ¿En qué puedo ayudarte?`;
    } else if (q.includes('ayuda') || q.includes('qué puedes hacer')) {
      response = `Puedo ayudarte con:\n- Consultar estado de proyectos\n- Listar pendientes, activos o completados\n- Preguntar sobre proyectos específicos`;
    } else {
      const mentioned = projects.find(p => q.includes((p.titulo || '').toLowerCase()));
      if (mentioned) {
        response = `"${mentioned.titulo}": Estado: ${mentioned.estado}. Cliente: ${mentioned.cliente || 'N/A'}. Creado: ${new Date(mentioned.fecha_creacion).toLocaleDateString('es-ES')}`;
      } else {
        response = `Tienes ${totalProjects} proyectos (${pendingProjects} pendientes, ${activeProjects} activos, ${completedProjects} completados). ¿Quieres saber más sobre algún proyecto específico?`;
      }
    }

    return new Response(JSON.stringify({ response }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
