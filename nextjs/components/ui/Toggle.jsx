'use client';

export default function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/30 border border-white/40">
      <div>
        <p className="font-semibold text-mist-800">{label}</p>
        {description && (
          <p className="text-sm text-mist-400">{description}</p>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-mist-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blush-500"></div>
      </label>
    </div>
  );
}
