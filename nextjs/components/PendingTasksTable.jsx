'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/apiClient';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';

export default function PendingTasksTable({ user, userRole }) {
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPendingTasks();
    }
  }, [user]);

  const loadPendingTasks = async () => {
    try {
      setLoading(true);
      
      // Cargar proyectos según el rol
      let allProjects = [];
      
      if (userRole === 'admin') {
        allProjects = await api.get('/api/proyectos');
      } else if (userRole === 'cliente') {
        const projects = await api.get('/api/proyectos');
        allProjects = projects.filter(p => p.id_cliente === user.id);
      } else if (userRole === 'empleado') {
        // Para empleados, obtener asignaciones y filtrar
        try {
          const assignments = await api.get('/api/asignaciones');
          const assignedProjectIds = assignments
            .filter(a => a.id_empleado === user.id)
            .map(a => a.id_proyecto);
          const projects = await api.get('/api/proyectos');
          allProjects = projects.filter(p => assignedProjectIds.includes(p.id));
        } catch {
          allProjects = [];
        }
      }

      // Filtrar solo proyectos pendientes o en proceso
      const pending = allProjects.filter(p => 
        p.estado === 'pendiente' || p.estado === 'en_proceso'
      );

      // Ordenar por fecha de creación (más antiguos primero)
      const sorted = pending.sort((a, b) => 
        new Date(a.fecha_creacion) - new Date(b.fecha_creacion)
      );

      setPendingTasks(sorted);
    } catch (err) {
      console.error('Error loading pending tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (estado) => {
    if (estado === 'pendiente') return 'text-red-500';
    if (estado === 'en_proceso') return 'text-amber-500';
    return 'text-mist-400';
  };

  const getPriorityLabel = (estado) => {
    if (estado === 'pendiente') return 'Alta';
    if (estado === 'en_proceso') return 'Media';
    return 'Baja';
  };

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div>
            <h3 className="font-display text-xl text-mist-800">Trabajos Pendientes</h3>
            <p className="text-sm text-mist-500">
              {pendingTasks.length} {pendingTasks.length === 1 ? 'tarea pendiente' : 'tareas pendientes'}
            </p>
          </div>
        </div>
      </div>

      {pendingTasks.length > 0 ? (
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
              {pendingTasks.map((task) => (
                <tr key={task.id_proyecto} className="border-b border-mist-50 hover:bg-white/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-petal-400 to-blush-500 flex items-center justify-center text-white text-xs font-bold">
                        {task.titulo.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-mist-800 text-sm">{task.titulo}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-mist-600">{task.nombre_cliente || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={task.estado} />
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold ${getPriorityColor(task.estado)}`}>
                      {getPriorityLabel(task.estado)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-mist-500">
                    {new Date(task.fecha_creacion).toLocaleDateString('es-ES', { 
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
          <p className="text-sm font-body">¡No tienes trabajos pendientes!</p>
          <p className="text-xs text-mist-300 mt-1">Todos los proyectos están completados</p>
        </div>
      )}
    </GlassCard>
  );
}
