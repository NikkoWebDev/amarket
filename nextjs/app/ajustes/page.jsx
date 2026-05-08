'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import api from '@/lib/apiClient';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';
import Toggle from '@/components/ui/Toggle';

// Icons
const Icon = {
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  Key: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5"/>
      <path d="m21 2-9.4 9.4"/>
      <path d="m15.5 7.5 3 3L22 7l-3-3-1.5 1.5"/>
    </svg>
  ),
  Save: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  ),
};

export default function Ajustes() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('profile');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Profile settings
  const [profile, setProfile] = useState({
    nombre: '',
    email: '',
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  // Web notifications only
  const [webNotifications, setWebNotifications] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setProfile({
        nombre: user.nombre || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');
    try {
      // TODO: Add API endpoint for updating profile
      // await api.put('/api/auth/me', profile);
      setMessage('Perfil actualizado exitosamente');
    } catch (err) {
      setMessage(err.message || 'Error al actualizar perfil');
    }
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    if (passwordData.new !== passwordData.confirm) {
      setMessage('Las contraseñas no coinciden');
      return;
    }
    try {
      // TODO: Add API endpoint for changing password
      // await api.post('/api/auth/change-password', passwordData);
      setMessage('Contraseña actualizada exitosamente');
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (err) {
      setMessage(err.message || 'Error al cambiar contraseña');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <h1 className="font-display text-4xl text-mist-800 mb-2">Ajustes</h1>
          <p className="text-mist-500 font-body">Gestiona tu cuenta y preferencias.</p>
        </header>

        {/* Message */}
        {message && (
          <div className={`mb-6 backdrop-blur-sm border rounded-2xl p-4 text-sm font-body text-center ${
            message.includes('Error') || message.includes('no coinciden')
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
                <button
                  onClick={() => setActiveSection('profile')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    activeSection === 'profile'
                      ? 'bg-petal-100 text-petal-600 font-semibold'
                      : 'text-mist-500 hover:bg-petal-50'
                  }`}
                >
                  <Icon.User />
                  <span className="text-sm">Perfil</span>
                </button>
                <button
                  onClick={() => setActiveSection('notifications')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    activeSection === 'notifications'
                      ? 'bg-petal-100 text-petal-600 font-semibold'
                      : 'text-mist-500 hover:bg-petal-50'
                  }`}
                >
                  <Icon.Bell />
                  <span className="text-sm">Notificaciones</span>
                </button>
                <button
                  onClick={() => setActiveSection('security')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                    activeSection === 'security'
                      ? 'bg-petal-100 text-petal-600 font-semibold'
                      : 'text-mist-500 hover:bg-petal-50'
                  }`}
                >
                  <Icon.Key />
                  <span className="text-sm">Seguridad</span>
                </button>
              </nav>
            </GlassCard>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <GlassCard padding="large">
                <div className="flex items-center gap-3 mb-6">
                  <Icon.User />
                  <h2 className="font-display text-2xl text-mist-800">Información de Perfil</h2>
                </div>
                
                <div className="space-y-4 max-w-md">
                  <GlassInput
                    label="Nombre"
                    value={profile.nombre}
                    onChange={(e) => setProfile({ ...profile, nombre: e.target.value })}
                  />
                  <GlassInput
                    label="Email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled
                  />
                  <div className="pt-4">
                    <GlassButton 
                      onClick={handleSaveProfile}
                      disabled={saving}
                      icon={<Icon.Save />}
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Notifications Section - Web Only */}
            {activeSection === 'notifications' && (
              <GlassCard padding="large">
                <div className="flex items-center gap-3 mb-6">
                  <Icon.Bell />
                  <h2 className="font-display text-2xl text-mist-800">Notificaciones Web</h2>
                </div>

                <div className="max-w-md">
                  <Toggle
                    label="Notificaciones en el navegador"
                    description="Recibe alertas en tiempo real mientras usas la aplicación"
                    checked={webNotifications}
                    onChange={() => setWebNotifications(!webNotifications)}
                  />
                </div>
              </GlassCard>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <GlassCard padding="large">
                <div className="flex items-center gap-3 mb-6">
                  <Icon.Key />
                  <h2 className="font-display text-2xl text-mist-800">Cambiar Contraseña</h2>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-semibold text-mist-500 mb-2 ml-1">Contraseña Actual</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-petal-100/80 text-sm font-body text-mist-700 placeholder:text-mist-300 outline-none focus:ring-2 focus:ring-petal-300 focus:border-petal-400 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-mist-500 mb-2 ml-1">Nueva Contraseña</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-petal-100/80 text-sm font-body text-mist-700 placeholder:text-mist-300 outline-none focus:ring-2 focus:ring-petal-300 focus:border-petal-400 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-mist-500 mb-2 ml-1">Confirmar Contraseña</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-petal-100/80 text-sm font-body text-mist-700 placeholder:text-mist-300 outline-none focus:ring-2 focus:ring-petal-300 focus:border-petal-400 transition-all"
                      required
                    />
                  </div>
                  <div className="pt-4">
                    <GlassButton type="submit" variant="primary">
                      Actualizar Contraseña
                    </GlassButton>
                  </div>
                </form>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
