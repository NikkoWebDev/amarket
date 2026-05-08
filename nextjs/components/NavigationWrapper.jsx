'use client';

import { useAuth } from "@/components/AuthProvider";
import Navigation from "@/components/Navigation";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function NavigationWrapper({ children }) {
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState("dashboard");
  const router = useRouter();
  const pathname = usePathname();

  // Detect current route for active navigation
  useEffect(() => {
    if (pathname === '/admin') {
      setActiveNav('dashboard');
    } else if (pathname === '/proyectos') {
      setActiveNav('kanban');
    } else if (pathname === '/ajustes') {
      setActiveNav('settings');
    } else if (pathname === '/perfil') {
      setActiveNav('settings'); // Profile under settings category
    }
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isLoginPage = pathname === '/';

  return (
    <div className="min-h-screen mesh-gradient">
      {user && !isLoginPage && (
        <Navigation 
          active={activeNav} 
          onChange={setActiveNav} 
          userRole={user.rol}
          onLogout={handleLogout}
        />
      )}
      <div className={user && !isLoginPage ? "pb-24" : ""}>
        {children}
      </div>
    </div>
  );
}
