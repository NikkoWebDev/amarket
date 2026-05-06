'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace(user.rol === 'admin' ? '/admin' : '/proyectos');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.rol === 'admin') router.replace('/admin');
      else router.replace('/proyectos');
    } catch {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-petal px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-soft-lg border border-petal-100/80 animate-float-up">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="BoomLab Logo" className="w-20 h-20 mx-auto mb-4 object-contain" />
            <h1 className="font-display text-3xl text-mist-800 mb-2 font-bold">BoomLab</h1>
            <p className="text-sm text-mist-400 font-body">Inicia sesión en tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-3 text-red-500 text-xs font-body text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-mist-600 font-body mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-canvas-100 border border-petal-100/80 text-sm font-body text-mist-700 placeholder:text-mist-300 outline-none focus:ring-2 focus:ring-petal-200 focus:border-petal-300 transition-all shadow-inner-soft"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-mist-600 font-body mb-2">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-canvas-100 border border-petal-100/80 text-sm font-body text-mist-700 placeholder:text-mist-300 outline-none focus:ring-2 focus:ring-petal-200 focus:border-petal-300 transition-all shadow-inner-soft"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-petal-400 to-blush-500 text-white text-sm font-semibold font-body shadow-soft-md hover:shadow-glow-petal transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[11px] text-mist-400 font-body">
              Credenciales demo: admin@sistema.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
