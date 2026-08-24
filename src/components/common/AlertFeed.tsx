import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, XCircle, Check } from 'lucide-react';
import { useAppStore, Alert } from '../../store/appStore';
import { formatDistanceToNow } from 'date-fns';

const iconMap = {
  critical: XCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
};

const colorMap = {
  critical: {
    bg: 'bg-rose-500/10 border-rose-200/90 hover:bg-rose-500/15',
    icon: 'text-rose-600',
    title: 'text-rose-950 font-bold',
    body: 'text-rose-800',
  },
  warning: {
    bg: 'bg-amber-500/10 border-amber-200/90 hover:bg-amber-500/15',
    icon: 'text-amber-600',
    title: 'text-amber-950 font-bold',
    body: 'text-amber-800',
  },
  info: {
    bg: 'bg-sky-500/10 border-sky-200/90 hover:bg-sky-500/15',
    icon: 'text-sky-600',
    title: 'text-sky-950 font-bold',
    body: 'text-sky-800',
  },
  success: {
    bg: 'bg-emerald-500/10 border-emerald-200/90 hover:bg-emerald-500/15',
    icon: 'text-emerald-600',
    title: 'text-emerald-950 font-bold',
    body: 'text-emerald-800',
  },
};

interface AlertFeedProps {
  maxItems?: number;
  showResolved?: boolean;
  compact?: boolean;
}

export const AlertFeed: React.FC<AlertFeedProps> = ({
  maxItems = 10,
  showResolved = false,
  compact = false,
}) => {
  const { alerts, resolveAlert } = useAppStore();

  const filtered = alerts
    .filter(a => showResolved || !a.resolved)
    .slice(0, maxItems);

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center glass-card p-6">
        <CheckCircle size={36} className="text-emerald-500 mb-2 animate-bounce" />
        <p className="text-sm font-bold text-slate-800">All Clear</p>
        <p className="text-xs text-slate-400">No active alerts requiring attention</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <AnimatePresence initial={false}>
        {filtered.map((alert, i) => (
          <AlertItem
            key={alert.id}
            alert={alert}
            compact={compact}
            onResolve={() => resolveAlert(alert.id)}
            delay={i * 0.04}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface AlertItemProps {
  alert: Alert;
  compact: boolean;
  onResolve: () => void;
  delay: number;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, compact, onResolve, delay }) => {
  const Icon = iconMap[alert.type];
  const colors = colorMap[alert.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8, height: 0 }}
      transition={{ delay, duration: 0.2 }}
      className={`flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-sm transition-all shadow-xs
        ${colors.bg} ${alert.resolved ? 'opacity-50 grayscale' : ''}`}
    >
      <Icon size={compact ? 16 : 18} className={`${colors.icon} shrink-0 mt-0.5`} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-xs ${colors.title} truncate`}>{alert.title}</p>
            {!compact && (
              <p className={`text-xs mt-0.5 line-clamp-2 leading-relaxed ${colors.body}`}>{alert.message}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
              {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
            </span>
            {!alert.resolved && (
              <button
                onClick={onResolve}
                className="p-1 hover:bg-white/80 rounded-lg transition-colors border border-transparent hover:border-slate-300"
                title="Mark resolved"
              >
                <Check size={13} className={colors.icon} />
              </button>
            )}
          </div>
        </div>
        {!compact && alert.patient_name && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Patient:</span>
            <span className="text-xs font-bold text-slate-800">{alert.patient_name}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
