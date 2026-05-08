'use client';

import GlassCard from './GlassCard';

export default function StatCard({ label, value, icon, trend, trendUp = true, color = 'primary' }) {
  const colorClasses = {
    primary: {
      bg: 'bg-petal-100',
      text: 'text-petal-500',
      icon: 'text-petal-500',
      trend: 'text-petal-600 bg-petal-50',
    },
    secondary: {
      bg: 'bg-lavender-100',
      text: 'text-lavender-600',
      icon: 'text-lavender-600',
      trend: 'text-lavender-600 bg-lavender-50',
    },
    success: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-600',
      icon: 'text-emerald-600',
      trend: 'text-emerald-600 bg-emerald-50',
    },
    warning: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      icon: 'text-orange-600',
      trend: 'text-orange-600 bg-orange-50',
    },
  };

  const colors = colorClasses[color];

  return (
    <GlassCard hover className="group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 ${colors.bg} rounded-2xl ${colors.icon}`}>
          {icon}
        </div>
        {trend && (
          <span className={`font-label text-xs px-2 py-1 rounded-lg ${colors.trend}`}>
            {trendUp ? '+' : ''}{trend}
          </span>
        )}
      </div>
      <h3 className="text-sm text-mist-500 mb-1">{label}</h3>
      <p className={`text-3xl font-display font-bold ${colors.text}`}>{value}</p>
    </GlassCard>
  );
}
