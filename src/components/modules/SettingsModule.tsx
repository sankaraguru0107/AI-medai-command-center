import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Shield, Sliders, Bell, Brain, Database, User, Key, RefreshCw, CheckCircle, Save, Lock, Eye, AlertCircle
} from 'lucide-react';
import { useAppStore, UserRole } from '../../store/appStore';

export const SettingsModule: React.FC = () => {
  const { user, setUser, addNotification } = useAppStore();
  const [activeTab, setActiveTab] = useState<'general' | 'roles' | 'ai' | 'notifications' | 'security'>('general');

  // Interactive settings state
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'admin');
  const [userName, setUserName] = useState(user?.name || 'Administrator');
  const [userEmail, setUserEmail] = useState(user?.email || 'admin@medresilience.ai');

  // Feature Toggles
  const [allModulesUnlocked, setAllModulesUnlocked] = useState(true);
  const [autoRiskAnalysis, setAutoRiskAnalysis] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [realtimeTelemetry, setRealtimeTelemetry] = useState(true);
  const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState(85);
  const [emergencyOverride, setEmergencyOverride] = useState(false);
  const [hipaaAuditLogging, setHipaaAuditLogging] = useState(true);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleSaveSettings = () => {
    setUser({
      id: user?.id || 'usr-1',
      name: userName,
      email: userEmail,
      role: selectedRole,
    });
    setSaveNotice('Settings updated successfully!');
    addNotification({
      id: `notif-${Date.now()}`,
      title: 'Settings Updated',
      body: `System preferences saved. Current role set to ${selectedRole.toUpperCase()}.`,
      type: 'update',
      timestamp: new Date(),
      read: false,
    });
    setTimeout(() => setSaveNotice(null), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto text-slate-900 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            System & Command Hub Settings <Settings className="text-primary-600 animate-spin-slow" />
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure MedResilience AI operational parameters, user roles, AI copilot thresholds, and security controls.
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="btn-primary text-xs flex items-center gap-2 px-5 py-2.5 shadow-md shadow-primary-500/20"
        >
          <Save size={15} />
          <span>Save Changes</span>
        </button>
      </div>

      {saveNotice && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs"
        >
          <CheckCircle size={16} className="text-emerald-600" />
          <span>{saveNotice}</span>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        {[
          { id: 'general', label: 'General & Profile', icon: User },
          { id: 'roles', label: 'Role & Module Access', icon: Shield },
          { id: 'ai', label: 'AI Copilot Engine', icon: Brain },
          { id: 'notifications', label: 'Alerts & Telemetry', icon: Bell },
          { id: 'security', label: 'Security & HIPAA Audit', icon: Lock },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-primary-600 text-primary-600 bg-primary-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: General */}
      {activeTab === 'general' && (
        <div className="glass-card p-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
            <User size={16} className="text-primary-600" /> User Profile & System Preferences
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="input-field text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                className="input-field text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-800">Operational Mode Switches</h4>
            
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border rounded-xl">
              <div>
                <strong className="text-xs text-slate-800 block">Unlock All Command Hub Modules</strong>
                <span className="text-[11px] text-slate-500">Enable full visibility across all 40+ clinical and operational modules regardless of role.</span>
              </div>
              <button
                onClick={() => setAllModulesUnlocked(!allModulesUnlocked)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${allModulesUnlocked ? 'bg-primary-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${allModulesUnlocked ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 border rounded-xl">
              <div>
                <strong className="text-xs text-slate-800 block">Emergency Surge Protocol Mode</strong>
                <span className="text-[11px] text-slate-500">Auto-elevates priority alerts and activates regional disaster capacity tools.</span>
              </div>
              <button
                onClick={() => setEmergencyOverride(!emergencyOverride)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${emergencyOverride ? 'bg-rose-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${emergencyOverride ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Role Access */}
      {activeTab === 'roles' && (
        <div className="glass-card p-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
            <Shield size={16} className="text-primary-600" /> Active Role & Privileges
          </h3>
          <p className="text-xs text-slate-500">Select a role to test role-specific dashboard views and feature permissions:</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'admin', title: 'System Administrator', desc: 'Full access to all command center modules, settings, and SOC security panels.' },
              { id: 'doctor', title: 'Attending Physician', desc: 'Access to clinical AI, EHR summaries, patient registry, diagnostics, and prescriptions.' },
              { id: 'nurse', title: 'Clinical Nurse Lead', desc: 'Focus on nurse call system, vitals monitoring, bed management, and medication alerts.' },
              { id: 'operations', title: 'Operations Commander', desc: 'Focus on AIVerse supply chain, hospital capacity, patient flow, and transfers.' },
              { id: 'patient', title: 'Patient Portal', desc: 'Access to personal medical passport, care plans, discharge instructions, and chatbot.' },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r.id as UserRole)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  selectedRole === r.id
                    ? 'bg-primary-50 border-primary-500 ring-2 ring-primary-500/20'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-xs font-bold text-slate-900">{r.title}</strong>
                  {selectedRole === r.id && <CheckCircle size={14} className="text-primary-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{r.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: AI Engine */}
      {activeTab === 'ai' && (
        <div className="glass-card p-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
            <Brain size={16} className="text-primary-600" /> Medii Intelligence Copilot Configuration
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800">AI Recommendation Confidence Threshold</label>
                <span className="text-xs font-mono font-bold text-primary-600">{aiConfidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={aiConfidenceThreshold}
                onChange={e => setAiConfidenceThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <p className="text-[11px] text-slate-500">Only AI insights with confidence equal or higher than this threshold will trigger auto-recommendation cards.</p>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 border rounded-xl">
              <div>
                <strong className="text-xs text-slate-800 block">Automated Predictive Risk Scanning</strong>
                <span className="text-[11px] text-slate-500">Continuously evaluate patient vitals for early sepsis and readmission risk.</span>
              </div>
              <button
                onClick={() => setAutoRiskAnalysis(!autoRiskAnalysis)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${autoRiskAnalysis ? 'bg-primary-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoRiskAnalysis ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Notifications */}
      {activeTab === 'notifications' && (
        <div className="glass-card p-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
            <Bell size={16} className="text-primary-600" /> Notifications & Telemetry Subscriptions
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border rounded-xl">
              <div>
                <strong className="text-xs text-slate-800 block">Real-time Audio Alert Chimes</strong>
                <span className="text-[11px] text-slate-500">Play auditory alert sound when critical vitals or stock-out alerts arrive.</span>
              </div>
              <button
                onClick={() => setSoundAlerts(!soundAlerts)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${soundAlerts ? 'bg-primary-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${soundAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 border rounded-xl">
              <div>
                <strong className="text-xs text-slate-800 block">Supabase Realtime Feed Subscriptions</strong>
                <span className="text-[11px] text-slate-500">Enable WebSocket streaming for live bed occupancy and telemetry updates.</span>
              </div>
              <button
                onClick={() => setRealtimeTelemetry(!realtimeTelemetry)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${realtimeTelemetry ? 'bg-primary-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${realtimeTelemetry ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Security */}
      {activeTab === 'security' && (
        <div className="glass-card p-6 space-y-6">
          <h3 className="text-sm font-bold text-slate-900 border-b pb-2 flex items-center gap-2">
            <Lock size={16} className="text-primary-600" /> Security Controls & HIPAA Compliance Audit
          </h3>

          <div className="p-4 bg-slate-50 border rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <strong className="text-xs text-slate-800">HIPAA Audit Trail Verification</strong>
              <span className="badge-success text-[10px]">Active & Verified</span>
            </div>
            <p className="text-[11px] text-slate-500">All PHI access, prescription orders, and AI copilot queries are cryptographically signed and logged.</p>
            <div className="flex gap-2">
              <button
                onClick={() => addNotification({ id: `audit-${Date.now()}`, title: 'Audit Exported', body: 'HIPAA compliance log generated.', type: 'update', timestamp: new Date(), read: false })}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Export Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
