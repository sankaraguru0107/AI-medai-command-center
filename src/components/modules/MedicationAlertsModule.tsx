import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pill, AlertTriangle, CheckCircle, Shield, Brain, Activity, Clock,
  Users, Trash2, X, Plus, Search, RefreshCw, Download, Printer,
  Layers, Info, FileText, Check, Database, Sparkles, Layout, MessageSquare, AlertCircle
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { TrendChart, BedOccupancyChart, ClaimsDistribution } from '../charts';
import { askMedAI } from '../../services/azureOpenAI';

interface PharmacyOrder {
  id: string;
  patient: string;
  ward: string;
  medication: string;
  dose: string;
  risk: 'Critical' | 'High' | 'Moderate' | 'Low';
  status: 'Pending Verification' | 'Clarification Required' | 'Approved' | 'Rejected';
  time: string;
  doctor: string;
}

const mockOrders: PharmacyOrder[] = [
  { id: 'RX-8402', patient: 'James Wilson', ward: 'ICU-4B', medication: 'Amoxicillin-Clavulanate', dose: '875/125 mg BID', risk: 'Critical', status: 'Pending Verification', time: '2m ago', doctor: 'Dr. Emily Chen' },
  { id: 'RX-8401', patient: 'Elena Rostova', ward: 'ICU-04', medication: 'Midazolam Infusion', dose: '5 mg/hr', risk: 'High', status: 'Pending Verification', time: '6m ago', doctor: 'Dr. Sarah Jenkins' },
  { id: 'RX-8399', patient: 'Robert Vance', ward: 'ICU-12', medication: 'Propofol Infusion', dose: '45 mcg/kg/min', risk: 'Moderate', status: 'Approved', time: '14m ago', doctor: 'Dr. Marcus Vance' },
  { id: 'RX-8395', patient: 'Sarah Chen', ward: 'MS-6A', medication: 'Insulin Glargine', dose: '20 units QHS', risk: 'High', status: 'Clarification Required', time: '32m ago', doctor: 'Dr. James Park' }
];

export const MedicationAlertsModule: React.FC = () => {
  const [orders, setOrders] = useState<PharmacyOrder[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<PharmacyOrder>(mockOrders[0]);

  // Operations and toasts states
  const [liveTime, setLiveTime] = useState(new Date().toLocaleTimeString());
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // AI assistant drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Tab queues
  const [activeQueue, setActiveQueue] = useState<'Pending' | 'Controlled' | 'All'>('Pending');

  const triggerToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const askAiPharmacist = async (queryText?: string) => {
    const text = queryText || aiPrompt;
    if (!text.trim()) return;
    setAiLoading(true);
    setAiPrompt('');
    setDrawerOpen(true);
    try {
      const resp = await askMedAI(
        `Pharmacy safety control panel. Patient: ${selectedOrder.patient}, prescribed ${selectedOrder.medication}. Query: ${text}`,
        'pharmacy'
      );
      setAiResponse(resp);
    } catch {
      setAiResponse('Unable to connect to Azure OpenAI Pharmacy Intelligence network.');
    } finally {
      setAiLoading(false);
    }
  };

  const updateOrderStatus = (id: string, status: PharmacyOrder['status']) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    triggerToast(`Order ${id} status updated to: ${status}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto relative">
      {/* Toast Notice */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 right-6 z-50 p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={16} /> {actionNotice}
            </div>
            <button onClick={() => setActionNotice(null)}>
              <X size={14} className="ml-2" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Medication Safety Intelligence Center <Pill className="text-rose-600" />
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Enterprise Pharmacy Safety Control Center for real-time drug risk auditing, barcode verification compliance, and look-alike sound-alike (LASA) monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDrawerOpen(true)} className="btn-primary text-xs flex items-center gap-1.5 shadow-md shadow-primary-500/20">
            <MessageSquare size={14} />
            <span>AI Pharmacy Copilot</span>
          </button>
          <button onClick={() => triggerToast('Synced with hospital Pyxis medication stock')} className="btn-secondary text-xs flex items-center gap-1.5">
            <RefreshCw size={13} />
            <span>Sync Pyxis Inventory</span>
          </button>
        </div>
      </div>

      {/* Zone 1: Executive Pharmacy Safety Overview */}
      <div className="glass-card p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-bold">SAFETY COMPLIANT</span>
            <span className="text-[10px] text-slate-400">EPIC Willow Pharmacy Sync Status: Active</span>
          </div>
          <h2 className="text-lg font-bold font-display text-white">Pharmacy Safety Score: 98.6%</h2>
          <p className="text-xs text-slate-300">Errors prevented today: 14 near-misses. Zero adverse drug events recorded in this shift.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 bg-white/10 border border-white/10 rounded-xl text-center">
            <div className="font-bold text-rose-400">0 Errors</div>
            <div className="text-[9px] text-slate-400">Adverse Events</div>
          </div>
          <div className="p-2.5 bg-white/10 border border-white/10 rounded-xl text-center">
            <div className="font-bold text-amber-400">4 Active</div>
            <div className="text-[9px] text-slate-400">High Alert Meds</div>
          </div>
          <div className="p-2.5 bg-white/10 border border-white/10 rounded-xl text-center">
            <div className="font-bold text-teal-400">99.4%</div>
            <div className="text-[9px] text-slate-400">Barcode Verification</div>
          </div>
          <div className="p-2.5 bg-white/10 border border-white/10 rounded-xl text-center">
            <div className="font-bold text-primary-400">95% AI</div>
            <div className="text-[9px] text-slate-400">Safety Confidence</div>
          </div>
        </div>
      </div>

      {/* Grid Zone Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Work Queue & Department Heat Map (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Department Heat Map */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
              <Layout size={16} className="text-primary-600" /> Medication Safety Heat Map
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { name: 'Emergency Triage', risk: 'High Risk', meds: '32 Orders', status: 'rose' },
                { name: 'Intensive Care (ICU)', risk: 'Critical', meds: '18 Orders', status: 'rose' },
                { name: 'Operating Theatre', risk: 'Normal Flow', meds: '5 Orders', status: 'emerald' },
                { name: 'Medical/Surgical', risk: 'Warning', meds: '42 Orders', status: 'amber' },
              ].map(dept => (
                <div key={dept.name} className={`p-3 rounded-xl border ${
                  dept.status === 'rose' ? 'bg-rose-50 border-rose-200 text-rose-900' : dept.status === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="font-bold">{dept.name}</div>
                  <div className="text-[10px] opacity-80 mt-1">{dept.risk} · {dept.meds}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pharmacy Queue */}
          <div className="glass-card p-5 space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                <Clock size={16} className="text-teal-600" /> Pharmacy Work Queue
              </h3>
              <div className="flex gap-1.5 text-[10px] font-bold">
                <button onClick={() => setActiveQueue('Pending')} className={`px-2 py-0.5 rounded ${activeQueue === 'Pending' ? 'bg-primary-650 text-primary-700 border' : 'bg-slate-100 text-slate-500'}`}>Pending</button>
                <button onClick={() => setActiveQueue('All')} className={`px-2 py-0.5 rounded ${activeQueue === 'All' ? 'bg-primary-650 text-primary-700 border' : 'bg-slate-100 text-slate-500'}`}>All</button>
              </div>
            </div>

            <div className="space-y-2">
              {orders.filter(o => activeQueue === 'All' || o.status === 'Pending Verification').map(order => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedOrder.id === order.id ? 'bg-primary-50 border-primary-300' : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex justify-between font-bold text-xs">
                    <span className="text-slate-800">{order.medication}</span>
                    <span className={`px-2 py-0.2 rounded text-[9px] font-bold ${
                      order.risk === 'Critical' ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-amber-100 text-amber-800'
                    }`}>{order.risk}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
                    <span>{order.patient} ({order.ward})</span>
                    <span className="font-mono">{order.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Order Audit & Barcode verification (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Order Details & Pharmacist Audit Panel */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Shield size={16} className="text-primary-600" /> Pharmacist Order Verification Audit
                </h3>
                <p className="text-xs text-slate-400">Order ID: <span className="font-bold text-slate-800">{selectedOrder.id}</span> · Prescribed by: {selectedOrder.doctor}</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                selectedOrder.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>{selectedOrder.status}</span>
            </div>

            <div className="p-4 bg-slate-50 border rounded-xl space-y-3 text-xs">
              <div className="flex justify-between items-center font-bold text-slate-800">
                <span>Patient: {selectedOrder.patient} ({selectedOrder.ward})</span>
                <span className="text-primary-600">{selectedOrder.medication}</span>
              </div>

              <div className="text-[11px] text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800 block mb-0.5">Clinical Dosing & Parameters:</span>
                Dose prescribed: {selectedOrder.dose} · Kidney Clearance: eGFR 42 mL/min · Liver Status: Normal child-pugh class.
              </div>

              {/* Barcode medication administration timeline */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block mb-3">Barcode Verification Progress Log</span>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold relative">
                  <div className="absolute left-0 right-0 h-0.5 bg-slate-200 -z-10 top-2" />
                  <div className="flex flex-col items-center bg-white px-1">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[9px]"><Check size={8} /></span>
                    <span className="mt-1">Prescribed</span>
                  </div>
                  <div className="flex flex-col items-center bg-white px-1">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[9px]"><Check size={8} /></span>
                    <span className="mt-1">Verified</span>
                  </div>
                  <div className="flex flex-col items-center bg-white px-1">
                    <span className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-white text-[9px]"><Clock size={8} /></span>
                    <span className="mt-1">Barcode Scan</span>
                  </div>
                  <div className="flex flex-col items-center bg-white px-1 opacity-40">
                    <span className="w-4 h-4 rounded-full bg-slate-350" />
                    <span className="mt-1">Administered</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => updateOrderStatus(selectedOrder.id, 'Clarification Required')}
                className="btn-secondary text-xs flex items-center gap-1.5 text-amber-700"
              >
                Request Clarification
              </button>
              <button
                onClick={() => updateOrderStatus(selectedOrder.id, 'Rejected')}
                className="btn-secondary text-xs flex items-center gap-1.5 text-rose-700"
              >
                Reject Order
              </button>
              <button
                onClick={() => updateOrderStatus(selectedOrder.id, 'Approved')}
                className="btn-primary text-xs flex items-center gap-1.5 bg-emerald-600 border-none shadow-md shadow-emerald-500/20"
              >
                Verify & Approve Order
              </button>
            </div>
          </div>

          {/* High-Alert medications Stock & Recalls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-5 space-y-3">
              <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
                <AlertTriangle size={16} className="text-rose-600 animate-pulse" /> High Alert Medications
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Insulin Glargine', status: 'Continuous Monitoring', stock: '24 units' },
                  { name: 'Unfractionated Heparin', status: 'Barcode scan check', stock: '5000 units' },
                  { name: 'Fentanyl IV Infusion', status: 'Dual nurse signoff', stock: '250mcg' },
                ].map(med => (
                  <div key={med.name} className="flex justify-between items-center py-1 border-b">
                    <div>
                      <span className="font-bold text-slate-800">{med.name}</span>
                      <span className="text-[10px] text-slate-400 block">{med.status}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-600">{med.stock}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5 space-y-3">
              <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2 border-b pb-2">
                <AlertCircle size={16} className="text-amber-500" /> Active Medication Recalls
              </h3>
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-900 rounded-xl text-xs space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <AlertTriangle size={14} className="text-rose-600" /> Batch Recall: Lot #MA-4820
                </div>
                <p className="text-[11px] leading-relaxed">
                  Manufacturer recall issued for generic Albuterol solution. Remove all lot batch units from ICU and ER Pyxis machines immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible AI assistant Drawer (Right Side) */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 p-6"
            >
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                      <Brain size={18} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-slate-900 text-sm">Pharmacy AI Assistant</h3>
                      <p className="text-[10px] text-slate-400">ACPE Clinical Pharmacology Library</p>
                    </div>
                  </div>
                  <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Pharmacist Queries</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Explain drug recall procedure',
                      'Suggest alternative for Penicillin allergy',
                      'Summarize pharmacy pending orders queue',
                      'Check interaction for Warfarin + Aspirin'
                    ].map(q => (
                      <button
                        key={q}
                        onClick={() => askAiPharmacist(q)}
                        className="px-2.5 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-left text-[11px] font-medium transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {aiLoading && (
                    <div className="p-4 bg-slate-50 border rounded-xl flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      Auditing medication safety parameters...
                    </div>
                  )}

                  {aiResponse && !aiLoading && (
                    <div className="p-4 bg-primary-50/50 border border-primary-100 rounded-xl space-y-2 text-xs">
                      <span className="font-bold text-primary-900 block">AI Clinical Response:</span>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line text-[11px]">{aiResponse}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && askAiPharmacist()}
                    placeholder="Ask Pharmacy AI about drug limits, safety, recalls..."
                    className="input-field text-xs flex-1"
                  />
                  <button onClick={() => askAiPharmacist()} disabled={aiLoading || !aiPrompt.trim()} className="btn-primary text-xs px-3">
                    Ask
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
