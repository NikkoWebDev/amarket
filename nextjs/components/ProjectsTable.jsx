'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/apiClient';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import GlassButton from '@/components/ui/GlassButton';

export default function ProjectsTable({ user, userRole }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos'); // 'todos', 'pendiente', 'en_proceso', 'completado'
  const [stats, setStats] = useState({ total: 0, pendiente: 0, en_proceso: 0, completado: 0 });

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      
      // Cargar proyectos según el rol
      let allProjects = [];
      
      if (userRole === 'admin') {
        allProjects = await api.get('/api/proyectos');
      } else if (userRole === 'cliente') {
        const projectsData = await api.get('/api/proyectos');
        allProjects = projectsData.filter(p => p.id_cliente === user.id);
      } else if (userRole === 'empleado') {
        // Para empleados, obtener asignaciones y filtrar
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

      // Calcular estadísticas
      const stats = {
        total: allProjects.length,
        pendiente: allProjects.filter(p => p.estado === 'pendiente').length,
        en_proceso: allProjects.filter(p => p.estado === 'en_proceso').length,
        completado: allProjects.filter(p => p.estado === 'completado').length,
      };
      setStats(stats);

      // Ordenar por fecha de creación (más recientes primero)
      const sorted = allProjects.sort((a, b) => 
        new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
      );

      setProjects(sorted);
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = filter === 'todos' 
    ? projects 
    : projects.filter(p => p.estado === filter);

  const getPriorityColor = (estado) => {
    if (estado === 'pendiente') return 'text-red-500';
    if (estado === 'en_proceso') return 'text-amber-500';
    if (estado === 'completado') return 'text-emerald-500';
    return 'text-mist-400';
  };

  const getPriorityLabel = (estado) => {
    if (estado === 'pendiente') return 'Alta';
    if (estado === 'en_proceso') return 'Media';
    if (estado === 'completado') return 'Baja';
    return 'Normal';
  };

  const FilterButton = ({ value, label, count, active }) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
        active 
          ? 'bg-gradient-to-r from-petal-400 to-blush-500 text-white shadow-md' 
          : 'bg-white/50 text-mist-600 hover:bg-white/80'
      }`}
    >
      {label} {count > 0 && <span className="ml-1 opacity-80">({count})</span>}
    </button>
  );

  if (loading) {
    return (
      <GlassCard padding="large">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-petal-300 border-t-petal-500 rounded-full animate-spin" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard padding="large">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div>
            <h3 className="font-display text-xl text-mist-800">Trabajos</h3>
            <p className="text-sm text-mist-500">
              {stats.total} {stats.total === 1 ? 'trabajo en total' : 'trabajos en total'}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros por estado */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterButton value="todos" label="Todos" count={stats.total} active={filter === 'todos'} />
        <FilterButton value="pendiente" label="Pendientes" count={stats.pendiente} active={filter === 'pendiente'} />
        <FilterButton value="en_proceso" label="En Proceso" count={stats.en_proceso} active={filter === 'en_proceso'} />
        <FilterButton value="completado" label="Completados" count={stats.completado} active={filter === 'completado'} />
      </div>

      {filteredProjects.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-mist-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-mist-500 uppercase tracking-wider">Proyecto</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-mist-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-mist-500 uppercase tracking-wider">Estado</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-mist-500 uppercase tracking-wider">Prioridad</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-mist-500 uppercase tracking-wider">Creado</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id_proyecto} className="border-b border-mist-50 hover:bg-white/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                        project.estado === 'completado' ? 'bg-gradient-to-br from-emerald-400 to-green-500' :
                        project.estado === 'en_proceso' ? 'bg-gradient-to-br from-violet-400 to-purple-500' :
                        'bg-gradient-to-br from-petal-400 to-blush-500'
                      }`}>
                        {project.titulo.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-mist-800 text-sm">{project.titulo}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-mist-600">{project.nombre_cliente || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={project.estado} />
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold ${getPriorityColor(project.estado)}`}>
                      {getPriorityLabel(project.estado)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-mist-500">
                    {new Date(project.fecha_creacion).toLocaleDateString('es-ES', { 
                      day: 'numeric', 
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-mist-400">
          <svg viewBox="0 0 24 24" fill="none" className="w-12 h-12 mb-3 opacity-40" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <p className="text-sm font-body">
            {filter === 'todos' 
              ? 'No tienes trabajos asignados' 
              : `No hay trabajos ${filter.replace('_', ' ')}`}
          </p>
        </div>
      )}
    </GlassCard>
  );
}
