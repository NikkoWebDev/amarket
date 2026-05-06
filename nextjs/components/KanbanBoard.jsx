'use client';

import api from '@/lib/apiClient';

const ESTADOS = ['pendiente', 'en_proceso', 'completado'];
const ESTADO_LABELS = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  completado: 'Completado',
};
const ESTADO_COLORS = {
  pendiente: '#e74c3c',
  en_proceso: '#f39c12',
  completado: '#27ae60',
};

export default function KanbanBoard({ etapas, userRole, onUpdate }) {
  const handleStatusChange = async (idEtapa, nuevoEstado) => {
    try {
      await api.put(`/api/etapas/${idEtapa}`, { estado: nuevoEstado });
      onUpdate();
    } catch (err) {
      alert(err.message || 'Error al actualizar etapa');
    }
  };

  const columns = [1, 2, 3, 4];

  return (
    <div className="kanban-board">
      {columns.map((num) => {
        const etapa = etapas.find((e) => e.num_etapa === num);
        return (
          <div key={num} className="kanban-column">
            <h4 className="kanban-column-title">Etapa {num}</h4>
            {etapa ? (
              <div className="kanban-card">
                <p className="etapa-desc">{etapa.descripcion}</p>
                <span
                  className="status-badge"
                  style={{ backgroundColor: ESTADO_COLORS[etapa.estado] }}
                >
                  {ESTADO_LABELS[etapa.estado]}
                </span>
                {(userRole === 'empleado' || userRole === 'admin') && (
                  <div className="status-controls">
                    {ESTADOS.map((estado) => (
                      <button
                        key={estado}
                        className={`btn-status ${etapa.estado === estado ? 'active' : ''}`}
                        onClick={() => handleStatusChange(etapa.id_etapa, estado)}
                        disabled={etapa.estado === estado}
                      >
                        {ESTADO_LABELS[estado]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="kanban-card empty">Sin etapa</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
