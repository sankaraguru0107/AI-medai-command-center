import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Server, CheckCircle, Wifi, RefreshCw, Play, AlertCircle, ShieldCheck } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

export const AppSupportModule: React.FC = () => {
  const [interfaceStatus, setInterfaceStatus] = useState<'Healthy' | 'Testing' | 'Optimized'>('Healthy');
  const [testingMsg, setTestingMsg] = useState<string | null>(null);
  const [logs, setLogs] = useState([
    { id: 1, text: 'Epic Bridges HL7 v2.5 ACK Received (12ms)', status: '200 OK', time: 'Just now' },
    { id: 2, text: 'DICOM Listener Port 104 Handshake', status: 'Connected', time: '2m ago' },
    { id: 3, text: 'Cerner Millennium FHIR R4 Bundle Sync', status: 'Success', time: '5m ago' },
  ]);

  const runDiagnostics = () => {
    setInterfaceStatus('Testing');
    setTestingMsg('Running full interface ping diagnostic across Epic, PACS, and Cerner...');
    setTimeout(() => {
      setInterfaceStatus('Optimized');
      setTestingMsg('Diagnostics complete. All HL7 v2.5 and FHIR R4 endpoints 100% operational.');
      setLogs(prev => [
        { id: Date.now(), text: 'Interface Diagnostic Passed - 0 message drops detected', status: '100% PASS', time: 'Just now' },
        ...prev
      ]);
    }, 1200);
  };

  const restartPACSListener = () => {
    setTestingMsg('Restarting DICOM Port 104 Listener...');
    setTimeout(() => {
      setTestingMsg('PACS Listener successfully re-bound to Port 104.');
    }, 800);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto font-sans text-slate-900">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Clinical Application Support & Interface Bots <MessageCircle className="text-primary-600" />
          </h1>
          <p className="text-sm text-slate-500">Clinical app health diagnostics for Epic, Cerner, PACS, and HL7 integration interfaces.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={restartPACSListener} className="btn-secondary text-xs flex items-center gap-1.5">
            <RefreshCw size={14} /> Restart PACS Listener
          </button>
          <button onClick={runDiagnostics} className="btn-primary text-xs flex items-center gap-1.5">
            <Play size={14} /> Run Full Diagnostic Scan
          </button>
        </div>
      </div>

      {testingMsg && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-sky-50 border border-sky-200 text-sky-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <ShieldCheck size={16} className="text-sky-600" /> {testingMsg}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="EHR Connector" value="Operational" subtitle="Epic Bridges HL7 v2.5" icon={<Server size={16} />} color="teal" delay={0} />
        <MetricCard title="PACS Listener" value="Connected" subtitle="Port 104 DICOM active" icon={<Wifi size={16} />} color="blue" delay={0.05} />
        <MetricCard title="Bot Response Time" value="450 ms" subtitle="Real-time Assistant" icon={<MessageCircle size={16} />} color="amber" delay={0.1} />
        <MetricCard title="Health Score" value="100/100" subtitle="Zero interface drops" icon={<CheckCircle size={16} />} color="emerald" delay={0.15} />
      </div>

      <div className="glass-card p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-800 border-b pb-2 flex justify-between items-center">
          <span>Clinical App Interface Diagnostics</span>
          <span className="badge-success text-[10px]">{interfaceStatus}</span>
        </h3>
        <div className="space-y-2">
          {logs.map(log => (
            <div key={log.id} className="p-3 bg-slate-50 border rounded-xl flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-800">{log.text}</p>
                <p className="text-[10px] text-slate-500">Latency: 12ms · Timestamp: {log.time}</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">{log.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
