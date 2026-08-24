import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, CreditCard, FileText, TrendingUp, XCircle, Zap } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { ClaimsDistribution, TrendChart } from '../charts';
import { askMedAI } from '../../services/azureOpenAI';

const claims = [
  { id: 'CLM-8492', patient: 'James Wilson', payer: 'BlueCross', amount: 4200, status: 'pending', icd: 'I21.9', cpt: '93462', submitted: '2h ago', risk: 'medium' },
  { id: 'CLM-8491', patient: 'Sarah Chen', payer: 'Aetna', amount: 1850, status: 'approved', icd: 'E11.65', cpt: '99232', submitted: '4h ago', risk: 'low' },
  { id: 'CLM-8490', patient: 'Maria Rivera', payer: 'Medicare', amount: 8720, status: 'denied', icd: 'I50.9', cpt: '93610', submitted: '1d ago', risk: 'high', denialCode: 'CO-16' },
  { id: 'CLM-8489', patient: 'Robert Kim', payer: 'UnitedHealth', amount: 3100, status: 'pending', icd: 'J18.9', cpt: '99233', submitted: '1d ago', risk: 'low' },
  { id: 'CLM-8488', patient: 'Linda Park', payer: 'Cigna', amount: 12400, status: 'approved', icd: 'C50.912', cpt: '38525', submitted: '2d ago', risk: 'low' },
];

const revenueTrend = Array.from({ length: 7 }, (_, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  submitted: 85000 + Math.round(Math.random() * 30000),
  collected: 70000 + Math.round(Math.random() * 25000),
}));

const distData = [
  { name: 'Approved', value: 58 },
  { name: 'Pending', value: 22 },
  { name: 'Denied', value: 12 },
  { name: 'Appeal', value: 8 },
];

const statusConfig = {
  approved: 'badge-success',
  pending: 'badge-warning',
  denied: 'badge-danger',
  appeal: 'badge-info',
};

export const ClaimsModule: React.FC = () => {
  const [selected, setSelected] = useState(claims[0]);
  const [aiResult, setAiResult] = useState('');
  const [loading, setLoading] = useState(false);

  const runAI = async (action: string) => {
    setLoading(true);
    try {
      const res = await askMedAI(
        `${action} for claim ${selected.id}: Patient: ${selected.patient}, Payer: ${selected.payer}, Amount: $${selected.amount}, ICD: ${selected.icd}, CPT: ${selected.cpt}${selected.denialCode ? ', Denial: ' + selected.denialCode : ''}`,
        'rcm'
      );
      setAiResult(res);
    } finally { setLoading(false); }
  };

  const totalRevenue = claims.filter(c => c.status === 'approved').reduce((a, c) => a + c.amount, 0);

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Claims Integrity</h1>
          <p className="text-sm text-slate-400">AI-powered coding validation & denial prevention</p>
        </div>
        <button onClick={() => runAI('Run AI audit on all pending claims for coding errors and denial risk')} className="btn-primary text-xs">
          <Brain size={13} />AI Audit All Claims
        </button>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Claims Today" value={claims.length} icon={<FileText size={16} />} color="blue" delay={0} />
        <MetricCard title="Revenue Collected" value={`$${(totalRevenue / 1000).toFixed(1)}K`} trend={8.1} icon={<CreditCard size={16} />} color="emerald" delay={0.05} />
        <MetricCard title="Denial Rate" value="12%" trend={-2.4} icon={<XCircle size={16} />} color="rose" delay={0.1} />
        <MetricCard title="Clean Claim Rate" value="88%" trend={3.1} icon={<CheckCircle size={16} />} color="teal" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <h3 className="font-display font-semibold text-slate-800 text-sm mb-3">Claims Distribution</h3>
          <ClaimsDistribution data={distData} height={160} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5 lg:col-span-3">
          <h3 className="font-display font-semibold text-slate-800 text-sm mb-3">Revenue Trend — Weekly</h3>
          <TrendChart data={revenueTrend} lines={[{ key: 'submitted', label: 'Submitted ($)' }, { key: 'collected', label: 'Collected ($)', color: '#059669' }]} xKey="day" height={150} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card overflow-hidden">
          <div className="p-4 border-b border-surface-100">
            <h3 className="font-display font-semibold text-slate-800 text-sm">Claims Queue</h3>
          </div>
          <div className="divide-y divide-surface-50">
            {claims.map(claim => (
              <button key={claim.id} onClick={() => { setSelected(claim); setAiResult(''); }}
                className={`w-full p-4 text-left hover:bg-surface-50 transition-colors ${selected.id === claim.id ? 'bg-primary-50' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{claim.patient}</p>
                    <p className="text-xs text-slate-400 font-mono">{claim.id}</p>
                    <p className="text-xs font-semibold text-slate-600 mt-1">${claim.amount.toLocaleString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`${statusConfig[claim.status as keyof typeof statusConfig]} text-[10px]`}>{claim.status}</span>
                    <p className="text-[10px] text-slate-400 mt-1">{claim.submitted}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5 lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-slate-900">{selected.patient}</h3>
              <p className="text-xs text-slate-400 font-mono">{selected.id} · {selected.payer}</p>
            </div>
            <span className={`${statusConfig[selected.status as keyof typeof statusConfig]} text-xs`}>{selected.status}</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Amount', value: `$${selected.amount.toLocaleString()}` },
              { label: 'ICD-10', value: selected.icd },
              { label: 'CPT Code', value: selected.cpt },
              { label: 'Payer', value: selected.payer },
              { label: 'Risk Level', value: selected.risk },
              { label: 'Submitted', value: selected.submitted },
            ].map((f, i) => (
              <div key={i} className="p-2.5 bg-surface-50 rounded-xl">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{f.label}</p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>

          {selected.denialCode && (
            <div className="alert-critical mb-4">
              <p className="text-xs font-semibold text-rose-700">Denial Code: {selected.denialCode}</p>
              <p className="text-xs text-rose-600">Claim requires review and possible resubmission</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            {['Validate coding accuracy', 'Check denial risk', 'Draft appeal', 'Verify medical necessity'].map(action => (
              <button key={action} onClick={() => runAI(action)} disabled={loading}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs rounded-lg font-medium disabled:opacity-50 flex items-center gap-1.5">
                <Zap size={11} />{action}
              </button>
            ))}
          </div>

          {(loading || aiResult) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-teal-50 border border-teal-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={13} className="text-teal-500" />
                <span className="text-xs font-semibold text-teal-700">AI Claims Analysis</span>
              </div>
              {loading ? <div className="flex gap-1">{[0,150,300].map(d=><span key={d} className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{animationDelay:`${d}ms`}}/>)}</div>
              : <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{aiResult}</p>}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
