import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TestTube, Search, CheckCircle, Sparkles, Filter, Plus, FileText } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

export const ClinicalTrialsModule: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [enrolledTrial, setEnrolledTrial] = useState<string | null>(null);
  const [trials, setTrials] = useState([
    { id: 'NCT04812901', name: 'Novel SGLT2 Inhibitor in CHF', match: '98% Eligible', phase: 'Phase III', status: 'Recruiting' },
    { id: 'NCT05128932', name: 'Bi-specific Antibody in Refractory Myeloma', match: '91% Eligible', phase: 'Phase II', status: 'Recruiting' },
    { id: 'NCT04930122', name: 'CAR-T Cell Therapy for Solid Tumors', match: '87% Eligible', phase: 'Phase I/II', status: 'Screening' },
  ]);

  const handleEnroll = (id: string, name: string) => {
    setEnrolledTrial(`Patient enrolled in ${id} (${name}). Pre-screening packet dispatched to IRB.`);
  };

  const filtered = trials.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto font-sans text-slate-900">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Clinical Trial Matching AI <TestTube className="text-teal-600" />
          </h1>
          <p className="text-sm text-slate-500">Automated ClinicalTrials.gov synchronization and genomic inclusion criteria matching.</p>
        </div>
      </div>

      {enrolledTrial && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-600" /> {enrolledTrial}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Trials Indexed" value="420,000+" subtitle="ClinicalTrials.gov" icon={<TestTube size={16} />} color="teal" delay={0} />
        <MetricCard title="Match Precision" value="96.4%" subtitle="Genomic & EHR filter" icon={<Sparkles size={16} />} color="blue" delay={0.05} />
        <MetricCard title="Eligible Patients" value="142" subtitle="Active candidates" icon={<CheckCircle size={16} />} color="emerald" delay={0.1} />
        <MetricCard title="Enrolled This Month" value="28" subtitle="IRB Approved" icon={<FileText size={16} />} color="amber" delay={0.15} />
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-bold text-sm text-slate-800">Active Matching Clinical Trials</h3>
          <div className="relative max-w-xs w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search trials or NCT numbers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field text-xs pl-8 py-1.5"
            />
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map(t => (
            <div key={t.id} className="p-3.5 bg-slate-50 border rounded-xl flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <span>{t.id} — {t.name}</span>
                  <span className="badge-info text-[10px]">{t.phase}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Status: {t.status} · Inclusion score computed via EHR NLP</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="badge-success text-[10px] font-bold">{t.match}</span>
                <button onClick={() => handleEnroll(t.id, t.name)} className="btn-primary text-xs px-3 py-1">
                  Enroll Patient
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
