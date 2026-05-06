import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import NavigationWrapper from "@/components/NavigationWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Gestión de Proyectos",
  description: "Sistema de gestión de proyectos y comunicación con clientes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <NavigationWrapper>{children}</NavigationWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
