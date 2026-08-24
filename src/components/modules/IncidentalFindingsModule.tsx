import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, CheckCircle, Calendar, Send } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

export const IncidentalFindingsModule: React.FC = () => {
  const [signedOff, setSignedOff] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('2026-10-15');
  const [notice, setNotice] = useState<string | null>(null);

  const handleSignOff = () => {
    setSignedOff(true);
    setNotice(`Incidental finding signed off by Attending Physician. Follow-up CT scheduled for ${scheduledDate}. Patient notification dispatched.`);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto font-sans text-slate-900">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Incidental Findings Tracking AI <FileText className="text-primary-600" />
          </h1>
          <p className="text-sm text-slate-500">Automated NLP parsing of radiology reports for unaddressed incidental nodules, lesions, and aneurysms.</p>
        </div>
        <button onClick={handleSignOff} className="btn-primary text-xs flex items-center gap-1.5">
          <CheckCircle size={14} /> {signedOff ? '✓ Approved & Signed' : 'Sign-Off & Schedule Follow-Up'}
        </button>
      </div>

      {notice && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-600" /> {notice}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Parsed Reports" value="1,280" subtitle="Last 30 Days" icon={<FileText size={16} />} color="blue" delay={0} />
        <MetricCard title="Findings Flagged" value="14" subtitle="Require Follow-Up" icon={<AlertTriangle size={16} />} color="amber" delay={0.05} />
        <MetricCard title="Sign-Off Rate" value="92.8%" subtitle="Physician Approved" icon={<CheckCircle size={16} />} color="emerald" delay={0.1} />
        <MetricCard title="Closed Loop Rate" value="98.1%" subtitle="Zero Lost to Follow-Up" icon={<Calendar size={16} />} color="teal" delay={0.15} />
      </div>

      <div className="glass-card p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-800 border-b pb-2">Unaddressed Incidental Findings Queue</h3>
        <div className="p-4 bg-slate-50 border rounded-xl space-y-3 text-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-slate-800 text-sm">Robert Kim — Incidental 6mm Renal Lesion (CT Abdomen)</p>
              <p className="text-slate-600 mt-1">Found incidentally on Trauma CT. Recommendation: Dedicated Renal Ultrasound in 6 months.</p>
            </div>
            <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${signedOff ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {signedOff ? 'Signed Off' : 'Action Required'}
            </span>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-700">Follow-up Date:</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                className="input-field text-xs py-1"
              />
            </div>
            <button onClick={handleSignOff} className="btn-primary text-xs px-4 py-1.5">
              Confirm Schedule & Send Letter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
