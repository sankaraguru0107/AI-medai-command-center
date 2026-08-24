import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Brain, Lock, Monitor, Server, Shield, Wifi, Zap } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { TrendChart } from '../charts';
import { askMedAI } from '../../services/azureOpenAI';

const threats = [
  { id: 'T001', type: 'Unauthorized Access', severity: 'critical', source: '203.0.113.42', target: 'EHR System', time: '2m ago', status: 'active', details: 'Multiple failed logins followed by successful auth from unrecognized IP' },
  { id: 'T002', type: 'Ransomware Attempt', severity: 'critical', source: '198.51.100.7', target: 'PACS Server', time: '18m ago', status: 'blocked', details: 'Known ransomware signature detected. Traffic blocked by DLP.' },
  { id: 'T003', type: 'PHI Data Exfiltration', severity: 'high', source: 'Internal - WS-192', target: 'Patient DB', time: '45m ago', status: 'investigating', details: 'Anomalous bulk query on patient_records table — 3,400 records accessed' },
  { id: 'T004', type: 'Medical Device Anomaly', severity: 'medium', source: 'IV-Pump-ICU-4', target: 'MedNet', time: '1h ago', status: 'monitoring', details: 'Unexpected outbound connection attempt from infusion pump' },
  { id: 'T005', type: 'Phishing Email', severity: 'low', source: 'external-email', target: 'Staff mailboxes', time: '2h ago', status: 'resolved', details: '14 phishing emails blocked. 2 staff clicked — awareness training triggered.' },
];

const threatTrend = Array.from({ length: 12 }, (_, i) => ({
  hour: `${i * 2}:00`,
  critical: Math.round(Math.random() * 3),
  high: Math.round(Math.random() * 6),
  medium: Math.round(Math.random() * 10),
}));

const complianceItems = [
  { item: 'HIPAA Security Rule', score: 94, status: 'compliant' },
  { item: 'Access Control Audit', score: 87, status: 'compliant' },
  { item: 'Encryption at Rest', score: 100, status: 'compliant' },
  { item: 'Audit Log Integrity', score: 98, status: 'compliant' },
  { item: 'MFA Enforcement', score: 76, status: 'warning' },
  { item: 'Patch Management', score: 81, status: 'warning' },
];

const severityConfig = {
  critical: 'bg-rose-50 border-rose-300 text-rose-700',
  high: 'bg-orange-50 border-orange-300 text-orange-700',
  medium: 'bg-amber-50 border-amber-300 text-amber-700',
  low: 'bg-blue-50 border-blue-300 text-blue-700',
};

export const SOCDashboard: React.FC = () => {
  const [selected, setSelected] = useState(threats[0]);
  const [aiResult, setAiResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [threatScore, setThreatScore] = useState(42);

  useEffect(() => {
    const interval = setInterval(() => {
      setThreatScore(prev => Math.max(30, Math.min(80, prev + (Math.random() - 0.5) * 5)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const analyzeWithAI = async (action: string) => {
    setLoading(true);
    try {
      const res = await askMedAI(
        `${action}: ${JSON.stringify({ type: selected.type, severity: selected.severity, source: selected.source, target: selected.target, details: selected.details })}`,
        'security'
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
          <h1 className="text-2xl font-display font-bold text-slate-900">Security Operations Center</h1>
          <p className="text-sm text-slate-400">Healthcare cybersecurity monitoring · HIPAA compliance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold
            ${threatScore > 60 ? 'bg-rose-50 border-rose-200 text-rose-700' :
              threatScore > 40 ? 'bg-amber-50 border-amber-200 text-amber-700' :
              'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
            <Shield size={13} />
            Threat Score: {Math.round(threatScore)}
          </div>
          <button className="btn-primary text-xs"><Zap size={13} />AI Threat Scan</button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Active Threats" value={threats.filter(t => t.status === 'active').length} icon={<AlertTriangle size={16} />} color="rose" badge="CRITICAL" badgeType="danger" delay={0} />
        <MetricCard title="Blocked Today" value="147" subtitle="Auto-blocked" trend={-8} icon={<Shield size={16} />} color="emerald" delay={0.05} />
        <MetricCard title="Devices Monitored" value="1,284" subtitle="IoMT + endpoints" icon={<Monitor size={16} />} color="blue" delay={0.1} />
        <MetricCard title="HIPAA Score" value="94%" subtitle="Compliance status" trend={2} icon={<Lock size={16} />} color="teal" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Threat list */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
          <div className="p-4 border-b border-surface-100 flex items-center justify-between">
            <h3 className="font-display font-semibold text-slate-800 text-sm">Active Threats</h3>
            <span className="badge-danger animate-pulse-slow">{threats.filter(t => t.status === 'active' || t.status === 'investigating').length} live</span>
          </div>
          <div className="divide-y divide-surface-50">
            {threats.map(threat => (
              <button
                key={threat.id}
                onClick={() => { setSelected(threat); setAiResult(''); }}
                className={`w-full p-4 text-left hover:bg-surface-50 transition-colors ${selected.id === threat.id ? 'bg-primary-50' : ''}`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0
                    ${threat.severity === 'critical' ? 'bg-rose-500' :
                      threat.severity === 'high' ? 'bg-orange-500' :
                      threat.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{threat.type}</p>
                    <p className="text-xs text-slate-400 truncate">{threat.target}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`badge text-[10px] border ${severityConfig[threat.severity as keyof typeof severityConfig]}`}>{threat.severity}</span>
                      <span className="text-[10px] text-slate-400">{threat.time}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Threat detail */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5 lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-slate-900">{selected.type}</h3>
              <p className="text-xs text-slate-400">{selected.id} · Detected {selected.time}</p>
            </div>
            <span className={`badge border text-xs ${severityConfig[selected.severity as keyof typeof severityConfig]}`}>
              {selected.severity.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Source', value: selected.source, icon: Wifi },
              { label: 'Target System', value: selected.target, icon: Server },
              { label: 'Status', value: selected.status, icon: Shield },
              { label: 'Detected', value: selected.time, icon: Monitor },
            ].map((f, i) => (
              <div key={i} className="p-3 bg-surface-50 rounded-xl flex items-start gap-2">
                <f.icon size={13} className="text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">{f.label}</p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">{f.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4">
            <p className="text-xs font-semibold text-slate-700 mb-1">Incident Details</p>
            <p className="text-xs text-slate-500 leading-relaxed">{selected.details}</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {['Analyze this threat', 'Suggest remediation', 'Assess HIPAA impact', 'Generate incident report'].map(action => (
              <button key={action} onClick={() => analyzeWithAI(action)} disabled={loading}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5">
                <Brain size={11} />{action}
              </button>
            ))}
          </div>

          {(loading || aiResult) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-gradient-to-br from-slate-50 to-rose-50 border border-rose-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={13} className="text-rose-500" />
                <span className="text-xs font-semibold text-rose-700">AI Security Analysis</span>
              </div>
              {loading ? (
                <div className="flex gap-1">{[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}</div>
              ) : (
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{aiResult}</p>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Threat trend + Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
          <h3 className="font-display font-semibold text-slate-800 text-sm mb-4">Threat Activity — 24h</h3>
          <TrendChart
            data={threatTrend}
            lines={[
              { key: 'critical', label: 'Critical', color: '#e11d48' },
              { key: 'high', label: 'High', color: '#f97316' },
              { key: 'medium', label: 'Medium', color: '#d97706' },
            ]}
            xKey="hour"
            height={180}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-5">
          <h3 className="font-display font-semibold text-slate-800 text-sm mb-4">HIPAA Compliance Status</h3>
          <div className="space-y-3">
            {complianceItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600">{item.item}</span>
                    <span className={`text-xs font-semibold ${item.status === 'compliant' ? 'text-emerald-600' : 'text-amber-600'}`}>{item.score}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score}%` }}
                      transition={{ delay: 0.45 + i * 0.05, duration: 0.5 }}
                      className={`h-full rounded-full ${item.status === 'compliant' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
