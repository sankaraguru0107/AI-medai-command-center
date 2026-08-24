import React, { useEffect, useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bed,
  Bell,
  Bot,
  CheckCircle2,
  Cpu,
  Database,
  Download,
  Flame,
  GitCompare,
  LayoutGrid,
  LineChart,
  LogOut,
  MapPin,
  Package,
  Pill,
  Radio,
  RefreshCw,
  Rocket,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  Sliders,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Truck,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useHackathonStore } from '../../store/hackathonStore';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', path: '/hackathon/dashboard', icon: LayoutGrid },
  { label: 'Health Network', path: '/hackathon/network', icon: MapPin },
  { label: 'Bed Intelligence', path: '/hackathon/beds', icon: Bed },
  { label: 'Medicine Intelligence', path: '/hackathon/medicines', icon: Pill, badge: 'Risk' },
  { label: 'Staff Intelligence', path: '/hackathon/staff', icon: Users },
  { label: 'Demand Forecast', path: '/hackathon/forecast', icon: LineChart },
  { label: 'Supply Chain', path: '/hackathon/supply-chain', icon: Truck },
  { label: 'AI Redistribution', path: '/hackathon/redistribution', icon: RefreshCw, badge: 'AI' },
  { label: 'Alerts', path: '/hackathon/alerts', icon: Bell, badge: '3' },
  { label: 'AI Assistant', path: '/hackathon/assistant', icon: Bot },
  { label: 'Emergency Center', path: '/hackathon/emergency', icon: Flame },
  { label: 'Analytics', path: '/hackathon/analytics', icon: BarChart3 },
];

export const HackathonLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isHackathonAuthenticated,
    hackathonUser,
    logoutHackathon,
    loginHackathon,
    isSimulating,
    simulationStep,
    setSimulationStep,
    runSimulation,
    resetSimulation,
    notifications,
    addToastNotification,
    removeToastNotification,
  } = useHackathonStore();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Admin & Settings State
  const [activeRole, setActiveRole] = useState(hackathonUser?.role || 'Hackathon Admin');
  const [aiEngine, setAiEngine] = useState('Azure OpenAI (GPT-4o)');
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState('3s');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
          ' IST'
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isHackathonAuthenticated) {
    return <Navigate to="/hackathon/login" replace />;
  }

  const handleLogout = () => {
    addToastNotification('Logged Out', 'You have been logged out of MedResilience AI.', 'info');
    logoutHackathon();
    navigate('/hackathon/login');
  };

  const handleRoleChange = (role: string) => {
    setActiveRole(role);
    loginHackathon(hackathonUser?.email || 'hackathon@medresilience.ai', role);
    addToastNotification('Evaluator Role Updated', `Active role switched to: ${role}`, 'success');
  };

  const handleExportAudit = () => {
    addToastNotification(
      'Audit Trail Exported',
      'MedResilience_Audit_Report_2026.pdf generated with cryptographic signature.',
      'success'
    );
  };

  const handleSaveSettings = () => {
    addToastNotification(
      'System Settings Saved',
      `Engine: ${aiEngine} | Threshold: ${confidenceThreshold}% | Sync: ${autoRefreshInterval}`,
      'success'
    );
    setShowSettingsModal(false);
  };

  return (
    <div className={`flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden ${highContrast ? 'contrast-125' : ''}`}>
      {/* Toast Notifications Overlay */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-xl backdrop-blur-xl flex items-start gap-3 ${
              n.type === 'critical'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : n.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : n.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-sky-50 border-sky-200 text-sky-900'
            }`}
          >
            <div className="p-2 rounded-xl bg-white shrink-0 shadow-sm">
              {n.type === 'critical' || n.type === 'warning' ? (
                <AlertTriangle size={18} className="text-amber-600" />
              ) : (
                <Sparkles size={18} className="text-sky-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold leading-tight">{n.title}</h4>
              <p className="text-[11px] opacity-90 mt-0.5 leading-snug">{n.message}</p>
            </div>
            <button
              onClick={() => removeToastNotification(n.id)}
              className="text-slate-400 hover:text-slate-600 shrink-0 p-1"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Light Theme Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-20 shadow-sm">
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-primary-600 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0 ring-2 ring-white">
              <Activity size={22} className="text-white animate-pulse" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-display font-black tracking-tight text-slate-900 truncate">
                MedResilience AI
              </h2>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-sky-700 block mt-0.5">
                HEALTH RESILIENCE
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Command Center Modules
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/20 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500'} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-black rounded-md ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'Risk'
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : item.badge === 'AI'
                        ? 'bg-sky-100 text-sky-700 border border-sky-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Bottom Items (SYSTEM ADMIN ENABLED) */}
        <div className="p-3 border-t border-slate-100 space-y-1 bg-slate-50/50">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            SYSTEM ADMIN
          </div>
          <button
            onClick={() => setShowAdminModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <Shield size={15} className="text-sky-600" />
            <span>Hackathon Admin</span>
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <Settings size={15} className="text-slate-500" />
            <span>Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors mt-1 cursor-pointer"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {/* Top Header */}
        <header className="h-16 bg-white/90 border-b border-slate-200 px-6 flex items-center justify-between shrink-0 backdrop-blur-md z-10 shadow-sm">
          {/* Header Left Title & Clock */}
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 tracking-wide">
                  MedResilience AI Command Hub
                </h1>
                <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Operational
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">{currentTime}</p>
            </div>
          </div>

          {/* Header Right Actions & Simulation Launcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={runSimulation}
                disabled={isSimulating}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                  isSimulating
                    ? 'bg-amber-600 text-white animate-pulse'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-orange-500/20 hover:scale-[1.02]'
                }`}
              >
                <Rocket size={15} className={isSimulating ? 'animate-bounce' : ''} />
                <span>
                  {isSimulating
                    ? `Simulating Phase ${simulationStep}/9...`
                    : '🚀 Run Emergency Simulation'}
                </span>
              </button>

              {isSimulating && (
                <button
                  onClick={resetSimulation}
                  className="px-2.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 my-auto mx-1" />

            {/* User Profile (Clickable to open Admin) */}
            <button
              onClick={() => setShowAdminModal(true)}
              className="flex items-center gap-2.5 pl-1 hover:opacity-80 transition-opacity cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-sm ring-2 ring-sky-100">
                HE
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {hackathonUser?.name || 'Hackathon Evaluator'}
                </div>
                <div className="text-[10px] text-sky-700 font-semibold leading-tight">
                  {hackathonUser?.role || activeRole}
                </div>
              </div>
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin bg-slate-50">
          <Outlet />
        </main>
      </div>

      {/* HACKATHON ADMIN MODAL */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl relative text-slate-900"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-sky-100 text-sky-700">
                    <Shield size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-extrabold text-slate-900">
                      Hackathon System Admin Control
                    </h3>
                    <p className="text-xs text-slate-500">
                      MedResilience AI Evaluation Controls & Simulation Overrides
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAdminModal(false)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500"
                >
                  <X size={18} />
                </button>
              </div>

              {/* System Health */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-bold">AI Copilot</span>
                    <Server size={14} className="text-emerald-600" />
                  </div>
                  <div className="text-xs font-black text-slate-900">Azure OpenAI GPT-4o</div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-0.5">● Connected (18ms)</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-bold">Prediction ML</span>
                    <Cpu size={14} className="text-sky-600" />
                  </div>
                  <div className="text-xs font-black text-slate-900">Stock-out ML Engine</div>
                  <div className="text-[10px] text-sky-600 font-bold mt-0.5">● 94% Confidence</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-bold">FHIR Interop</span>
                    <Database size={14} className="text-indigo-600" />
                  </div>
                  <div className="text-xs font-black text-slate-900">2,438 PHC Nodes</div>
                  <div className="text-[10px] text-indigo-600 font-bold mt-0.5">● Synced Real-time</div>
                </div>
              </div>

              {/* Evaluator Role Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Switch Evaluator Role Perspective
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    'Hackathon Admin',
                    'Chief Medical Officer',
                    'Regional Health Director',
                  ].map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        activeRole === role
                          ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-500/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <UserCheck size={14} />
                        {activeRole === role && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <span>{role}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulation Quick Jump */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Emergency Simulation Phase Override
                  </label>
                  <span className="text-xs text-slate-500">Current: Phase {simulationStep}/9</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      runSimulation();
                      setShowAdminModal(false);
                    }}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Rocket size={14} />
                    <span>Run Full Simulation</span>
                  </button>
                  <button
                    onClick={() => {
                      setSimulationStep(4);
                      addToastNotification('Phase 4 Forced', 'Jumped to Phase 4: AI Early Warning Risk Scan.', 'warning');
                      setShowAdminModal(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                  >
                    Jump to Risk Scan (Ph 4)
                  </button>
                  <button
                    onClick={() => {
                      resetSimulation();
                      addToastNotification('Reset Baseline', 'Metrics reset to normal baseline.', 'info');
                    }}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                  >
                    Reset Baseline (Ph 1)
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={handleExportAudit}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2"
                >
                  <Download size={14} />
                  <span>Export Compliance Audit PDF</span>
                </button>
                <button
                  onClick={() => setShowAdminModal(false)}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SYSTEM SETTINGS MODAL */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xl w-full space-y-6 shadow-2xl relative text-slate-900"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-700">
                    <Settings size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-extrabold text-slate-900">
                      Command Center Preferences
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure AI Copilot, telemetry sync, and display parameters
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Settings Form */}
              <div className="space-y-4 text-xs">
                {/* AI Model Selection */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">AI Intelligence Model Engine</label>
                  <select
                    value={aiEngine}
                    onChange={(e) => setAiEngine(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                  >
                    <option value="Azure OpenAI (GPT-4o)">Azure OpenAI (GPT-4o) — High Performance</option>
                    <option value="Med-PaLM 2 / Gemini Pro">Med-PaLM 2 / Gemini Pro — Healthcare Tuned</option>
                    <option value="Edge AI Local Model">Edge AI Local Offline Engine (Privacy Preserved)</option>
                  </select>
                </div>

                {/* Risk Confidence Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">AI Stock-out Alert Confidence Threshold</label>
                    <span className="font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {confidenceThreshold}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="70"
                    max="95"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                  <p className="text-[10px] text-slate-500">Alerts below this threshold will be categorized as advisory rather than critical.</p>
                </div>

                {/* Auto Refresh */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Live Telemetry Sync Interval</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['1s', '3s', '5s', 'Manual'].map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => setAutoRefreshInterval(speed)}
                        className={`p-2.5 rounded-xl border font-bold text-center transition-all ${
                          autoRefreshInterval === speed
                            ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {speed}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display Toggles */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">High Contrast Emergency Mode</div>
                      <div className="text-[10px] text-slate-500">Enhance clarity for low-light command rooms</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHighContrast(!highContrast)}
                      className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                        highContrast ? 'bg-sky-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          highContrast ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Audio Alert Notifications</div>
                      <div className="text-[10px] text-slate-500">Play subtle chime when critical stock-out detected</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                        soundEnabled ? 'bg-sky-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          soundEnabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Save */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-500/20"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
