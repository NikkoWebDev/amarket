import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'empleado' });
  const [projForm, setProjForm] = useState({ titulo: '', id_cliente: '' });
  const [assignForm, setAssignForm] = useState({ id_proyecto: '', id_empleado: '' });
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState('users');

  useEffect(() => {
    loadUsers();
    loadProjects();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await api.get('/proyectos');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/auth/register', form);
      setMessage('Usuario creado exitosamente');
      setForm({ nombre: '', email: '', password: '', rol: 'empleado' });
      loadUsers();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error al crear usuario');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/proyectos', projForm);
      setMessage('Proyecto creado exitosamente');
      setProjForm({ titulo: '', id_cliente: '' });
      loadProjects();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error al crear proyecto');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/asignaciones', assignForm);
      setMessage('Empleado asignado exitosamente');
      setAssignForm({ id_proyecto: '', id_empleado: '' });
      loadProjects();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error al asignar');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('¿Eliminar este proyecto?')) return;
    try {
      await api.delete(`/proyectos/${id}`);
      loadProjects();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error al eliminar');
    }
  };

  const clientes = users.filter((u) => u.rol === 'cliente');
  const empleados = users.filter((u) => u.rol === 'empleado');

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Panel de Administrador</h1>
        <div className="header-info">
          <span>{user.nombre}</span>
          <button onClick={logout} className="btn-logout">Cerrar Sesión</button>
        </div>
      </header>

      {message && <div className="notification">{message}</div>}

      <div className="tabs">
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Usuarios</button>
        <button className={tab === 'projects' ? 'active' : ''} onClick={() => setTab('projects')}>Proyectos</button>
        <button className={tab === 'assign' ? 'active' : ''} onClick={() => setTab('assign')}>Asignaciones</button>
      </div>

      {tab === 'users' && (
        <div className="panel">
          <h3>Crear Usuario</h3>
          <form onSubmit={handleCreateUser} className="admin-form">
            <input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input type="password" placeholder="Contraseña" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
              <option value="empleado">Empleado</option>
              <option value="cliente">Cliente</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit">Crear</button>
          </form>

          <h3>Lista de Usuarios</h3>
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id_usuario}>
                  <td>{u.id_usuario}</td><td>{u.nombre}</td><td>{u.email}</td><td>{u.rol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'projects' && (
        <div className="panel">
          <h3>Crear Proyecto</h3>
          <form onSubmit={handleCreateProject} className="admin-form">
            <input placeholder="Título del proyecto" value={projForm.titulo} onChange={(e) => setProjForm({ ...projForm, titulo: e.target.value })} required />
            <select value={projForm.id_cliente} onChange={(e) => setProjForm({ ...projForm, id_cliente: e.target.value })} required>
              <option value="">Seleccionar cliente</option>
              {clientes.map((c) => (
                <option key={c.id_usuario} value={c.id_usuario}>{c.nombre} ({c.email})</option>
              ))}
            </select>
            <button type="submit">Crear Proyecto</button>
          </form>

          <h3>Proyectos</h3>
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Título</th><th>Cliente</th><th>Creado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id_proyecto}>
                  <td>{p.id_proyecto}</td>
                  <td>{p.titulo}</td>
                  <td>{p.nombre_cliente}</td>
                  <td>{new Date(p.fecha_creacion).toLocaleDateString()}</td>
                  <td><button onClick={() => handleDeleteProject(p.id_proyecto)} className="btn-danger">Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'assign' && (
        <div className="panel">
          <h3>Asignar Empleado a Proyecto</h3>
          <form onSubmit={handleAssign} className="admin-form">
            <select value={assignForm.id_proyecto} onChange={(e) => setAssignForm({ ...assignForm, id_proyecto: e.target.value })} required>
              <option value="">Seleccionar proyecto</option>
              {projects.map((p) => (
                <option key={p.id_proyecto} value={p.id_proyecto}>{p.titulo}</option>
              ))}
            </select>
            <select value={assignForm.id_empleado} onChange={(e) => setAssignForm({ ...assignForm, id_empleado: e.target.value })} required>
              <option value="">Seleccionar empleado</option>
              {empleados.map((emp) => (
                <option key={emp.id_usuario} value={emp.id_usuario}>{emp.nombre} ({emp.email})</option>
              ))}
            </select>
            <button type="submit">Asignar</button>
          </form>
        </div>
      )}
    </div>
  );
}
