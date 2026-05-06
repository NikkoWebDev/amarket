'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import api from '@/lib/apiClient';

export default function AdminDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'empleado' });
  const [projForm, setProjForm] = useState({ titulo: '', id_cliente: '' });
  const [assignForm, setAssignForm] = useState({ id_proyecto: '', id_empleado: '' });
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState('users');

  useEffect(() => {
    if (!loading && (!user || user.rol !== 'admin')) {
      router.replace('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.rol === 'admin') {
      loadUsers();
      loadProjects();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      const res = await api.get('/api/auth/users');
      setUsers(res);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await api.get('/api/proyectos');
      setProjects(res);
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
      loadUsers();
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
      loadProjects();
    } catch (err) {
      setMessage(err.message || 'Error al crear proyecto');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/api/asignaciones', assignForm);
      setMessage('Empleado asignado exitosamente');
      setAssignForm({ id_proyecto: '', id_empleado: '' });
      loadProjects();
    } catch (err) {
      setMessage(err.message || 'Error al asignar');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('¿Eliminar este proyecto?')) return;
    try {
      await api.delete(`/api/proyectos/${id}`);
      loadProjects();
    } catch (err) {
      setMessage(err.message || 'Error al eliminar');
    }
  };

  const clientes = users.filter((u) => u.rol === 'cliente');
  const empleados = users.filter((u) => u.rol === 'empleado');

  if (loading || !user) return null;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-mist-800 mb-2">Panel de Administrador</h1>
          <p className="text-sm text-mist-400 font-body">Gestión de usuarios, proyectos y asignaciones</p>
        </div>

      {message && (
        <div className="mb-6 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-600 text-sm font-body text-center">
          {message}
        </div>
      )}

      <div className="flex gap-2 mb-6 bg-white/70 backdrop-blur-sm rounded-2xl p-1 border border-petal-100/80 shadow-soft">
        <button 
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold font-body transition-all ${
            tab === 'users' ? 'bg-petal-500 text-white shadow-soft-md' : 'text-mist-400 hover:bg-petal-50'
          }`}
          onClick={() => setTab('users')}
        >
          Usuarios
        </button>
        <button 
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold font-body transition-all ${
            tab === 'projects' ? 'bg-petal-500 text-white shadow-soft-md' : 'text-mist-400 hover:bg-petal-50'
          }`}
          onClick={() => setTab('projects')}
        >
          Proyectos
        </button>
        <button 
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold font-body transition-all ${
            tab === 'assign' ? 'bg-petal-500 text-white shadow-soft-md' : 'text-mist-400 hover:bg-petal-50'
          }`}
          onClick={() => setTab('assign')}
        >
          Asignaciones
        </button>
      </div>

      {tab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-petal-100/80">
            <h3 className="font-display text-lg text-mist-800 mb-4">Crear Usuario</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-mist-600 font-body mb-2">Nombre</label>
                <input 
                  placeholder="Nombre completo" 
                  value={form.nombre} 
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })} 
                  required 
                  className="w-full px-4 py-3 rounded-2xl bg-canvas-100 border border-petal-100/80 text-sm font-body text-mist-700 placeholder:text-mist-300 outline-none focus:ring-2 focus:ring-petal-200 focus:border-petal-300 transition-all shadow-inner-soft"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mist-600 font-body mb-2">Email</label>
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  required 
                  className="w-full px-4 py-3 rounded-2xl bg-canvas-100 border border-petal-100/80 text-sm font-body text-mist-700 placeholder:text-mist-300 outline-none focus:ring-2 focus:ring-petal-200 focus:border-petal-300 transition-all shadow-inner-soft"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mist-600 font-body mb-2">Contraseña</label>
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  value={form.password} 
                  onChange={(e) => setForm({ ...form, password: e.target.value })} 
                  required 
                  className="w-full px-4 py-3 rounded-2xl bg-canvas-100 border border-petal-100/80 text-sm font-body text-mist-700 placeholder:text-mist-300 outline-none focus:ring-2 focus:ring-petal-200 focus:border-petal-300 transition-all shadow-inner-soft"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mist-600 font-body mb-2">Rol</label>
                <select 
                  value={form.rol} 
                  onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-canvas-100 border border-petal-100/80 text-sm font-body text-mist-700 outline-none focus:ring-2 focus:ring-petal-200 focus:border-petal-300 transition-all shadow-inner-soft"
                >
                  <option value="empleado">Empleado</option>
                  <option value="cliente">Cliente</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button 
                type="submit" 
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-petal-400 to-blush-500 text-white text-sm font-semibold font-body shadow-soft-md hover:shadow-glow-petal transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Crear Usuario
              </button>
            </form>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-petal-100/80">
            <h3 className="font-display text-lg text-mist-800 mb-4">Lista de Usuarios ({users.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-mist-100">
                    <th className="text-left text-xs font-semibold text-mist-600 font-body pb-3">ID</th>
                    <th className="text-left text-xs font-semibold text-mist-600 font-body pb-3">Nombre</th>
                    <th className="text-left text-xs font-semibold text-mist-600 font-body pb-3">Email</th>
                    <th className="text-left text-xs font-semibold text-mist-600 font-body pb-3">Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id_usuario} className="border-b border-mist-50 hover:bg-mist-50/50">
                      <td className="py-3 text-sm text-mist-700 font-body">{u.id_usuario}</td>
                      <td className="py-3 text-sm text-mist-700 font-body">{u.nombre}</td>
                      <td className="py-3 text-sm text-mist-700 font-body">{u.email}</td>
                      <td className="py-3">
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full font-body ${
                          u.rol === 'admin' ? 'bg-lavender-100 text-lavender-600' :
                          u.rol === 'empleado' ? 'bg-sky-100 text-sky-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {u.rol}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'projects' && (
        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-petal-100/80">
            <h3 className="font-display text-lg text-mist-800 mb-4">Crear Proyecto</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-mist-600 font-body mb-2">Título del proyecto</label>
                <input 
                  placeholder="Título del proyecto" 
                  value={projForm.titulo} 
                  onChange={(e) => setProjForm({ ...projForm, titulo: e.target.value })} 
                  required 
                  className="w-full px-4 py-3 rounded-2xl bg-canvas-100 border border-petal-100/80 text-sm font-body text-mist-700 placeholder:text-mist-300 outline-none focus:ring-2 focus:ring-petal-200 focus:border-petal-300 transition-all shadow-inner-soft"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mist-600 font-body mb-2">Cliente</label>
                <select 
                  value={projForm.id_cliente} 
                  onChange={(e) => setProjForm({ ...projForm, id_cliente: e.target.value })} 
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-canvas-100 border border-petal-100/80 text-sm font-body text-mist-700 outline-none focus:ring-2 focus:ring-petal-200 focus:border-petal-300 transition-all shadow-inner-soft"
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id_usuario} value={c.id_usuario}>{c.nombre} ({c.email})</option>
                  ))}
                </select>
              </div>
              <button 
                type="submit" 
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-petal-400 to-blush-500 text-white text-sm font-semibold font-body shadow-soft-md hover:shadow-glow-petal transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Crear Proyecto
              </button>
            </form>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-petal-100/80">
            <h3 className="font-display text-lg text-mist-800 mb-4">Proyectos ({projects.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-mist-100">
                    <th className="text-left text-xs font-semibold text-mist-600 font-body pb-3">ID</th>
                    <th className="text-left text-xs font-semibold text-mist-600 font-body pb-3">Título</th>
                    <th className="text-left text-xs font-semibold text-mist-600 font-body pb-3">Cliente</th>
                    <th className="text-left text-xs font-semibold text-mist-600 font-body pb-3">Creado</th>
                    <th className="text-left text-xs font-semibold text-mist-600 font-body pb-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id_proyecto} className="border-b border-mist-50 hover:bg-mist-50/50">
                      <td className="py-3 text-sm text-mist-700 font-body">{p.id_proyecto}</td>
                      <td className="py-3 text-sm text-mist-700 font-body">{p.titulo}</td>
                      <td className="py-3 text-sm text-mist-700 font-body">{p.nombre_cliente}</td>
                      <td className="py-3 text-sm text-mist-700 font-body">{new Date(p.fecha_creacion).toLocaleDateString()}</td>
                      <td className="py-3">
                        <button 
                          onClick={() => handleDeleteProject(p.id_proyecto)} 
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold font-body bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'assign' && (
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-petal-100/80">
          <h3 className="font-display text-lg text-mist-800 mb-4">Asignar Empleado a Proyecto</h3>
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-mist-600 font-body mb-2">Proyecto</label>
              <select 
                value={assignForm.id_proyecto} 
                onChange={(e) => setAssignForm({ ...assignForm, id_proyecto: e.target.value })} 
                required
                className="w-full px-4 py-3 rounded-2xl bg-canvas-100 border border-petal-100/80 text-sm font-body text-mist-700 outline-none focus:ring-2 focus:ring-petal-200 focus:border-petal-300 transition-all shadow-inner-soft"
              >
                <option value="">Seleccionar proyecto</option>
                {projects.map((p) => (
                  <option key={p.id_proyecto} value={p.id_proyecto}>{p.titulo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-mist-600 font-body mb-2">Empleado</label>
              <select 
                value={assignForm.id_empleado} 
                onChange={(e) => setAssignForm({ ...assignForm, id_empleado: e.target.value })} 
                required
                className="w-full px-4 py-3 rounded-2xl bg-canvas-100 border border-petal-100/80 text-sm font-body text-mist-700 outline-none focus:ring-2 focus:ring-petal-200 focus:border-petal-300 transition-all shadow-inner-soft"
              >
                <option value="">Seleccionar empleado</option>
                {empleados.map((emp) => (
                  <option key={emp.id_usuario} value={emp.id_usuario}>{emp.nombre} ({emp.email})</option>
                ))}
              </select>
            </div>
            <button 
              type="submit" 
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-petal-400 to-blush-500 text-white text-sm font-semibold font-body shadow-soft-md hover:shadow-glow-petal transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Asignar
            </button>
          </form>
        </div>
      )}
      </div>
    </div>
  );
}
