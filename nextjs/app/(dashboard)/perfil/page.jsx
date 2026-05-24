'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import api from '@/lib/apiClient';
import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import GlassInput from '@/components/ui/GlassInput';

// Icons
const Icon = {
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Cloud: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
    </svg>
  ),
  Projects: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Tasks: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  Activity: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
};

export default function Perfil() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    bio: '',
  });
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        telefono: user.telefono || '',
        bio: user.bio || 'Sin descripción aún.',
      });
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      // TODO: Add API endpoint for updating profile
      // await api.put('/api/auth/me', formData);
      setMessage('Perfil actualizado exitosamente');
      setIsEditing(false);
    } catch (err) {
      setMessage(err.message || 'Error al actualizar perfil');
    }
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
  };

  const activities = [
    { icon: <Icon.Edit />, text: 'Actualizó perfil', time: 'Hace 2 horas', color: 'petal' },
    { icon: <Icon.Check />, text: 'Tarea finalizada: Landing UI', time: 'Ayer, 4:30 PM', color: 'blush' },
    { icon: <Icon.Cloud />, text: 'Deploy a producción', time: 'Oct 12, 2023', color: 'lavender' },
  ];

  const getRoleLabel = (rol) => {
    const labels = {
      admin: 'Administrador',
      empleado: 'Empleado',
      cliente: 'Cliente',
    };
    return labels[rol] || rol;
  };

  const getRoleColor = (rol) => {
    const colors = {
      admin: 'from-lavender-400 to-mauve-500',
      empleado: 'from-sky-400 to-cyan-500',
      cliente: 'from-amber-400 to-orange-500',
    };
    return colors[rol] || 'from-petal-400 to-blush-500';
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Profile Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="relative">
            <div className={`w-[120px] h-[120px] p-1 rounded-full bg-gradient-to-tr ${getRoleColor(user.rol)}`}>
              <div className="w-full h-full rounded-full border-4 border-white overflow-hidden shadow-xl bg-white">
                <div className={`w-full h-full bg-gradient-to-br ${getRoleColor(user.rol)} flex items-center justify-center text-white text-4xl font-bold`}>
                  {user.nombre.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h1 className="font-display text-4xl text-mist-800 mb-2">{user.nombre}</h1>
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${getRoleColor(user.rol)}`}>
              {getRoleLabel(user.rol)}
            </span>
          </div>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Stats & Activity */}
          <div className="lg:col-span-4 space-y-6">
            {/* Personal Stats */}
            <div className="grid grid-cols-1 gap-4">
              <GlassCard className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-mist-500 uppercase tracking-widest">Proyectos</p>
                  <p className="font-display text-2xl text-petal-500">12</p>
                </div>
                <span className="text-petal-500"><Icon.Projects /></span>
              </GlassCard>
              <GlassCard className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-mist-500 uppercase tracking-widest">Tareas Completadas</p>
                  <p className="font-display text-2xl text-blush-500">148</p>
                </div>
                <span className="text-blush-500"><Icon.Tasks /></span>
              </GlassCard>
              <GlassCard className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-mist-500 uppercase tracking-widest">Actividad</p>
                  <p className="font-display text-2xl text-lavender-500">94%</p>
                </div>
                <span className="text-lavender-500"><Icon.Activity /></span>
              </GlassCard>
            </div>

            {/* Recent Activity Feed */}
            <GlassCard padding="large">
              <h3 className="font-display text-xl text-mist-800 mb-6">Actividad Reciente</h3>
              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-mist-200">
                {activities.map((activity, i) => (
                  <div key={i} className="relative flex gap-4 items-start pl-8">
                    <span className={`absolute left-0 w-[24px] h-[24px] bg-white rounded-full border-2 flex items-center justify-center z-10 ${
                      activity.color === 'petal' ? 'border-petal-400 text-petal-500' :
                      activity.color === 'blush' ? 'border-blush-400 text-blush-500' :
                      'border-lavender-400 text-lavender-500'
                    }`}>
                      {activity.icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-mist-800">{activity.text}</p>
                      <p className="text-xs text-mist-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Profile & Security */}
          <div className="lg:col-span-8 space-y-6">
            {/* Profile Information Form */}
            <GlassCard padding="large">
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-6 h-6 text-petal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="font-display text-2xl text-mist-800">Información de Perfil</h3>
              </div>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassInput
                    label="Nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    disabled={!isEditing}
                  />
                  <GlassInput
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <GlassInput
                  label="Teléfono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  disabled={!isEditing}
                />
                <GlassInput
                  label="Bio"
                  multiline
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                />
                <div className="flex gap-3 pt-2">
                  {!isEditing ? (
                    <GlassButton 
                      type="button" 
                      variant="primary" 
                      onClick={() => setIsEditing(true)}
                    >
                      Editar Perfil
                    </GlassButton>
                  ) : (
                    <>
                      <GlassButton type="submit" variant="primary">
                        Guardar Cambios
                      </GlassButton>
                      <GlassButton 
                        type="button" 
                        variant="secondary" 
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            nombre: user.nombre || '',
                            email: user.email || '',
                            telefono: user.telefono || '',
                            bio: user.bio || 'Sin descripción aún.',
                          });
                        }}
                      >
                        Cancelar
                      </GlassButton>
                    </>
                  )}
                </div>
              </form>
            </GlassCard>

            {/* Security Section */}
            <GlassCard padding="large">
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-6 h-6 text-blush-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="font-display text-2xl text-mist-800">Seguridad</h3>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-mist-500 mb-2 ml-1">Contraseña Actual</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-petal-100/80 text-sm font-body text-mist-700 placeholder:text-mist-300 outline-none focus:ring-2 focus:ring-petal-300 focus:border-petal-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-mist-500 mb-2 ml-1">Nueva Contraseña</label>
                    <input
                      type="password"
                      placeholder="Nueva"
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-petal-100/80 text-sm font-body text-mist-700 placeholder:text-mist-300 outline-none focus:ring-2 focus:ring-petal-300 focus:border-petal-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-mist-500 mb-2 ml-1">Confirmar</label>
                    <input
                      type="password"
                      placeholder="Confirmar"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-petal-100/80 text-sm font-body text-mist-700 placeholder:text-mist-300 outline-none focus:ring-2 focus:ring-petal-300 focus:border-petal-400 transition-all"
                    />
                  </div>
                </div>
                <GlassButton type="submit" variant="primary">
                  Cambiar Contraseña
                </GlassButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
