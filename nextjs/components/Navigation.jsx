'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  Dashboard: () => (
    <svg viewBox="0 0 22 22" fill="none" className="w-[18px] h-[18px]" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="8" height="8" rx="2.5" />
      <rect x="12" y="2" width="8" height="8" rx="2.5" />
      <rect x="2" y="12" width="8" height="8" rx="2.5" />
      <rect x="12" y="12" width="8" height="8" rx="2.5" />
    </svg>
  ),
  Kanban: () => (
    <svg viewBox="0 0 22 22" fill="none" className="w-[18px] h-[18px]" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="5" height="18" rx="2" />
      <rect x="9" y="2" width="5" height="12" rx="2" />
      <rect x="16" y="2" width="5" height="15" rx="2" />
    </svg>
  ),
  Chat: () => (
    <svg viewBox="0 0 22 22" fill="none" className="w-[18px] h-[18px]" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 2H2v14h3v4l5-4h10V2z" />
      <path d="M6 8h10M6 11h6" />
    </svg>
  ),
  AI: () => (
    <svg viewBox="0 0 22 22" fill="none" className="w-[18px] h-[18px]" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="3" />
      <path d="M11 2v3M11 17v3M2 11h3M17 11h3" />
      <path d="M4.93 4.93l2.12 2.12M14.95 14.95l2.12 2.12M4.93 17.07l2.12-2.12M14.95 7.05l2.12-2.12" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 22 22" fill="none" className="w-[18px] h-[18px]" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="2.8" />
      <path d="M11 1.5V4M11 18v2.5M1.5 11H4M18 11h2.5M4.22 4.22l1.77 1.77M16.01 16.01l1.77 1.77M4.22 17.78l1.77-1.77M16.01 5.99l1.77-1.77" />
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 22 22" fill="none" className="w-[18px] h-[18px]" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard",  Icon: Icon.Dashboard, path: "/admin" },
  { id: "kanban",    label: "Proyectos",  Icon: Icon.Kanban,   path: "/proyectos" },
  { id: "feedback",  label: "Feedback",   Icon: Icon.Chat,     path: "/proyectos" },
  { id: "ia",        label: "IA Insights",Icon: Icon.AI,       path: "#" },
  { id: "settings",  label: "Ajustes",    Icon: Icon.Settings, path: "/ajustes" },
  { id: "logout",    label: "Cerrar",     Icon: Icon.Logout,   path: null },
];

export default function Navigation({ active, onChange, userRole, onLogout }) {
  const router = useRouter();

  const handleClick = (item) => {
    if (item.id === 'logout') {
      onLogout?.();
      return;
    }
    if (item.path) {
      router.push(item.path);
    }
    onChange?.(item.id);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center
                    bg-gradient-to-t from-[#fdf8fb] via-[#fdf8fb]/90 to-transparent
                    pt-6 pb-3 px-4 pointer-events-none">

      <nav
        className="pointer-events-auto flex items-end gap-0.5
                   bg-white/70 backdrop-blur-2xl
                   border border-petal-100/80 rounded-3xl px-2 py-2
                   shadow-soft-lg"
        style={{
          boxShadow:
            "0 8px 40px rgba(180,80,140,0.14), 0 1px 0 rgba(255,255,255,0.95) inset",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <NavButton
              key={item.id}
              item={item}
              isActive={isActive}
              onClick={() => handleClick(item)}
            />
          );
        })}
      </nav>
    </div>
  );
}

function NavButton({ item, isActive, onClick }) {
  const { label, Icon: ItemIcon } = item;

  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center gap-1
        transition-all duration-300 ease-out rounded-2xl
        focus:outline-none group
        ${isActive
          ? "px-4 sm:px-5 py-2.5 -translate-y-2.5 scale-105 text-white"
          : "px-3 sm:px-4 py-2.5 text-mist-400 hover:text-blush-500 hover:bg-petal-50/80"
        }
      `}
      style={
        isActive
          ? {
              background: "linear-gradient(145deg, #ff7db2, #e9509d 60%, #c48afc)",
              boxShadow:
                "0 -5px 18px rgba(255,77,148,0.30), 0 8px 24px rgba(200,80,160,0.28), 0 1px 0 rgba(255,255,255,0.3) inset",
            }
          : {}
      }
      aria-current={isActive ? "page" : undefined}
    >
      <span
        className={`transition-transform duration-300
                   ${isActive ? "scale-110" : "group-hover:scale-110"}`}
      >
        <ItemIcon />
      </span>

      <span
        className={`
          hidden sm:block text-[11px] font-semibold tracking-wide
          font-body leading-none transition-all duration-300
          ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}
        `}
      >
        {label}
      </span>
    </button>
  );
}
