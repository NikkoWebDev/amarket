'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import api from '@/lib/apiClient';
import KanbanBoard from '@/components/KanbanBoard';
import FeedbackPanel from '@/components/FeedbackPanel';

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
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-petal-100/80">
            <h3 className="font-display text-lg text-mist-800 mb-4">Selecciona un proyecto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <div
                  key={p.id_proyecto}
                  onClick={() => loadProjectDetail(p.id_proyecto)}
                  className="bg-canvas-100 rounded-2xl p-4 border border-petal-100/80 shadow-soft hover:shadow-card-hover cursor-pointer transition-all duration-300 hover:-translate-y-1 animate-float-up"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold font-body shadow-sm">
                      {p.nombre_cliente?.substring(0, 2).toUpperCase() || 'CL'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-mist-800 font-body truncate">{p.titulo}</h4>
                      <p className="text-xs text-mist-400 font-body">{p.nombre_cliente || 'Cliente'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-mist-400 font-body">
                    <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="2" y="2" width="12" height="12" rx="2.5" />
                      <path d="M5 1v3M11 1v3M2 6h12" />
                    </svg>
                    {new Date(p.fecha_creacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-mist-400">
                  <svg viewBox="0 0 40 40" fill="none" className="w-12 h-12 mb-3 opacity-40" stroke="currentColor" strokeWidth="1.5">
                    <rect x="8" y="8" width="24" height="24" rx="5" />
                    <path d="M14 20h12M14 14h8" />
                  </svg>
                  <p className="text-sm font-body">No hay proyectos asignados</p>
                </div>
              )}
            </div>
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

              <KanbanBoard
                proyectos={projects}
                userRole={user.rol}
                onStatusChange={() => loadProjectDetail(selectedProject.id_proyecto)}
              />
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
    </div>
  );
}
