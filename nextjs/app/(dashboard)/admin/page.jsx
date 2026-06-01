'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import api from '@/lib/apiClient';
import GlassCard from '@/components/ui/GlassCard';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import GlassButton from '@/components/ui/GlassButton';

// Icons
const Icon = {
  Projects: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Active: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Completed: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Tasks: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Rocket: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  ),
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    tasks: 0,
  });
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'empleado' });
  const [projForm, setProjForm] = useState({ titulo: '', id_cliente: '' });
  const [instagram, setInstagram] = useState({ profile: null, posts: [], loading: false });

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load users for admin and reference
      let usersRes = [];
      if (user?.rol === 'admin') {
        usersRes = await api.get('/api/auth/users');
      }
      setUsers(usersRes);
      
      // Load projects based on role
      let projectsRes = [];
      if (user?.rol === 'admin') {
        projectsRes = await api.get('/api/proyectos');
      } else if (user?.rol === 'cliente') {
        // Client sees only their projects
        const allProjects = await api.get('/api/proyectos');
        projectsRes = allProjects.filter(p => p.id_cliente === user.id_usuario);
      } else if (user?.rol === 'empleado') {
        // Employee sees assigned projects
        try {
          const assignments = await api.get('/api/asignaciones');
          const assignedProjectIds = assignments
            .filter(a => a.id_empleado === user.id_usuario)
            .map(a => a.id_proyecto);
          const allProjects = await api.get('/api/proyectos');
          projectsRes = allProjects.filter(p => assignedProjectIds.includes(p.id));
        } catch {
          // If assignments endpoint fails, show empty
          projectsRes = [];
        }
      }
      setProjects(projectsRes);
      
      // Calculate stats
      const total = projectsRes.length;
      const active = projectsRes.filter(p => p.estado === 'en_proceso').length;
      const completed = projectsRes.filter(p => p.estado === 'completado').length;
      setStats({
        total,
        active,
        completed,
        tasks: total * 4, // Estimate
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/api/auth/register', form);
      setMessage('Usuario creado exitosamente');
      setForm({ nombre: '', email: '', password: '', rol: 'empleado' });
      loadData();
    } catch (err) {
      setMessage(err.message || 'Error al crear usuario');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/api/proyectos', projForm);
      setMessage('Proyecto creado exitosamente');
      setProjForm({ titulo: '', id_cliente: '' });
      loadData();
    } catch (err) {
      setMessage(err.message || 'Error al crear proyecto');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('¿Eliminar este proyecto?')) return;
    try {
      await api.delete(`/api/proyectos/${id}`);
      loadData();
    } catch (err) {
      setMessage(err.message || 'Error al eliminar');
    }
  };

  const loadInstagramData = async () => {
    if (instagram.posts.length > 0) return;
    setInstagram({ ...instagram, loading: true });
    try {
      const data = await api.get('/api/instagram/posts');
      setInstagram({ profile: data.profile, posts: data.posts, loading: false });
    } catch {
      setInstagram({ profile: null, posts: [], loading: false });
    }
  };

  useEffect(() => {
    if (activeTab === 'instagram') loadInstagramData();
  }, [activeTab]);

  const clientes = users.filter((u) => u.rol === 'cliente');
  const empleados = users.filter((u) => u.rol === 'empleado');
  
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
    .slice(0, 5);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading || !user) return null;

  const isAdmin = user.rol === 'admin';

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <h1 className="font-display text-4xl text-mist-800 mb-2">
              ¡Hola, {user.nombre.split(' ')[0]}! 👋
            </h1>
            <p className="text-mist-500 font-body">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — 
              {stats.active > 0 ? `Tienes ${stats.active} proyectos activos` : 'Sin proyectos activos'}
            </p>
          </div>
          <div className="flex gap-3">
            {isAdmin && (
              <GlassButton variant="secondary" icon={<Icon.Plus />} onClick={() => setActiveTab('users')}>
                Nuevo Usuario
              </GlassButton>
            )}
            <GlassButton variant="primary" icon={<Icon.Rocket />} onClick={() => isAdmin ? setActiveTab('projects') : router.push('/proyectos')}>
              Nuevo Proyecto
            </GlassButton>
          </div>
        </header>

        {/* Message */}
        {message && (
          <div className="mb-6 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 rounded-2xl p-4 text-emerald-600 text-sm font-body text-center">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white/70 backdrop-blur-sm rounded-2xl p-1.5 border border-petal-100/80 shadow-soft overflow-x-auto">
          <button 
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold font-body transition-all whitespace-nowrap ${
              activeTab === 'overview' 
                ? 'bg-gradient-to-r from-petal-400 to-blush-500 text-white shadow-soft-md' 
                : 'text-mist-400 hover:bg-petal-50'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Vista General
          </button>
          {isAdmin && (
            <>
              <button 
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold font-body transition-all whitespace-nowrap ${
                  activeTab === 'users' 
                    ? 'bg-gradient-to-r from-petal-400 to-blush-500 text-white shadow-soft-md' 
                    : 'text-mist-400 hover:bg-petal-50'
                }`}
                onClick={() => setActiveTab('users')}
              >
                Usuarios
              </button>
              <button 
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold font-body transition-all whitespace-nowrap ${
                  activeTab === 'projects' 
                    ? 'bg-gradient-to-r from-petal-400 to-blush-500 text-white shadow-soft-md' 
                    : 'text-mist-400 hover:bg-petal-50'
                }`}
                onClick={() => setActiveTab('projects')}
              >
                Proyectos
              </button>
            </>
          )}
          <button 
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold font-body transition-all whitespace-nowrap ${
              activeTab === 'instagram' 
                ? 'bg-gradient-to-r from-petal-400 to-blush-500 text-white shadow-soft-md' 
                : 'text-mist-400 hover:bg-petal-50'
            }`}
            onClick={() => setActiveTab('instagram')}
          >
            Instagram
          </button>
        </div>

        {/* Vista General Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatCard 
                label="Total Proyectos" 
                value={stats.total} 
                icon={<Icon.Projects />}
                trend="12%"
                trendUp={true}
                color="primary"
              />
              <StatCard 
                label="Activos" 
                value={stats.active} 
                icon={<Icon.Active />}
                trend="5%"
                trendUp={true}
                color="secondary"
              />
              <StatCard 
                label="Completados" 
                value={stats.completed} 
                icon={<Icon.Completed />}
                trend="18%"
                trendUp={true}
                color="success"
              />
              <StatCard 
                label="Tareas Pendientes" 
                value={stats.tasks} 
                icon={<Icon.Tasks />}
                trend="2%"
                trendUp={false}
                color="warning"
              />
            </section>

            {/* Empty State for non-admins without projects */}
            {stats.total === 0 && !isAdmin && (
              <div className="glass-card border-l-4 border-l-petal-400 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-petal-100 rounded-full flex items-center justify-center text-petal-500 shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-display text-xl text-mist-800">Sin Proyectos Asignados</h4>
                    <p className="text-mist-500">
                      {user.rol === 'cliente' 
                        ? 'Aún no tienes proyectos. Contacta al administrador para crear uno.' 
                        : 'No tienes proyectos asignados. Contacta al administrador.'}
                    </p>
                  </div>
                </div>
                {user.rol === 'cliente' && (
                  <button 
                    onClick={() => router.push('/proyectos')}
                    className="text-petal-500 font-bold hover:underline px-4 py-2"
                  >
                    Solicitar Proyecto
                  </button>
                )}
              </div>
            )}

            {/* Alert Section - Admin only */}
            {isAdmin && stats.active === 0 && stats.total > 0 && (
              <div className="glass-card border-l-4 border-l-petal-400 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-petal-100 rounded-full flex items-center justify-center text-petal-500 shrink-0 animate-pulse">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-display text-xl text-mist-800">Atención Requerida</h4>
                    <p className="text-mist-500">Hay proyectos pendientes que necesitan iniciarse.</p>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/proyectos')}
                  className="text-petal-500 font-bold hover:underline px-4 py-2"
                >
                  Ver Proyectos
                </button>
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Performance Chart */}
              <div className="lg:col-span-2">
                <GlassCard padding="large">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-display text-2xl text-mist-800">Rendimiento Semanal</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-petal-400"></span>
                      <span className="text-sm text-mist-500">Progreso de Tareas</span>
                    </div>
                  </div>
                  <div className="h-[250px] flex items-end justify-between gap-3">
                    {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map((day, i) => {
                      const heights = [65, 85, 45, 95, 70, 30, 20];
                      return (
                        <div key={day} className="flex flex-col items-center gap-3 flex-1">
                          <div className="w-full bg-petal-100/30 rounded-full relative h-48">
                            <div 
                              className="absolute bottom-0 w-full bg-gradient-to-t from-petal-400 to-petal-500 rounded-full transition-all duration-500"
                              style={{ height: `${heights[i]}%` }}
                            />
                          </div>
                          <span className="text-xs text-mist-500">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              </div>

              {/* Recent Projects */}
              <div>
                <GlassCard padding="large" className="h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-display text-xl text-mist-800">Proyectos Recientes</h3>
                    <button 
                      onClick={() => router.push('/proyectos')}
                      className="p-2 hover:bg-petal-50 rounded-full text-petal-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-col gap-4">
                    {recentProjects.length > 0 ? (
                      recentProjects.map((p) => (
                        <div 
                          key={p.id_proyecto} 
                          className="flex items-center gap-4 group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-white/50 transition-colors"
                          onClick={() => router.push('/proyectos')}
                        >
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-petal-400 to-blush-500 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md">
                            {p.titulo.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-mist-800 truncate group-hover:text-petal-500 transition-colors">
                              {p.titulo}
                            </h4>
                            <p className="text-xs text-mist-500">{p.nombre_cliente}</p>
                          </div>
                          <StatusBadge status={p.estado || 'pendiente'} />
                        </div>
                      ))
                    ) : (
                      <p className="text-mist-400 text-center py-8">No hay proyectos aún</p>
                    )}
                  </div>
                  <button 
                    onClick={() => router.push('/proyectos')}
                    className="mt-6 pt-4 border-t border-petal-100 text-petal-500 text-center hover:underline w-full text-sm font-semibold"
                  >
                    Ver todos los proyectos
                  </button>
                </GlassCard>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab (Admin Only) */}
        {activeTab === 'users' && isAdmin && (
          <div className="space-y-6">
            <GlassCard padding="large">
              <h3 className="font-display text-xl text-mist-800 mb-6">Crear Usuario</h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-mist-500 mb-2">Nombre</label>
                    <input 
                      placeholder="Nombre completo" 
                      value={form.nombre} 
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })} 
                      required 
                      className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-petal-100/80 text-sm font-body text-mist-700 placeholder:text-mist-300 outline-none focus:ring-2 focus:ring-petal-300 focus:border-petal-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-mist-500 mb-2">Email</label>
                    <input 
                      type="email" 
                      placeholder="Email" 
                      value={form.email} 
                      onChange={(e) => setForm({ ...form, email: e.target.value })} 
                      required 
                      className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-petal-100/80 text-sm font-body text-mist-700 placeholder:text-mist-300 outline-none focus:ring-2 focus:ring-petal-300 focus:border-petal-400 transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-mist-500 mb-2">Contraseña</label>
                    <input 
                      type="password" 
                      placeholder="Contraseña" 
                      value={form.password} 
                      onChange={(e) => setForm({ ...form, password: e.target.value })} 
                      required 
                      className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-petal-100/80 text-sm font-body text-mist-700 placeholder:text-mist-300 outline-none focus:ring-2 focus:ring-petal-300 focus:border-petal-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-mist-500 mb-2">Rol</label>
                    <select 
                      value={form.rol} 
                      onChange={(e) => setForm({ ...form, rol: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-petal-100/80 text-sm font-body text-mist-700 outline-none focus:ring-2 focus:ring-petal-300 focus:border-petal-400 transition-all"
                    >
                      <option value="empleado">Empleado</option>
                      <option value="cliente">Cliente</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <GlassButton type="submit" variant="primary" className="mt-4">
                  Crear Usuario
                </GlassButton>
              </form>
            </GlassCard>

            <GlassCard padding="large">
              <h3 className="font-display text-xl text-mist-800 mb-6">Lista de Usuarios ({users.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-mist-200">
                      <th className="text-left text-xs font-semibold text-mist-500 pb-3">Nombre</th>
                      <th className="text-left text-xs font-semibold text-mist-500 pb-3">Email</th>
                      <th className="text-left text-xs font-semibold text-mist-500 pb-3">Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id_usuario} className="border-b border-mist-100 hover:bg-white/30 transition-colors">
                        <td className="py-3 text-sm text-mist-700">{u.nombre}</td>
                        <td className="py-3 text-sm text-mist-700">{u.email}</td>
                        <td className="py-3">
                          <StatusBadge status={u.rol === 'admin' ? 'completado' : u.rol === 'empleado' ? 'en_proceso' : 'pendiente'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Instagram Tab */}
        {activeTab === 'instagram' && (
          <div className="space-y-6">
            {instagram.loading ? (
              <div className="text-center py-16 text-mist-500 font-body">Cargando Instagram...</div>
            ) : !instagram.profile ? (
              <GlassCard padding="large" className="text-center">
                <div className="text-5xl mb-4">
                  <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#7d7599" strokeWidth="1.5" className="mx-auto">
                    <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/>
                  </svg>
                </div>
                <h3 className="font-display text-2xl text-mist-800 mb-2">Instagram</h3>
                <p className="text-mist-500 mb-6">No se pudieron cargar las publicaciones de Instagram.</p>
                <a href="https://www.instagram.com/boomlabpublicity1/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-petal-400 to-blush-500 text-white font-bold hover:shadow-lg transition-shadow no-underline">Abrir Instagram →</a>
              </GlassCard>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <img src={instagram.profile.profilePicUrl} alt={instagram.profile.username} className="w-16 h-16 rounded-full object-cover border-2 border-white/40" />
                  <div className="flex-1">
                    <h3 className="font-display text-2xl text-mist-800 mb-1">{instagram.profile.fullName}</h3>
                    <p className="text-mist-500 text-sm font-body">@{instagram.profile.username} · {instagram.profile.followers} seguidores</p>
                  </div>
                  <a href="https://www.instagram.com/boomlabpublicity1/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-petal-100/80 bg-white/50 text-mist-700 font-bold hover:bg-white/80 transition-colors no-underline text-sm">Seguir en Instagram →</a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {instagram.posts.map((p) => (
                    <div key={p.shortcode} className="glass-card rounded-2xl overflow-hidden shadow-soft">
                      <div className="relative pb-[100%] bg-mist-100">
                        <img src={p.displayUrl} alt={p.caption?.substring(0, 100) || ''} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                        {p.isVideo && <span className="absolute top-3 right-3 bg-black/60 text-white rounded-lg px-2 py-1 text-xs">▶ Video</span>}
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-mist-700 font-body mb-3 line-clamp-2">{p.caption || 'Sin descripción'}</p>
                        <div className="flex items-center gap-4 text-xs text-mist-500 font-body">
                          <span>❤️ {p.likes}</span>
                          <span>💬 {p.comments}</span>
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-petal-500 font-bold no-underline hover:underline">Ver en IG</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Projects Tab (Admin Only) */}
        {activeTab === 'projects' && isAdmin && (
          <div className="space-y-6">
            <GlassCard padding="large">
              <h3 className="font-display text-xl text-mist-800 mb-6">Crear Proyecto</h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-mist-500 mb-2">Título del proyecto</label>
                  <input 
                    placeholder="Título del proyecto" 
                    value={projForm.titulo} 
                    onChange={(e) => setProjForm({ ...projForm, titulo: e.target.value })} 
                    required 
                    className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-petal-100/80 text-sm font-body text-mist-700 placeholder:text-mist-300 outline-none focus:ring-2 focus:ring-petal-300 focus:border-petal-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-mist-500 mb-2">Cliente</label>
                  <select 
                    value={projForm.id_cliente} 
                    onChange={(e) => setProjForm({ ...projForm, id_cliente: e.target.value })} 
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-white/50 border border-petal-100/80 text-sm font-body text-mist-700 outline-none focus:ring-2 focus:ring-petal-300 focus:border-petal-400 transition-all"
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id_usuario} value={c.id_usuario}>{c.nombre} ({c.email})</option>
                    ))}
                  </select>
                </div>
                <GlassButton type="submit" variant="primary">
                  Crear Proyecto
                </GlassButton>
              </form>
            </GlassCard>

            <GlassCard padding="large">
              <h3 className="font-display text-xl text-mist-800 mb-6">Proyectos ({projects.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-mist-200">
                      <th className="text-left text-xs font-semibold text-mist-500 pb-3">Título</th>
                      <th className="text-left text-xs font-semibold text-mist-500 pb-3">Cliente</th>
                      <th className="text-left text-xs font-semibold text-mist-500 pb-3">Estado</th>
                      <th className="text-left text-xs font-semibold text-mist-500 pb-3">Creado</th>
                      <th className="text-left text-xs font-semibold text-mist-500 pb-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => (
                      <tr key={p.id_proyecto} className="border-b border-mist-100 hover:bg-white/30 transition-colors">
                        <td className="py-3 text-sm text-mist-700">{p.titulo}</td>
                        <td className="py-3 text-sm text-mist-700">{p.nombre_cliente}</td>
                        <td className="py-3"><StatusBadge status={p.estado || 'pendiente'} /></td>
                        <td className="py-3 text-sm text-mist-700">{formatDate(p.fecha_creacion)}</td>
                        <td className="py-3">
                          <button 
                            onClick={() => handleDeleteProject(p.id_proyecto)} 
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
