'use client';

import { useState } from 'react';
import api from '@/lib/apiClient';

export default function FeedbackPanel({ feedback, idProyecto, userRole, onUpdate }) {
  const [comentario, setComentario] = useState('');
  const [aprobado, setAprobado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/feedback', { id_proyecto: idProyecto, comentario, aprobado });
      setComentario('');
      setAprobado(false);
      onUpdate();
    } catch (err) {
      alert(err.message || 'Error al enviar feedback');
    }
  };

  const handleToggleAprobado = async (fb) => {
    try {
      await api.put('/api/feedback', { id: fb.id_feedback, aprobado: !fb.aprobado });
      onUpdate();
    } catch (err) {
      alert(err.message || 'Error al actualizar feedback');
    }
  };

  return (
    <div className="feedback-panel">
      <h3>Feedback del Proyecto</h3>

      {userRole === 'cliente' && (
        <form onSubmit={handleSubmit} className="feedback-form">
          <textarea
            placeholder="Escribe tu comentario..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            required
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={aprobado}
              onChange={(e) => setAprobado(e.target.checked)}
            />
            Aprobado (confirmar entrega)
          </label>
          <button type="submit">Enviar Feedback</button>
        </form>
      )}

      <div className="feedback-list">
        {feedback.map((fb) => (
          <div
            key={fb.id_feedback}
            className={`feedback-item ${!fb.aprobado ? 'not-approved' : 'approved'}`}
          >
            <div className="feedback-header">
              <strong>{fb.nombre_autor}</strong>
              <span className={`approval-badge ${fb.aprobado ? 'approved' : 'rejected'}`}>
                {fb.aprobado ? 'Aprobado' : 'No Aprobado'}
              </span>
            </div>
            <p>{fb.comentario}</p>
            {userRole === 'cliente' && (
              <button
                className="btn-toggle-approval"
                onClick={() => handleToggleAprobado(fb)}
              >
                {fb.aprobado ? 'Revocar aprobación' : 'Aprobar'}
              </button>
            )}
            {!fb.aprobado && (
              <div className="notification-alert">
                El cliente NO ha aprobado esta entrega
              </div>
            )}
          </div>
        ))}
        {feedback.length === 0 && <p className="empty-msg">No hay feedback aún</p>}
      </div>
    </div>
  );
}
