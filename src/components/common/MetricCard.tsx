import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'teal' | 'amber' | 'rose' | 'violet' | 'emerald';
  badge?: string;
  badgeType?: 'success' | 'warning' | 'danger' | 'info';
  onClick?: () => void;
  delay?: number;
}

const colorMap = {
  blue: { bg: 'bg-primary-500/10 border-primary-200/80', icon: 'bg-gradient-to-tr from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/20', value: 'text-slate-900' },
  teal: { bg: 'bg-teal-500/10 border-teal-200/80', icon: 'bg-gradient-to-tr from-teal-600 to-accent-teal text-white shadow-md shadow-teal-500/20', value: 'text-slate-900' },
  amber: { bg: 'bg-amber-500/10 border-amber-200/80', icon: 'bg-gradient-to-tr from-amber-600 to-amber-500 text-white shadow-md shadow-amber-500/20', value: 'text-slate-900' },
  rose: { bg: 'bg-rose-500/10 border-rose-200/80', icon: 'bg-gradient-to-tr from-rose-600 to-rose-500 text-white shadow-md shadow-rose-500/20', value: 'text-slate-900' },
  violet: { bg: 'bg-violet-500/10 border-violet-200/80', icon: 'bg-gradient-to-tr from-violet-600 to-accent-violet text-white shadow-md shadow-violet-500/20', value: 'text-slate-900' },
  emerald: { bg: 'bg-emerald-500/10 border-emerald-200/80', icon: 'bg-gradient-to-tr from-emerald-600 to-accent-emerald text-white shadow-md shadow-emerald-500/20', value: 'text-slate-900' },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title, value, subtitle, trend, trendLabel, icon, color = 'blue',
  badge, badgeType = 'info', onClick, delay = 0
}) => {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className={`metric-card border border-slate-200/80 bg-white/90 backdrop-blur-md ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3.5">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">{title}</p>
          {badge && (
            <span className={`badge-${badgeType} mt-1.5 text-[10px]`}>{badge}</span>
          )}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl ${colors.icon} flex items-center justify-center shrink-0 ml-3`}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between mt-auto">
        <div>
          <div className={`text-2xl lg:text-3xl font-extrabold font-display ${colors.value} tracking-tight`}>
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium mt-1">{subtitle}</p>
          )}
        </div>

        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg
            ${trend > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : trend < 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
            {trend > 0 ? <TrendingUp size={14} /> : trend < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
            <span>{Math.abs(trend)}%</span>
            {trendLabel && <span className="font-normal text-slate-500 ml-0.5">{trendLabel}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
};
