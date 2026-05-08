'use client';

export default function GlassButton({ 
  variant = 'primary', 
  children, 
  onClick, 
  className = '',
  icon = null,
  fullWidth = false,
  type = 'button'
}) {
  const baseClasses = `
    flex items-center justify-center gap-2
    font-semibold
    rounded-2xl
    transition-all duration-200
    active:scale-95
    ${fullWidth ? 'w-full' : ''}
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-petal-400 to-blush-500
      text-white
      shadow-soft-md
      hover:shadow-soft-lg
      px-6 py-3
    `,
    secondary: `
      bg-white/70 backdrop-blur-md
      border border-white/60
      text-petal-500
      hover:bg-white/90
      px-6 py-3
    `,
    ghost: `
      bg-transparent
      text-mist-500
      hover:text-petal-500
      hover:bg-petal-50/50
      px-4 py-2
    `,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
