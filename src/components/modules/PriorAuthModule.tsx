import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, Clock, FileText, RefreshCw, Send, XCircle, Zap } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { askMedAI } from '../../services/azureOpenAI';

const mockAuths = [
  { id: 'PA-001', patient: 'James Wilson', service: 'MRI Brain with Contrast', payer: 'BlueCross BlueShield', status: 'pending', priority: 'urgent', submitted: '2h ago', icd: 'G43.909', cpt: '70553' },
  { id: 'PA-002', patient: 'Maria Rivera', service: 'Cardiac Catheterization', payer: 'Aetna', status: 'approved', priority: 'routine', submitted: '1d ago', icd: 'I25.10', cpt: '93460' },
  { id: 'PA-003', patient: 'Robert Kim', service: 'Physical Therapy x12', payer: 'UnitedHealth', status: 'denied', priority: 'routine', submitted: '3d ago', icd: 'M54.5', cpt: '97110', denialReason: 'Medical necessity not established' },
  { id: 'PA-004', patient: 'Linda Park', service: 'PET Scan Oncology', payer: 'Cigna', status: 'pending', priority: 'urgent', submitted: '30m ago', icd: 'C50.912', cpt: '78816' },
  { id: 'PA-005', patient: 'David Chen', service: 'Spinal Surgery L4-L5', payer: 'Medicare', status: 'in_review', priority: 'non_urgent', submitted: '5d ago', icd: 'M51.16', cpt: '22633' },
];

const statusConfig = {
  pending: { label: 'Pending', color: 'badge-warning', icon: Clock },
  approved: { label: 'Approved', color: 'badge-success', icon: CheckCircle },
  denied: { label: 'Denied', color: 'badge-danger', icon: XCircle },
  in_review: { label: 'In Review', color: 'badge-info', icon: RefreshCw },
};

export const PriorAuthModule: React.FC = () => {
  const [selected, setSelected] = useState(mockAuths[0]);
  const [aiResult, setAiResult] = useState('');
  const [loading, setLoading] = useState(false);

  const runAI = async (action: string) => {
    setLoading(true);
    try {
      const res = await askMedAI(
        `${action}: Patient: ${selected.patient}, Service: ${selected.service}, ICD-10: ${selected.icd}, CPT: ${selected.cpt}, Payer: ${selected.payer}`,
        'rcm'
      );
      setAiResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Prior Authorization</h1>
          <p className="text-sm text-slate-400">AI-powered authorization management</p>
        </div>
        <button className="btn-primary text-xs"><Send size={13} />Submit New Auth</button>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Pending" value={mockAuths.filter(a => a.status === 'pending').length} icon={<Clock size={16} />} color="amber" delay={0} />
        <MetricCard title="Approved Today" value={mockAuths.filter(a => a.status === 'approved').length} icon={<CheckCircle size={16} />} color="emerald" delay={0.05} />
        <MetricCard title="Denied" value={mockAuths.filter(a => a.status === 'denied').length} icon={<XCircle size={16} />} color="rose" delay={0.1} />
        <MetricCard title="Avg TAT" value="4.2h" subtitle="Turn-around time" trend={-12} icon={<Clock size={16} />} color="blue" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Auth list */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
          <div className="p-4 border-b border-surface-100 flex items-center justify-between">
            <h3 className="font-display font-semibold text-slate-800 text-sm">Authorization Queue</h3>
            <span className="badge-warning">{mockAuths.filter(a => a.status === 'pending').length} pending</span>
          </div>
          <div className="divide-y divide-surface-50">
            {mockAuths.map(auth => {
              const StatusIcon = statusConfig[auth.status as keyof typeof statusConfig].icon;
              return (
                <button
                  key={auth.id}
                  onClick={() => { setSelected(auth); setAiResult(''); }}
                  className={`w-full p-4 text-left hover:bg-surface-50 transition-colors ${selected.id === auth.id ? 'bg-primary-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <StatusIcon size={14} className={
                      auth.status === 'approved' ? 'text-emerald-500' :
                      auth.status === 'denied' ? 'text-rose-500' :
                      auth.status === 'pending' ? 'text-amber-500' : 'text-blue-500'
                    } />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{auth.patient}</p>
                      <p className="text-xs text-slate-400 truncate">{auth.service}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400">{auth.id}</span>
                        <span className="text-[10px] text-slate-400">·</span>
                        <span className="text-[10px] text-slate-400">{auth.submitted}</span>
                      </div>
                    </div>
                    <span className={`${statusConfig[auth.status as keyof typeof statusConfig].color} text-[10px] shrink-0`}>
                      {statusConfig[auth.status as keyof typeof statusConfig].label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Auth detail + AI */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5 lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-slate-900">{selected.patient}</h3>
              <p className="text-xs text-slate-400">{selected.id} · {selected.payer}</p>
            </div>
            <span className={`${statusConfig[selected.status as keyof typeof statusConfig].color}`}>
              {statusConfig[selected.status as keyof typeof statusConfig].label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Service Requested', value: selected.service },
              { label: 'Payer', value: selected.payer },
              { label: 'ICD-10 Code', value: selected.icd },
              { label: 'CPT Code', value: selected.cpt },
              { label: 'Priority', value: selected.priority },
              { label: 'Submitted', value: selected.submitted },
            ].map((f, i) => (
              <div key={i} className="p-3 bg-surface-50 rounded-xl">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">{f.label}</p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>

          {selected.denialReason && (
            <div className="alert-critical mb-4">
              <p className="text-xs font-semibold text-rose-700">Denial Reason</p>
              <p className="text-xs text-rose-600 mt-0.5">{selected.denialReason}</p>
            </div>
          )}

          {/* AI Actions */}
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              'Assess medical necessity',
              'Draft appeal letter',
              'Predict approval likelihood',
              'Suggest alternative codes',
            ].map(action => (
              <button key={action} onClick={() => runAI(action)} disabled={loading}
                className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5">
                <Zap size={11} />{action}
              </button>
            ))}
          </div>

          {(loading || aiResult) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-gradient-to-br from-primary-50 to-teal-50 border border-primary-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={13} className="text-primary-500" />
                <span className="text-xs font-semibold text-primary-700">AI RCM Analysis</span>
              </div>
              {loading ? (
                <div className="flex gap-1">{[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}</div>
              ) : (
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{aiResult}</p>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
