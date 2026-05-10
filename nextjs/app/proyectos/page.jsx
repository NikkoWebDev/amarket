'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import api from '@/lib/apiClient';
import KanbanBoard from '@/components/KanbanBoard';
import FeedbackPanel from '@/components/FeedbackPanel';
import AIChat from '@/components/AIChat';

export default function ProyectosPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

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
      const res = await api.get('/api/proyectos');
      setProjects(res);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProjectDetail = async (id) => {
    try {
      const res = await api.get(`/api/proyectos/${id}`);
      setSelectedProject(res);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-mist-800 mb-2">Mis Proyectos</h1>
          <p className="text-sm text-mist-400 font-body">{user.nombre} · {user.rol}</p>
        </div>

        {!selectedProject ? (
          <div className="space-y-6">
            {/* Kanban Board - Vista principal de todos los proyectos */}
            <KanbanBoard
              proyectos={projects}
              userRole={user.rol}
              onStatusChange={loadProjects}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedProject(null)}
              className="flex items-center gap-2 text-sm text-mist-400 font-body hover:text-petal-500 transition-colors"
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M10 12l-4-4 4-4" />
                <path d="M6 8h8" />
              </svg>
              Volver a proyectos
            </button>

            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-petal-100/80">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold font-body shadow-sm">
                  {selectedProject.nombre_cliente?.substring(0, 2).toUpperCase() || 'CL'}
                </div>
                <div>
                  <h2 className="font-display text-2xl text-mist-800">{selectedProject.titulo}</h2>
                  <p className="text-sm text-mist-400 font-body">{selectedProject.nombre_cliente || 'Cliente'}</p>
                </div>
              </div>

              {/* Detalles del proyecto seleccionado */}
            </div>

            <FeedbackPanel
              feedback={selectedProject.feedback || []}
              idProyecto={selectedProject.id_proyecto}
              userRole={user.rol}
              onUpdate={() => loadProjectDetail(selectedProject.id_proyecto)}
              proyecto={selectedProject}
            />
          </div>
        )}
      </div>
      
      {/* Chat IA - disponible en toda la página */}
      <AIChat user={user} userRole={user.rol} />
    </div>
  );
}
