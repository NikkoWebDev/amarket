'use client';

import { useState } from "react";
import api from '@/lib/apiClient';

// ── Stage definitions ─────────────────────────────────────────────────────────
const STAGES = [
  {
    id: "pendiente",
    label: "Pendiente",
    emoji: "📥",
    color: {
      bg:     "bg-sky-50/80",
      border: "border-sky-200/60",
      header: "bg-sky-100/70",
      dot:    "bg-sky-400",
      text:   "text-sky-700",
      badge:  "bg-sky-100 text-sky-600",
      shadow: "shadow-sky-100",
    },
  },
  {
    id: "en_proceso",
    label: "En Proceso",
    emoji: "⚙️",
    color: {
      bg:     "bg-violet-50/80",
      border: "border-violet-200/60",
      header: "bg-violet-100/70",
      dot:    "bg-violet-400",
      text:   "text-violet-700",
      badge:  "bg-violet-100 text-violet-600",
      shadow: "shadow-violet-100",
    },
  },
  {
    id: "completado",
    label: "Completado",
    emoji: "✅",
    color: {
      bg:     "bg-emerald-50/80",
      border: "border-emerald-200/60",
      header: "bg-emerald-100/70",
      dot:    "bg-emerald-400",
      text:   "text-emerald-700",
      badge:  "bg-emerald-100 text-emerald-600",
      shadow: "shadow-emerald-100",
    },
  },
];

const PRIORITY_STYLES = {
  alta:  "bg-petal-100 text-petal-600",
  media: "bg-amber-100 text-amber-600",
  baja:  "bg-emerald-100 text-emerald-600",
};

const PRIORITY_DOT = {
  alta:  "bg-petal-400",
  media: "bg-amber-400",
  baja:  "bg-emerald-400",
};

// ── Sub-components ────────────────────────────────────────────────────────────
function Tag({ label }) {
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full
                     bg-mist-100/80 text-mist-500 font-body">
      {label}
    </span>
  );
}

function ProgressBar({ value, stageColor }) {
  return (
    <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700
                   ${value === 100
                     ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                     : "bg-gradient-to-r from-petal-400 to-lavender-400"}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function ProjectCard({ proyecto, stageColor, onSelect, userRole, onStatusChange }) {
  const etapa = proyecto.etapas?.[0] || { estado: 'pendiente' };
  const progress = etapa.estado === 'completado' ? 100 : etapa.estado === 'en_proceso' ? 50 : 0;

  return (
    <div
      onClick={() => onSelect(proyecto)}
      className="relative group cursor-pointer
                 bg-white/90 rounded-2xl p-4
                 border border-white/80
                 shadow-card hover:shadow-card-hover
                 transition-all duration-300 hover:-translate-y-0.5
                 animate-float-up"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500
                        flex items-center justify-center text-white text-xs font-bold font-body shadow-sm`}>
          {proyecto.nombre_cliente?.substring(0, 2).toUpperCase() || 'CL'}
        </div>

        {/* Status badge */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide font-body
                         ${stageColor.badge}`}>
          {stageColor.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-mist-800 font-body leading-snug mb-0.5 pr-2">
        {proyecto.titulo}
      </h3>
      <p className="text-[11px] text-mist-400 font-body mb-3">{proyecto.nombre_cliente || 'Cliente'}</p>

      {/* Progress */}
      <ProgressBar value={progress} />
      <div className="flex justify-between items-center mt-1.5">
        <span className="text-[10px] text-mist-400 font-body">Progreso</span>
        <span className="text-[10px] font-bold text-mist-600 font-body">{progress}%</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-mist-100/80">
        <div className="flex items-center gap-1 text-[10px] text-mist-400 font-body">
          <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <rect x="2" y="2" width="12" height="12" rx="2.5" />
            <path d="M5 1v3M11 1v3M2 6h12" />
          </svg>
          {new Date(proyecto.fecha_creacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ stage, proyectos, onCardSelect, userRole, onStatusChange }) {
  const c = stage.color;
  const count = proyectos.length;

  return (
    <div className={`flex-1 min-w-[240px] max-w-[300px] flex flex-col
                     ${c.bg} border ${c.border} rounded-3xl
                     overflow-hidden`}
         style={{ boxShadow: "0 2px 12px rgba(180,80,140,0.06)" }}>

      {/* Column header */}
      <div className={`${c.header} px-4 py-3 flex items-center justify-between
                       border-b ${c.border}`}>
        <div className="flex items-center gap-2">
          <span className="text-base">{stage.emoji}</span>
          <span className={`text-xs font-bold font-body ${c.text} uppercase tracking-wider`}>
            {stage.label}
          </span>
        </div>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
          {count}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3 p-3 overflow-y-auto flex-1
                      scrollbar-none" style={{ maxHeight: "calc(100vh - 240px)" }}>
        {proyectos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-mist-300">
            <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8 mb-2 opacity-40" stroke="currentColor" strokeWidth="1.5">
              <rect x="8" y="8" width="24" height="24" rx="5" />
              <path d="M14 20h12M14 14h8" />
            </svg>
            <span className="text-[11px] font-body">Sin proyectos</span>
          </div>
        ) : (
          proyectos.map((p, i) => (
            <div key={p.id_proyecto} style={{ animationDelay: `${i * 60}ms` }}>
              <ProjectCard proyecto={p} stageColor={c} onSelect={onCardSelect} userRole={userRole} onStatusChange={onStatusChange} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Detail drawer (slide-in) ──────────────────────────────────────────────────
function ProjectDrawer({ proyecto, onClose, userRole, onStatusChange }) {
  if (!proyecto) return null;
  const etapa = proyecto.etapas?.[0] || { estado: 'pendiente', descripcion: 'Sin etapa' };
  const progress = etapa.estado === 'completado' ? 100 : etapa.estado === 'en_proceso' ? 50 : 0;

  const handleStatusUpdate = async (nuevoEstado) => {
    if (etapa.id_etapa) {
      await onStatusChange(etapa.id_etapa, nuevoEstado);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex">
      <div
        className="flex-1 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="w-full max-w-sm bg-canvas-100 shadow-soft-xl flex flex-col
                      animate-slide-in border-l border-petal-100">
        <div className="flex items-center justify-between px-6 py-4
                        border-b border-petal-100/80">
          <h2 className="font-display text-lg text-mist-800">{proyecto.titulo}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-mist-100 hover:bg-petal-100 text-mist-500
                       flex items-center justify-center transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-soft">
            <p className="text-xs text-mist-400 font-body mb-1">Cliente</p>
            <p className="font-semibold text-mist-700 font-body">{proyecto.nombre_cliente || 'Cliente'}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-soft">
            <p className="text-xs text-mist-400 font-body mb-2">Progreso</p>
            <ProgressBar value={progress} />
            <p className="text-right text-xs font-bold text-mist-600 font-body mt-1">{progress}%</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-soft">
            <p className="text-xs text-mist-400 font-body mb-2">Etapa Actual</p>
            <p className="font-semibold text-mist-700 font-body">{etapa.descripcion}</p>
            {(userRole === 'empleado' || userRole === 'admin') && (
              <div className="mt-3 flex gap-2">
                {STAGES.map(stage => (
                  <button
                    key={stage.id}
                    onClick={() => handleStatusUpdate(stage.id)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold font-body transition-all
                               ${etapa.estado === stage.id
                                 ? 'bg-petal-500 text-white shadow-soft-md'
                                 : 'bg-mist-100 text-mist-600 hover:bg-petal-50'}`}
                  >
                    {stage.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function KanbanBoard({ proyectos, userRole, onStatusChange }) {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = proyectos?.filter(p =>
    p.titulo?.toLowerCase().includes(search.toLowerCase()) ||
    p.nombre_cliente?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Group projects by stage
  const projectsByStage = STAGES.reduce((acc, stage) => {
    acc[stage.id] = filtered.filter(p => {
      const etapa = p.etapas?.[0];
      return etapa?.estado === stage.id;
    });
    return acc;
  }, {});

  const handleStatusChange = async (idEtapa, nuevoEstado) => {
    try {
      await api.put(`/api/etapas/${idEtapa}`, { estado: nuevoEstado });
      onStatusChange();
    } catch (err) {
      alert(err.message || 'Error al actualizar etapa');
    }
  };

  return (
    <div className="min-h-full">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center
                      justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl text-mist-800">Proyectos</h1>
          <p className="text-xs text-mist-400 font-body mt-0.5">
            {proyectos?.length || 0} proyectos activos
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <svg viewBox="0 0 16 16" fill="none"
               className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-mist-300"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="6.5" cy="6.5" r="4.5" />
            <path d="M14 14l-3-3" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar proyecto…"
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white/80
                       border border-petal-100 text-sm font-body text-mist-700
                       placeholder:text-mist-300 outline-none
                       focus:ring-2 focus:ring-petal-200 focus:border-petal-300
                       shadow-soft transition-all"
          />
        </div>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4
                      scrollbar-none -mx-1 px-1">
        {STAGES.map(stage => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            proyectos={projectsByStage[stage.id] || []}
            onCardSelect={setSelected}
            userRole={userRole}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {/* Detail drawer */}
      {selected && (
        <ProjectDrawer proyecto={selected} onClose={() => setSelected(null)} userRole={userRole} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}
