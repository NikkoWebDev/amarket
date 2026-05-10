'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import api from '@/lib/apiClient';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';

export default function FeedbackPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      let allProjects = [];
      
      if (user.rol === 'admin') {
        allProjects = await api.get('/api/proyectos');
      } else if (user.rol === 'cliente') {
        const projectsData = await api.get('/api/proyectos');
        allProjects = projectsData.filter(p => p.id_cliente === user.id);
      } else if (user.rol === 'empleado') {
        try {
          const assignments = await api.get('/api/asignaciones');
          const assignedProjectIds = assignments
            .filter(a => a.id_empleado === user.id)
            .map(a => a.id_proyecto);
          const projectsData = await api.get('/api/proyectos');
          allProjects = projectsData.filter(p => assignedProjectIds.includes(p.id));
        } catch {
          allProjects = [];
        }
      }

      // Load feedback for each project
      const projectsWithFeedback = await Promise.all(
        allProjects.map(async (p) => {
          try {
            const feedback = await api.get(`/api/proyectos/${p.id_proyecto}`);
            return { ...p, feedback: feedback.feedback || [] };
          } catch {
            return { ...p, feedback: [] };
          }
        })
      );

      setProjects(projectsWithFeedback);
      if (projectsWithFeedback.length > 0 && !selectedProject) {
        setSelectedProject(projectsWithFeedback[0]);
        setMessages(projectsWithFeedback[0].feedback || []);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  };

  const selectProject = (project) => {
    setSelectedProject(project);
    setMessages(project.feedback || []);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedProject) return;
    
    setSending(true);
    try {
      await api.post('/api/feedback', {
        id_proyecto: selectedProject.id_proyecto,
        mensaje: input.trim(),
        autor: user.nombre,
        rol: user.rol
      });
      
      setMessages(prev => [...prev, {
        mensaje: input.trim(),
        autor: user.nombre,
        rol: user.rol,
        fecha: new Date().toISOString()
      }]);
      setInput('');
      
      // Refresh project data
      await loadProjects();
    } catch (err) {
      console.error('Error sending feedback:', err);
    } finally {
      setSending(false);
    }
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-mist-800 mb-2">Feedback</h1>
          <p className="text-sm text-mist-400 font-body">Comunicación con el equipo</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Project List */}
          <GlassCard className="lg:col-span-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-mist-100">
              <h3 className="font-display text-lg text-mist-800">Proyectos</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {projects.map((p) => (
                <button
                  key={p.id_proyecto}
                  onClick={() => selectProject(p)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    selectedProject?.id_proyecto === p.id_proyecto
                      ? 'bg-petal-100 text-petal-700'
                      : 'hover:bg-white/50 text-mist-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-petal-400 to-blush-500 flex items-center justify-center text-white text-sm font-bold">
                      {p.titulo.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{p.titulo}</p>
                      <p className="text-xs opacity-70">{p.nombre_cliente}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <StatusBadge status={p.estado} />
                    {p.feedback?.length > 0 && (
                      <span className="text-xs bg-petal-100 text-petal-600 px-2 py-0.5 rounded-full">
                        {p.feedback.length}
                      </span>
                    )}
                  </div>
                </button>
              ))}
              {projects.length === 0 && (
                <div className="text-center py-8 text-mist-400">
                  <p className="text-sm">No hay proyectos</p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Chat Area */}
          <GlassCard className="lg:col-span-2 flex flex-col overflow-hidden">
            {selectedProject ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-mist-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {selectedProject.titulo.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg text-mist-800">{selectedProject.titulo}</h3>
                    <p className="text-xs text-mist-500">{selectedProject.nombre_cliente}</p>
                  </div>
                  <StatusBadge status={selectedProject.estado} />
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-mist-400">
                      <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12 mb-3 opacity-40" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <p className="text-sm">No hay mensajes aún</p>
                      <p className="text-xs mt-1">Sé el primero en comentar</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.rol === user.rol ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          msg.rol === user.rol
                            ? 'bg-gradient-to-r from-petal-400 to-blush-500 text-white'
                            : 'bg-white/70 border border-mist-100 text-mist-700'
                        }`}>
                          <p className="text-sm">{msg.mensaje}</p>
                          <div className={`flex items-center gap-2 mt-1 text-[10px] ${
                            msg.rol === user.rol ? 'text-white/70' : 'text-mist-400'
                          }`}>
                            <span className="font-semibold">{msg.autor}</span>
                            <span>·</span>
                            <span>{new Date(msg.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-mist-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 px-4 py-2 rounded-xl bg-white/50 border border-petal-100/80 text-sm text-mist-700 placeholder:text-mist-400 outline-none focus:ring-2 focus:ring-petal-300"
                      disabled={sending}
                    />
                    <button
                      onClick={handleSend}
                      disabled={sending || !input.trim()}
                      className="p-2 bg-gradient-to-r from-petal-400 to-blush-500 text-white rounded-xl disabled:opacity-50"
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m22 2-7 20-4-9-9-4 20-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-mist-400">
                <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16 mb-4 opacity-40" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p className="text-lg font-semibold">Selecciona un proyecto</p>
                <p className="text-sm mt-1">Elige un proyecto para ver su feedback</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
