'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import api from '@/lib/apiClient';
import GlassCard from '@/components/ui/GlassCard';

export default function IAPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadUserProjects();
      setMessages([{
        role: 'assistant',
        content: getWelcomeMessage(user.rol),
        timestamp: new Date()
      }]);
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getWelcomeMessage = (role) => {
    if (role === 'admin') {
      return "¡Hola! Soy tu asistente de IA para BoomLab. Como administrador, puedo ayudarte con información sobre todos los proyectos, usuarios y el estado general del sistema. ¿Qué necesitas saber?";
    } else if (role === 'cliente') {
      return "¡Hola! Soy tu asistente de IA para BoomLab. Estoy aquí para ayudarte con información sobre tus proyectos, su estado y cualquier duda que tengas. ¿En qué puedo ayudarte?";
    } else {
      return "¡Hola! Soy tu asistente de IA para BoomLab. Puedo ayudarte con información sobre los proyectos que tienes asignados, tus tareas pendientes y el estado de tus trabajos. ¿Qué necesitas?";
    }
  };

  const loadUserProjects = async () => {
    try {
      let projects = [];
      
      if (user.rol === 'admin') {
        projects = await api.get('/api/proyectos');
      } else if (user.rol === 'cliente') {
        const allProjects = await api.get('/api/proyectos');
        projects = allProjects.filter(p => p.id_cliente === user.id);
      } else if (user.rol === 'empleado') {
        try {
          const assignments = await api.get('/api/asignaciones');
          const assignedProjectIds = assignments
            .filter(a => a.id_empleado === user.id)
            .map(a => a.id_proyecto);
          const allProjects = await api.get('/api/proyectos');
          projects = allProjects.filter(p => assignedProjectIds.includes(p.id));
        } catch {
          projects = [];
        }
      }

      setUserProjects(projects);
    } catch (err) {
      console.error('Error loading projects for AI context:', err);
    }
  };

  const generateSecureContext = () => {
    const projectSummary = userProjects.map(p => ({
      id: p.id_proyecto,
      titulo: p.titulo,
      estado: p.estado,
      cliente: p.nombre_cliente,
      descripcion: p.descripcion,
      fecha_creacion: p.fecha_creacion,
    }));

    return {
      userRole: user.rol,
      userName: user.nombre,
      totalProjects: userProjects.length,
      pendingProjects: userProjects.filter(p => p.estado === 'pendiente').length,
      activeProjects: userProjects.filter(p => p.estado === 'en_proceso').length,
      completedProjects: userProjects.filter(p => p.estado === 'completado').length,
      projects: projectSummary
    };
  };

  const handleSend = async () => {
    if (!input.trim() || loadingAI) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoadingAI(true);

    try {
      const secureContext = generateSecureContext();
      
      const response = await api.post('/api/ai/chat', {
        message: userMessage.content,
        context: secureContext
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error('Error en chat IA:', err);
      // Fallback a respuesta local
      const secureContext = generateSecureContext();
      const fallbackResponse = generateLocalResponse(userMessage.content, secureContext);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date()
      }]);
    } finally {
      setLoadingAI(false);
    }
  };

  const generateLocalResponse = (prompt, context) => {
    const query = prompt.toLowerCase();
    const { totalProjects, pendingProjects, activeProjects, completedProjects, userName } = context;

    if (query.includes('cuántos proyectos') || query.includes('cuantos proyectos') || query.includes('total')) {
      if (context.userRole === 'admin') {
        return `Como administrador, tienes visibilidad de ${totalProjects} proyectos en total:\n- ${pendingProjects} pendientes\n- ${activeProjects} en proceso\n- ${completedProjects} completados`;
      }
      return `Tienes ${totalProjects} proyectos asignados:\n- ${pendingProjects} pendientes\n- ${activeProjects} en proceso\n- ${completedProjects} completados`;
    }

    if (query.includes('pendiente') || query.includes('falta') || query.includes('por hacer')) {
      const pending = context.projects.filter(p => p.estado === 'pendiente');
      if (pending.length === 0) return '¡Excelente! No tienes proyectos pendientes.';
      const list = pending.map(p => `- ${p.titulo}`).join('\n');
      return `Tienes ${pending.length} proyectos pendientes:\n${list}`;
    }

    if (query.includes('activo') || query.includes('en proceso') || query.includes('trabajando')) {
      const active = context.projects.filter(p => p.estado === 'en_proceso');
      if (active.length === 0) return 'No tienes proyectos activos actualmente.';
      const list = active.map(p => `- ${p.titulo}`).join('\n');
      return `Estás trabajando en ${active.length} proyectos:\n${list}`;
    }

    if (query.includes('completado') || query.includes('terminado') || query.includes('finalizado')) {
      const completed = context.projects.filter(p => p.estado === 'completado');
      if (completed.length === 0) return 'Aún no tienes proyectos completados.';
      const list = completed.map(p => `- ${p.titulo}`).join('\n');
      return `Has completado ${completed.length} proyectos:\n${list}`;
    }

    if (query.includes('hola') || query.includes('buenos días') || query.includes('buenas')) {
      return `¡Hola ${userName}! Estoy aquí para ayudarte con información sobre tus proyectos. ¿Qué necesitas saber?`;
    }

    if (query.includes('ayuda') || query.includes('qué puedes hacer') || query.includes('que puedes hacer')) {
      return `Puedo ayudarte con:\n- Consultar el estado de tus proyectos\n- Listar proyectos pendientes, activos o completados\n- Responder preguntas sobre tus proyectos asignados\n- Proporcionar información general sobre tu workload\n\nSolo tengo acceso a la información de tus proyectos autorizados.`;
    }

    return `Entiendo tu consulta. Basándome en tu información de proyectos:\n\nTienes ${totalProjects} proyectos en total (${pendingProjects} pendientes, ${activeProjects} activos, ${completedProjects} completados).\n\n¿Te gustaría saber más detalles sobre algún proyecto específico?`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen p-6 pb-32">
      <div className="max-w-4xl mx-auto h-[calc(100vh-180px)]">
        <div className="mb-6">
          <h1 className="font-display text-3xl text-mist-800 mb-2">Asistente IA</h1>
          <p className="text-sm text-mist-400 font-body">
            {user.rol === 'admin' ? 'Acceso total a todos los proyectos' : 'Acceso limitado a tus proyectos'}
          </p>
        </div>

        <GlassCard className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-mist-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lavender-400 to-mauve-500 flex items-center justify-center text-white">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-mist-800">BoomLab AI</h3>
              <p className="text-xs text-mist-500">
                {userProjects.length} proyectos cargados · {user.rol}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-petal-400 to-blush-500 text-white'
                      : 'bg-white/70 border border-mist-100 text-mist-700'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-white/70' : 'text-mist-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {loadingAI && (
              <div className="flex justify-start">
                <div className="bg-white/50 border border-mist-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-mist-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-mist-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-mist-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-mist-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pregunta sobre tus proyectos..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/50 border border-petal-100/80 text-sm text-mist-700 placeholder:text-mist-400 outline-none focus:ring-2 focus:ring-petal-300"
                disabled={loadingAI}
              />
              <button
                onClick={handleSend}
                disabled={loadingAI || !input.trim()}
                className="p-3 bg-gradient-to-r from-petal-400 to-blush-500 text-white rounded-xl disabled:opacity-50 transition-all hover:shadow-md"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-mist-400 mt-2 text-center">
              Solo puedo acceder a información de tus proyectos autorizados
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
