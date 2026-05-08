'use client';

import { useAuth } from "@/components/AuthProvider";
import Navigation from "@/components/Navigation";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function NavigationWrapper({ children }) {
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState("dashboard");
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isLoginPage = pathname === '/';

  return (
    <div className="min-h-screen bg-gradient-petal">
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
