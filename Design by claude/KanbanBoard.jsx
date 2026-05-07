import { useState } from "react";

// ── Stage definitions ─────────────────────────────────────────────────────────
const STAGES = [
  {
    id: "intake",
    label: "Recepción",
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
    id: "inprogress",
    label: "En Producción",
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
    id: "review",
    label: "Revisión Cliente",
    emoji: "👁️",
    color: {
      bg:     "bg-amber-50/80",
      border: "border-amber-200/60",
      header: "bg-amber-100/70",
      dot:    "bg-amber-400",
      text:   "text-amber-700",
      badge:  "bg-amber-100 text-amber-600",
      shadow: "shadow-amber-100",
    },
  },
  {
    id: "done",
    label: "Entregado",
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

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_PROJECTS = [
  {
    id: 1, stage: "intake",
    title: "Rediseño Web Corporativa",
    client: "Grupo Nexo",
    due: "15 Jun",
    priority: "alta",
    alerts: 0,
    tags: ["UX", "Branding"],
    progress: 0,
    avatar: "GN",
    avatarColor: "from-sky-400 to-blue-500",
  },
  {
    id: 2, stage: "inprogress",
    title: "App Móvil E-commerce",
    client: "Moda Bloom",
    due: "22 Jun",
    priority: "alta",
    alerts: 2,
    tags: ["React Native", "UI"],
    progress: 48,
    avatar: "MB",
    avatarColor: "from-violet-400 to-purple-500",
  },
  {
    id: 3, stage: "inprogress",
    title: "Sistema de Facturación",
    client: "Contaplus S.A.",
    due: "30 Jun",
    priority: "media",
    alerts: 0,
    tags: ["Backend", "MySQL"],
    progress: 67,
    avatar: "CP",
    avatarColor: "from-pink-400 to-rose-500",
  },
  {
    id: 4, stage: "review",
    title: "Landing Page Campaña",
    client: "Agencia Sol",
    due: "10 Jun",
    priority: "alta",
    alerts: 1,
    tags: ["HTML", "Motion"],
    progress: 92,
    avatar: "AS",
    avatarColor: "from-amber-400 to-orange-500",
  },
  {
    id: 5, stage: "review",
    title: "Dashboard Analytics",
    client: "DataFirst",
    due: "18 Jun",
    priority: "media",
    alerts: 3,
    tags: ["React", "Charts"],
    progress: 85,
    avatar: "DF",
    avatarColor: "from-teal-400 to-emerald-500",
  },
  {
    id: 6, stage: "done",
    title: "Identidad Visual 2024",
    client: "Marcas Unidas",
    due: "01 Jun",
    priority: "baja",
    alerts: 0,
    tags: ["Branding"],
    progress: 100,
    avatar: "MU",
    avatarColor: "from-emerald-400 to-green-500",
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

function ProjectCard({ project, stageColor, onSelect }) {
  return (
    <div
      onClick={() => onSelect(project)}
      className="relative group cursor-pointer
                 bg-white/90 rounded-2xl p-4
                 border border-white/80
                 shadow-card hover:shadow-card-hover
                 transition-all duration-300 hover:-translate-y-0.5
                 animate-float-up"
    >
      {/* Alert badge */}
      {project.alerts > 0 && (
        <span
          className="absolute -top-2 -right-2 z-10
                     bg-red-500 text-white text-[10px] font-bold
                     rounded-full min-w-[20px] h-5 px-1
                     flex items-center justify-center
                     border-2 border-white shadow-md
                     animate-badge-pop"
        >
          {project.alerts}
        </span>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br ${project.avatarColor}
                        flex items-center justify-center text-white text-xs font-bold font-body shadow-sm`}>
          {project.avatar}
        </div>

        {/* Priority pill */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide font-body
                         ${PRIORITY_STYLES[project.priority]}`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${PRIORITY_DOT[project.priority]}`} />
          {project.priority}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-mist-800 font-body leading-snug mb-0.5 pr-2">
        {project.title}
      </h3>
      <p className="text-[11px] text-mist-400 font-body mb-3">{project.client}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {project.tags.map((t) => <Tag key={t} label={t} />)}
      </div>

      {/* Progress */}
      <ProgressBar value={project.progress} />
      <div className="flex justify-between items-center mt-1.5">
        <span className="text-[10px] text-mist-400 font-body">Progreso</span>
        <span className="text-[10px] font-bold text-mist-600 font-body">{project.progress}%</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-mist-100/80">
        <div className="flex items-center gap-1 text-[10px] text-mist-400 font-body">
          <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <rect x="2" y="2" width="12" height="12" rx="2.5" />
            <path d="M5 1v3M11 1v3M2 6h12" />
          </svg>
          {project.due}
        </div>
        {project.alerts > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-red-400 font-body font-semibold">
            <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M8 2L1.5 13h13L8 2z" />
              <path d="M8 7v3M8 12v.5" />
            </svg>
            {project.alerts === 1 ? "1 alerta" : `${project.alerts} alertas`}
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ stage, projects, onCardSelect }) {
  const c = stage.color;
  const count = projects.length;

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
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-mist-300">
            <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8 mb-2 opacity-40" stroke="currentColor" strokeWidth="1.5">
              <rect x="8" y="8" width="24" height="24" rx="5" />
              <path d="M14 20h12M14 14h8" />
            </svg>
            <span className="text-[11px] font-body">Sin proyectos</span>
          </div>
        ) : (
          projects.map((p, i) => (
            <div key={p.id} style={{ animationDelay: `${i * 60}ms` }}>
              <ProjectCard project={p} stageColor={c} onSelect={onCardSelect} />
            </div>
          ))
        )}

        {/* Add button */}
        <button className="mt-1 flex items-center justify-center gap-1.5
                           border-2 border-dashed border-mist-200 rounded-2xl
                           py-2.5 text-[11px] font-semibold text-mist-400 font-body
                           hover:border-petal-300 hover:text-petal-400 hover:bg-petal-50/50
                           transition-all duration-200">
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M8 3v10M3 8h10" />
          </svg>
          Agregar
        </button>
      </div>
    </div>
  );
}

// ── Detail drawer (slide-in) ──────────────────────────────────────────────────
function ProjectDrawer({ project, onClose }) {
  if (!project) return null;
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
          <h2 className="font-display text-lg text-mist-800">{project.title}</h2>
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
            <p className="font-semibold text-mist-700 font-body">{project.client}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-soft">
            <p className="text-xs text-mist-400 font-body mb-2">Progreso</p>
            <ProgressBar value={project.progress} />
            <p className="text-right text-xs font-bold text-mist-600 font-body mt-1">{project.progress}%</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-soft">
            <p className="text-xs text-mist-400 font-body mb-2">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map(t => <Tag key={t} label={t} />)}
            </div>
          </div>
          {project.alerts > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-red-500 font-body">
                ⚠️ {project.alerts} alerta{project.alerts > 1 ? "s" : ""} pendiente{project.alerts > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-red-400 font-body mt-1">
                Hay feedback o rechazos que requieren atención.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function KanbanBoard() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = MOCK_PROJECTS.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.client.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-full">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center
                      justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl text-mist-800">Proyectos</h1>
          <p className="text-xs text-mist-400 font-body mt-0.5">
            {MOCK_PROJECTS.length} proyectos activos
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

        {/* New project button */}
        <button
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5
                     bg-gradient-to-r from-petal-400 to-blush-500
                     text-white text-sm font-semibold font-body rounded-2xl
                     shadow-soft-md hover:shadow-glow-petal
                     transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M8 2v12M2 8h12" />
          </svg>
          Nuevo Proyecto
        </button>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4
                      scrollbar-none -mx-1 px-1">
        {STAGES.map(stage => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            projects={filtered.filter(p => p.stage === stage.id)}
            onCardSelect={setSelected}
          />
        ))}
      </div>

      {/* Detail drawer */}
      {selected && (
        <ProjectDrawer project={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
