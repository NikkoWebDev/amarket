'use client';

export default function GlassCard({ children, className = '', hover = false, padding = 'normal' }) {
  const paddingClasses = {
    small: 'p-4',
    normal: 'p-6',
    large: 'p-8',
  };

  return (
    <div
      className={`
        bg-white/70 backdrop-blur-md 
        border border-white/40 
        rounded-3xl
        ${paddingClasses[padding]}
        ${hover ? 'hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300' : ''}
        ${className}
      `}
      style={{
        boxShadow: '0 10px 30px -10px rgba(233, 80, 157, 0.1)',
      }}
    >
      {children}
    </div>
  );
}
