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
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Mis Proyectos</h1>
        <div className="header-info">
          <span>{user.nombre} ({user.rol})</span>
          <button onClick={logout} className="btn-logout">Cerrar Sesión</button>
        </div>
      </header>

      <div className="projects-layout">
        <aside className="project-list">
          <h3>Proyectos</h3>
          {projects.map((p) => (
            <div
              key={p.id_proyecto}
              className={`project-card ${selectedProject?.id_proyecto === p.id_proyecto ? 'active' : ''}`}
              onClick={() => loadProjectDetail(p.id_proyecto)}
            >
              <strong>{p.titulo}</strong>
              <small>Cliente: {p.nombre_cliente}</small>
            </div>
          ))}
          {projects.length === 0 && <p className="empty-msg">No hay proyectos asignados</p>}
        </aside>

        <main className="project-detail">
          {selectedProject ? (
            <>
              <h2>{selectedProject.titulo}</h2>
              <KanbanBoard
                etapas={selectedProject.etapas}
                userRole={user.rol}
                onUpdate={() => loadProjectDetail(selectedProject.id_proyecto)}
              />
              <FeedbackPanel
                feedback={selectedProject.feedback}
                idProyecto={selectedProject.id_proyecto}
                userRole={user.rol}
                onUpdate={() => loadProjectDetail(selectedProject.id_proyecto)}
              />
            </>
          ) : (
            <div className="empty-detail">
              <p>Selecciona un proyecto para ver su tablero</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
