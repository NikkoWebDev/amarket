import { useState, useRef, useEffect } from "react";

// ── Mock conversation data ────────────────────────────────────────────────────
const MOCK_THREADS = [
  {
    id: 1,
    project: "App Móvil E-commerce",
    client: "Moda Bloom",
    avatar: "MB",
    avatarColor: "from-violet-400 to-purple-500",
    unread: 2,
    lastMsg: "¿Pueden ajustar los colores del botón principal?",
    lastTime: "10:42",
    messages: [
      { id: 1, sender: "client",   name: "Sofía R.", text: "Hola, ¿cómo va el avance del proyecto?", time: "9:01", status: "read" },
      { id: 2, sender: "employee", name: "Tú",       text: "¡Hola Sofía! Todo va muy bien. Ya tenemos el 48% completado. Esta semana terminamos la pantalla de checkout.", time: "9:05", status: "read" },
      { id: 3, sender: "client",   name: "Sofía R.", text: "Qué buenas noticias 🎉 Vi el diseño de la semana pasada y me gustó mucho. Solo tengo una sugerencia.", time: "10:38", status: "read" },
      { id: 4, sender: "client",   name: "Sofía R.", text: "¿Pueden ajustar los colores del botón principal? Quiero que sea más acorde a nuestra paleta de marca.", time: "10:42", status: "unread" },
      { id: 5, sender: "system",   name: "Sistema",  text: "Revisión de entregable solicitada por el cliente.", time: "10:42", status: "read" },
    ],
  },
  {
    id: 2,
    project: "Landing Page Campaña",
    client: "Agencia Sol",
    avatar: "AS",
    avatarColor: "from-amber-400 to-orange-500",
    unread: 1,
    lastMsg: "Rechazamos el texto del hero. Necesita más impacto.",
    lastTime: "Ayer",
    messages: [
      { id: 1, sender: "client",   name: "Marco T.", text: "Revisamos la landing y en general está bien. Pero el titular del hero no nos convence.", time: "Ayer 15:20", status: "read" },
      { id: 2, sender: "employee", name: "Tú",       text: "Entendido Marco. ¿Qué dirección de mensaje prefieren?", time: "Ayer 15:45", status: "read" },
      { id: 3, sender: "client",   name: "Marco T.", text: "Rechazamos el texto del hero. Necesita más impacto.", time: "Ayer 16:00", status: "unread" },
    ],
  },
  {
    id: 3,
    project: "Dashboard Analytics",
    client: "DataFirst",
    avatar: "DF",
    avatarColor: "from-teal-400 to-emerald-500",
    unread: 3,
    lastMsg: "Los gráficos de línea no cargan bien en Safari.",
    lastTime: "Lun",
    messages: [
      { id: 1, sender: "client",   name: "Ana P.",   text: "Hay 3 bugs que necesito que revisen lo antes posible.", time: "Lun 11:00", status: "read" },
      { id: 2, sender: "client",   name: "Ana P.",   text: "1) Los gráficos de línea no cargan bien en Safari.", time: "Lun 11:01", status: "unread" },
      { id: 3, sender: "client",   name: "Ana P.",   text: "2) El filtro de fechas no funciona en móvil.", time: "Lun 11:02", status: "unread" },
      { id: 4, sender: "client",   name: "Ana P.",   text: "3) La exportación a CSV incluye filas vacías.", time: "Lun 11:03", status: "unread" },
    ],
  },
];

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isEmployee = msg.sender === "employee";
  const isSystem   = msg.sender === "system";
  const isClient   = msg.sender === "client";

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-[10px] font-body font-semibold text-mist-400
                         bg-mist-100 rounded-full px-3 py-1 flex items-center gap-1.5">
          <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="6" cy="6" r="4.5" />
            <path d="M6 4v2.5L7.5 8" />
          </svg>
          {msg.text} · {msg.time}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 animate-bubble-in
                    ${isEmployee ? "flex-row-reverse" : "flex-row"}`}>

      {/* Avatar */}
      {isClient && (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blush-400 to-petal-500
                        flex-shrink-0 flex items-center justify-center
                        text-white text-[9px] font-bold font-body shadow-sm mb-0.5">
          {msg.name[0]}
        </div>
      )}

      {/* Bubble */}
      <div className={`max-w-[72%] group`}>
        {isClient && (
          <p className="text-[10px] text-mist-400 font-body mb-1 ml-1">{msg.name}</p>
        )}
        <div
          className={`px-4 py-2.5 text-sm font-body leading-relaxed
                     ${isEmployee
                       ? /* Employee: gradient pink */
                         "rounded-3xl rounded-br-md text-white shadow-soft-md"
                       : /* Client: white card */
                         "rounded-3xl rounded-bl-md bg-white text-mist-700 border border-petal-100/80 shadow-soft"
                     }`}
          style={isEmployee ? {
            background: "linear-gradient(135deg, #ff7db2, #e9509d)",
            boxShadow: "0 4px 16px rgba(255,80,148,0.25)",
          } : {}}
        >
          {msg.text}
        </div>
        <p className={`text-[9px] text-mist-300 font-body mt-1
                      ${isEmployee ? "text-right mr-1" : "ml-1"}`}>
          {msg.time}
          {isEmployee && (
            <span className="ml-1 text-petal-300">
              {msg.status === "read" ? "✓✓" : "✓"}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

// ── Thread list item ──────────────────────────────────────────────────────────
function ThreadItem({ thread, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl
                 text-left transition-all duration-200
                 ${isActive
                   ? "bg-gradient-to-r from-petal-50 to-lavender-50 shadow-soft border border-petal-100"
                   : "hover:bg-mist-50/80"
                 }`}
    >
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${thread.avatarColor}
                      flex-shrink-0 flex items-center justify-center
                      text-white text-sm font-bold font-body shadow-sm`}>
        {thread.avatar}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-mist-700 font-body truncate pr-2">
            {thread.project}
          </p>
          <span className="text-[10px] text-mist-300 font-body flex-shrink-0">{thread.lastTime}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-[11px] text-mist-400 font-body truncate pr-2">{thread.lastMsg}</p>
          {thread.unread > 0 && (
            <span className="flex-shrink-0 bg-petal-500 text-white text-[9px] font-bold
                            rounded-full min-w-[16px] h-4 px-1
                            flex items-center justify-center shadow-sm">
              {thread.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Main FeedbackPanel ────────────────────────────────────────────────────────
export default function FeedbackPanel() {
  const [activeId, setActiveId] = useState(1);
  const [input, setInput] = useState("");
  const [threads, setThreads] = useState(MOCK_THREADS);
  const bottomRef = useRef(null);

  const activeThread = threads.find(t => t.id === activeId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, threads]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: "employee",
      name: "Tú",
      text: input.trim(),
      time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };
    setThreads(prev => prev.map(t =>
      t.id === activeId
        ? { ...t, messages: [...t.messages, newMsg], lastMsg: newMsg.text, lastTime: newMsg.time, unread: 0 }
        : t
    ));
    setInput("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex h-[calc(100vh-160px)] gap-4">

      {/* Thread sidebar */}
      <aside className="hidden sm:flex flex-col w-72 flex-shrink-0
                        bg-white/70 backdrop-blur-sm rounded-3xl
                        border border-petal-100/80 shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-petal-100/60">
          <h2 className="font-display text-lg text-mist-800">Mensajes</h2>
          <p className="text-[11px] text-mist-400 font-body mt-0.5">
            {threads.reduce((a, t) => a + t.unread, 0)} sin leer
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-none">
          {threads.map(t => (
            <ThreadItem
              key={t.id}
              thread={t}
              isActive={t.id === activeId}
              onClick={() => setActiveId(t.id)}
            />
          ))}
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col
                      bg-white/70 backdrop-blur-sm rounded-3xl
                      border border-petal-100/80 shadow-soft overflow-hidden">

        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3.5
                        border-b border-petal-100/60 bg-white/80">
          <div className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${activeThread.avatarColor}
                          flex items-center justify-center text-white text-sm font-bold font-body shadow-sm`}>
            {activeThread.avatar}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-mist-800 font-body">{activeThread.project}</p>
            <p className="text-[11px] text-mist-400 font-body">{activeThread.client}</p>
          </div>
          <div className="flex gap-2">
            <button className="w-8 h-8 rounded-xl bg-petal-50 hover:bg-petal-100
                               text-petal-400 flex items-center justify-center transition-colors">
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 5v3.5l2 2" />
              </svg>
            </button>
            <button className="w-8 h-8 rounded-xl bg-lavender-50 hover:bg-lavender-100
                               text-lavender-400 flex items-center justify-center transition-colors">
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M14 10c0 .5-.5 1-1 1H4l-2 3V3c0-.5.5-1 1-1h10c.5 0 1 .5 1 1v7z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3
                        bg-canvas-100/50 scrollbar-none">
          {/* Date separator */}
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-mist-100" />
            <span className="text-[10px] text-mist-300 font-body font-semibold">HOY</span>
            <div className="flex-1 h-px bg-mist-100" />
          </div>

          {activeThread.messages.map((msg, i) => (
            <div key={msg.id} style={{ animationDelay: `${i * 40}ms` }}>
              <MessageBubble msg={msg} />
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="px-4 py-3 border-t border-petal-100/60 bg-white/80">
          <div className="flex items-end gap-2
                          bg-canvas-100 rounded-2xl border border-petal-100/80
                          px-4 py-2.5 focus-within:ring-2 focus-within:ring-petal-200
                          focus-within:border-petal-300 transition-all shadow-inner-soft">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Escribe un mensaje… (Enter para enviar)"
              rows={1}
              className="flex-1 bg-transparent resize-none text-sm font-body
                         text-mist-700 placeholder:text-mist-300 outline-none
                         max-h-24 overflow-auto scrollbar-none leading-relaxed"
              style={{ minHeight: "22px" }}
            />
            <div className="flex items-center gap-1.5 mb-0.5">
              <button className="w-7 h-7 rounded-xl hover:bg-petal-50
                                 text-mist-300 hover:text-petal-400 flex items-center justify-center transition-colors">
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="8" cy="8" r="6.5" />
                  <path d="M5.5 10s.9 1.5 2.5 1.5 2.5-1.5 2.5-1.5M5.5 6.5v.01M10.5 6.5v.01" />
                </svg>
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-xl flex items-center justify-center
                           transition-all duration-200 disabled:opacity-40
                           bg-gradient-to-br from-petal-400 to-blush-500
                           text-white shadow-soft hover:shadow-glow-petal
                           disabled:shadow-none hover:scale-105 active:scale-95"
              >
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2L1 8l5 2 2 5 6-13z" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-[9px] text-mist-300 font-body mt-1.5 ml-1">
            Shift+Enter para nueva línea
          </p>
        </div>
      </div>
    </div>
  );
}
