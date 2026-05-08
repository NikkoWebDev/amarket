'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import Toggle from '@/components/ui/Toggle';

// Icons
const Icon = {
  Tune: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2"/>
      <path d="M3 7V5a2 2 0 012-2h14a2 2 0 012 2v2"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Notifications: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  Palette: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2a10 10 0 0 1 10 10"/>
      <path d="M12 12 4.93 4.93"/>
      <path d="M12 12l9.9 3.18"/>
    </svg>
  ),
  Hub: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4"/>
      <path d="m5 5 2.83 2.83"/>
      <path d="m19 5-2.83 2.83"/>
      <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"/>
      <circle cx="12" cy="12" r="10"/>
    </svg>
  ),
  Save: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  ),
  Upload: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  Key: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5"/>
      <path d="m21 2-9.4 9.4"/>
      <path d="m15.5 7.5 3 3L22 7l-3-3-1.5 1.5"/>
    </svg>
  ),
  Eye: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Copy: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Add: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
};

const SETTINGS_SECTIONS = [
  { id: 'general', label: 'General', icon: Icon.Tune },
  { id: 'notifications', label: 'Notificaciones', icon: Icon.Notifications },
  { id: 'appearance', label: 'Apariencia', icon: Icon.Palette },
  { id: 'integrations', label: 'Integraciones', icon: Icon.Hub },
];

export default function Ajustes() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('general');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // General settings
  const [general, setGeneral] = useState({
    workspaceName: 'BoomLab',
    timezone: 'America/Bogota',
    language: 'es',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    desktopPush: true,
    emailDigest: false,
    slackActivity: true,
    newProject: true,
    taskAssigned: true,
    feedbackReceived: true,
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: 'light',
    accentColor: 'petal',
  });

  // Integrations settings
  const [integrations, setIntegrations] = useState({
    slackWebhook: '',
    apiKey: '••••••••••••••••••••••••',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Store in localStorage for demo
    localStorage.setItem('boomlab-settings', JSON.stringify({
      general,
      notifications,
      appearance,
      integrations,
    }));
    
    setMessage('Cambios guardados exitosamente');
    setSaving(false);
    
    setTimeout(() => setMessage(''), 3000);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText('sk_live_51H...demo_key');
    setMessage('API Key copiada al portaples');
    setTimeout(() => setMessage(''), 2000);
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <h1 className="font-display text-4xl text-mist-800 mb-2">Ajustes</h1>
          <p className="text-mist-500 font-body">Gestiona las preferencias de tu workspace y cuenta.</p>
        </header>

        {/* Message */}
        {message && (
          <div className={`mb-6 backdrop-blur-sm border rounded-2xl p-4 text-sm font-body text-center ${
            message.includes('Error') 
              ? 'bg-red-50/80 border-red-200 text-red-600' 
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-600'
          }`}>
            {message}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <GlassCard className="sticky top-8">
              <nav className="flex flex-col gap-1">
                {SETTINGS_SECTIONS.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                        activeSection === section.id
                          ? 'bg-petal-100 text-petal-600 font-semibold'
                          : 'text-mist-500 hover:bg-petal-50'
                      }`}
                    >
                      <IconComponent />
                      <span className="text-sm">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
              
              <div className="mt-6 pt-6 border-t border-mist-100">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-petal-400 to-blush-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  <Icon.Save />
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </GlassCard>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* General Section */}
            {activeSection === 'general' && (
              <GlassCard padding="large">
                <div className="flex items-center gap-3 mb-6">
                  <Icon.Tune />
                  <h2 className="font-display text-2xl text-mist-800">General</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Logo Upload */}
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-semibold text-mist-500 mb-4">Logo del Workspace</label>
                    <div className="relative group cursor-pointer border-2 border-dashed border-mist-200 rounded-2xl p-8 bg-white/30 flex flex-col items-center justify-center transition-all hover:border-petal-300 hover:bg-white/50">
                      <div className="w-16 h-16 bg-blush-100 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                        <Icon.Upload />
                      </div>
                      <p className="text-sm font-medium text-mist-700">Click o arrastra para subir</p>
                      <p className="text-xs text-mist-400 mt-1">PNG, JPG hasta 5MB</p>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <GlassInput
                        label="Nombre del Workspace"
                        value={general.workspaceName}
                        onChange={(e) => setGeneral({ ...general, workspaceName: e.target.value })}
                      />
                      <div>
                        <label className="block text-sm font-semibold text-mist-500 mb-2 ml-1">URL del Workspace</label>
                        <div className="flex">
                          <span className="px-4 py-3 bg-mist-100 border border-mist-200 border-r-0 rounded-l-xl text-mist-500 text-sm flex items-center">
                            boom.lab/
                          </span>
                          <input
                            type="text"
                            value="hq"
                            readOnly
                            className="flex-1 px-4 py-3 bg-white/50 border border-mist-200 rounded-r-xl text-sm text-mist-700 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-mist-500 mb-2 ml-1">Zona Horaria</label>
                        <select
                          value={general.timezone}
                          onChange={(e) => setGeneral({ ...general, timezone: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-petal-100/80 text-sm font-body text-mist-700 outline-none focus:ring-2 focus:ring-petal-300 focus:border-petal-400 transition-all appearance-none"
                        >
                          <option value="America/Bogota">(GMT-05:00) Bogotá, Lima, Quito</option>
                          <option value="America/Mexico_City">(GMT-06:00) Ciudad de México</option>
                          <option value="America/New_York">(GMT-05:00) Nueva York</option>
                          <option value="Europe/Madrid">(GMT+01:00) Madrid</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-mist-500 mb-2 ml-1">Idioma</label>
                        <select
                          value={general.language}
                          onChange={(e) => setGeneral({ ...general, language: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-petal-100/80 text-sm font-body text-mist-700 outline-none focus:ring-2 focus:ring-petal-300 focus:border-petal-400 transition-all appearance-none"
                        >
                          <option value="es">Español</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <GlassCard padding="large">
                <div className="flex items-center gap-3 mb-6">
                  <Icon.Notifications />
                  <h2 className="font-display text-2xl text-mist-800">Notificaciones</h2>
                </div>

                <div className="space-y-4 max-w-2xl">
                  <Toggle
                    label="Notificaciones Push en Desktop"
                    description="Recibe alertas en tiempo real en tu navegador"
                    checked={notifications.desktopPush}
                    onChange={() => setNotifications({ ...notifications, desktopPush: !notifications.desktopPush })}
                  />
                  <Toggle
                    label="Resumen por Email"
                    description="Recibe resúmenes semanales de tu actividad"
                    checked={notifications.emailDigest}
                    onChange={() => setNotifications({ ...notifications, emailDigest: !notifications.emailDigest })}
                  />
                  <Toggle
                    label="Actividad de Slack"
                    description="Notifica a los canales de Slack conectados"
                    checked={notifications.slackActivity}
                    onChange={() => setNotifications({ ...notifications, slackActivity: !notifications.slackActivity })}
                  />
                  <div className="pt-4 border-t border-mist-100">
                    <h4 className="font-semibold text-mist-700 mb-4">Notificaciones por Email</h4>
                    <div className="space-y-3 ml-4">
                      <Toggle
                        label="Nuevo proyecto creado"
                        checked={notifications.newProject}
                        onChange={() => setNotifications({ ...notifications, newProject: !notifications.newProject })}
                      />
                      <Toggle
                        label="Tarea asignada"
                        checked={notifications.taskAssigned}
                        onChange={() => setNotifications({ ...notifications, taskAssigned: !notifications.taskAssigned })}
                      />
                      <Toggle
                        label="Feedback recibido"
                        checked={notifications.feedbackReceived}
                        onChange={() => setNotifications({ ...notifications, feedbackReceived: !notifications.feedbackReceived })}
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Appearance Section */}
            {activeSection === 'appearance' && (
              <GlassCard padding="large">
                <div className="flex items-center gap-3 mb-6">
                  <Icon.Palette />
                  <h2 className="font-display text-2xl text-mist-800">Apariencia</h2>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-semibold text-mist-500 mb-4">Tema de la Interfaz</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {['light', 'dark', 'auto'].map((theme) => (
                        <label
                          key={theme}
                          className={`cursor-pointer relative ${appearance.theme === theme ? 'ring-2 ring-petal-400 rounded-2xl' : ''}`}
                        >
                          <input
                            type="radio"
                            name="theme"
                            value={theme}
                            checked={appearance.theme === theme}
                            onChange={() => setAppearance({ ...appearance, theme })}
                            className="sr-only"
                          />
                          <div className={`h-24 rounded-2xl border-2 transition-all overflow-hidden ${
                            appearance.theme === theme ? 'border-petal-400' : 'border-mist-200'
                          }`}>
                            {theme === 'light' && (
                              <div className="h-full bg-white flex flex-col">
                                <div className="h-6 bg-mist-50 border-b border-mist-100 flex items-center px-2 gap-1">
                                  <div className="w-2 h-2 rounded-full bg-red-400/40" />
                                  <div className="w-2 h-2 rounded-full bg-petal-400/40" />
                                  <div className="w-2 h-2 rounded-full bg-emerald-400/40" />
                                </div>
                                <div className="flex-1 p-3">
                                  <div className="w-full h-2 bg-mist-100 mb-2 rounded" />
                                  <div className="w-3/4 h-2 bg-mist-100 rounded" />
                                </div>
                              </div>
                            )}
                            {theme === 'dark' && (
                              <div className="h-full bg-mist-800 flex flex-col">
                                <div className="h-6 bg-mist-700 border-b border-mist-600 flex items-center px-2 gap-1">
                                  <div className="w-2 h-2 rounded-full bg-red-400/40" />
                                  <div className="w-2 h-2 rounded-full bg-petal-400/40" />
                                  <div className="w-2 h-2 rounded-full bg-emerald-400/40" />
                                </div>
                                <div className="flex-1 p-3">
                                  <div className="w-full h-2 bg-mist-600/50 mb-2 rounded" />
                                  <div className="w-3/4 h-2 bg-mist-600/50 rounded" />
                                </div>
                              </div>
                            )}
                            {theme === 'auto' && (
                              <div className="h-full bg-white flex flex-col relative overflow-hidden">
                                <div className="absolute inset-0 bg-mist-800" style={{ clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)' }} />
                                <div className="h-6 bg-mist-50/80 border-b border-mist-100/50 flex items-center px-2 gap-1 z-10">
                                  <div className="w-2 h-2 rounded-full bg-red-400/40" />
                                  <div className="w-2 h-2 rounded-full bg-petal-400/40" />
                                  <div className="w-2 h-2 rounded-full bg-emerald-400/40" />
                                </div>
                                <div className="flex-1 p-3 z-10">
                                  <div className="w-full h-2 bg-mist-100/60 mb-2 rounded" />
                                  <div className="w-3/4 h-2 bg-mist-100/60 rounded" />
                                </div>
                              </div>
                            )}
                          </div>
                          <p className="text-center text-sm font-semibold mt-2 capitalize">
                            {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Oscuro' : 'Auto'}
                          </p>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-mist-500 mb-4">Color de Acento</label>
                    <div className="flex gap-4 flex-wrap">
                      {[
                        { id: 'petal', gradient: 'from-petal-400 to-blush-500' },
                        { id: 'lavender', gradient: 'from-lavender-400 to-mauve-500' },
                        { id: 'sky', gradient: 'from-sky-400 to-cyan-500' },
                        { id: 'emerald', gradient: 'from-emerald-400 to-teal-500' },
                      ].map((color) => (
                        <button
                          key={color.id}
                          onClick={() => setAppearance({ ...appearance, accentColor: color.id })}
                          className={`w-12 h-12 rounded-full bg-gradient-to-tr ${color.gradient} shadow-lg transition-transform hover:scale-110 active:scale-95 ${
                            appearance.accentColor === color.id ? 'ring-4 ring-offset-2 ring-petal-200' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Integrations Section */}
            {activeSection === 'integrations' && (
              <GlassCard padding="large">
                <div className="flex items-center gap-3 mb-6">
                  <Icon.Hub />
                  <h2 className="font-display text-2xl text-mist-800">Integraciones</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Slack Integration */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                      </svg>
                      <h3 className="font-semibold text-lg text-mist-700">Slack Webhook</h3>
                    </div>
                    <p className="text-sm text-mist-400">
                      Envía actualizaciones de BoomLab directamente a un canal de Slack.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="https://hooks.slack.com/services/..."
                        value={integrations.slackWebhook}
                        onChange={(e) => setIntegrations({ ...integrations, slackWebhook: e.target.value })}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/50 border border-petal-100/80 text-sm font-mono text-mist-700 outline-none focus:ring-2 focus:ring-petal-300"
                      />
                      <GlassButton variant="secondary">
                        Conectar
                      </GlassButton>
                    </div>
                  </div>

                  {/* API Key */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Icon.Key />
                      <h3 className="font-semibold text-lg text-mist-700">Acceso API</h3>
                    </div>
                    <p className="text-sm text-mist-400">
                      Usa esta clave para acceder a la API de BoomLab desde aplicaciones externas.
                    </p>
                    <div className="bg-white/40 border border-petal-100/80 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-mist-400 mb-1">API_KEY_PROD</p>
                        <p className="font-mono text-sm text-mist-700">{integrations.apiKey}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={copyApiKey}
                          className="p-2 text-mist-400 hover:text-petal-500 transition-colors"
                          title="Copiar"
                        >
                          <Icon.Copy />
                        </button>
                      </div>
                    </div>
                    <GlassButton variant="secondary" icon={<Icon.Add />}>
                      Generar Nueva Clave
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
