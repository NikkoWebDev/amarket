'use client';

export default function StatusBadge({ status }) {
  const statusConfig = {
    pendiente: {
      bg: 'bg-sky-100',
      text: 'text-sky-600',
      label: 'Pendiente',
    },
    en_proceso: {
      bg: 'bg-violet-100',
      text: 'text-violet-600',
      label: 'En Proceso',
    },
    completado: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-600',
      label: 'Completado',
    },
  };

  const config = statusConfig[status] || statusConfig.pendiente;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
