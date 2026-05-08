'use client';

export default function GlassInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  className = '',
  multiline = false,
  rows = 4,
}) {
  const baseClasses = `
    w-full
    bg-white/50
    border border-petal-100/60
    rounded-2xl
    p-4
    font-body
    text-mist-800
    placeholder-mist-400
    focus:outline-none
    focus:ring-2
    focus:ring-petal-300
    focus:border-petal-400
    transition-all
    ${className}
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-semibold text-mist-500 ml-1">
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`${baseClasses} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseClasses}
        />
      )}
    </div>
  );
}
