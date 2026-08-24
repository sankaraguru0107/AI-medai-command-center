import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Bed, BarChart3, Clock, Database, TrendingUp, TrendingDown,
  Users, Zap, Shield, AlertTriangle, CheckCircle2, RefreshCw, Filter,
  ArrowUpRight, ArrowDownRight, Layers, Radio, Sparkles, Building2,
  ChevronRight, ChevronDown, Search, X, Check, FileText, Send, PhoneCall, Cpu,
  MapPin, ShieldAlert, ShieldCheck, Flame, Navigation, Truck, Package,
  AlertCircle, Compass, Play, RotateCcw, ArrowRight, Eye, SlidersHorizontal,
  Bell, User, Settings, CheckSquare, Info, Sliders, ExternalLink
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useAppStore } from '../../store/appStore';
import { useOpsSupplyChainStore } from '../../store/opsSupplyChainStore';
import {
  FacilityNode, InventoryItem, StockOutPrediction, ResourceTransfer,
  OperationalFeedEvent, AlertIncident, FacilityStatus, ResourceRisk
} from '../../types/opsSupplyChain';

type AIVerseNav =
  | 'overview'
  | 'patient-flow'
  | 'capacity'
  | 'workforce'
  | 'inventory'
  | 'supply-chain'
  | 'transfers'
  | 'forecasts'
  | 'recommendations'
  | 'analytics'
  | 'alerts'
  | 'network'
  | 'settings'
  | 'emergency'
  | 'activity';

export const OperationsDashboard: React.FC = () => {
  const { user, setActiveDashboard, setAIPanelOpen } = useAppStore();
  const {
    facilities, selectedFacility, setSelectedFacility, inventoryItems,
    stockOutPredictions, transfers, feedEvents, alerts, forecastTimeframe,
    setForecastTimeframe, forecastData, aiInsights, isEmergencyMode,
    toggleEmergencyMode, isDemoScenarioRunning, demoStepIndex, demoLog,
    runDemoScenario, resetDemoScenario, acceptTransferRecommendation,
    updateTransferStatus, acknowledgeAlert, resolveAlert
  } = useOpsSupplyChainStore();

  const [currentNav, setCurrentNav] = useState<AIVerseNav>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [overviewTrendTab, setOverviewTrendTab] = useState<'Patients' | 'Capacity' | 'Utilization'>('Patients');
  const [selectedRecommendation, setSelectedRecommendation] = useState<StockOutPrediction | null>(null);
  const [selectedInventoryDetail, setSelectedInventoryDetail] = useState<InventoryItem | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Sidebar Collapsible State
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    operations: true,
    resources: true,
    intelligence: true,
  });

  const toggleSidebarGroup = (grp: string) => {
    setExpandedGroups(prev => ({ ...prev, [grp]: !prev[grp] }));
  };

  // Telemetry Clock
  const [currentTime, setCurrentTime] = useState<string>('09:57 AM');
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3000);
  };

  // Top 3-5 Needs Attention Items
  const needsAttentionItems = useMemo(() => {
    return [
      {
        id: 'att-1',
        title: 'ICU Capacity Warning',
        facility: 'PHC Coimbatore-021',
        metric: '93% occupied',
        impact: 'Critical in ~8 hours',
        severity: 'Critical',
        actionLabel: 'View →',
        targetNav: 'capacity' as AIVerseNav,
      },
      {
        id: 'att-2',
        title: 'Oxygen Stock Depletion',
        facility: 'PHC Madurai-014',
        metric: '1.7 days remaining',
        impact: 'Consumption +23%',
        severity: 'High',
        actionLabel: 'Review →',
        targetNav: 'recommendations' as AIVerseNav,
      },
      {
        id: 'att-3',
        title: 'Staff Coverage Deficit',
        facility: 'ICU — Regional Cluster 03',
        metric: 'Coverage 87%',
        impact: 'Next shift risk',
        severity: 'Warning',
        actionLabel: 'View →',
        targetNav: 'workforce' as AIVerseNav,
      },
    ];
  }, []);

  // Filtered Inventory Ledger Table
  const filteredInventoryTable = useMemo(() => {
    return inventoryItems.filter(inv =>
      inv.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.facilityName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventoryItems, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-xl border border-slate-700"
          >
            <CheckCircle2 size={16} className="text-emerald-400" /> {toastNotice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. ENTERPRISE APPLICATION HEADER */}
      <header className="bg-white border-b border-slate-200/90 px-6 py-3 sticky top-0 z-30 flex items-center justify-between shadow-xs">
        {/* Left Product Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-extrabold font-display text-xs shadow-xs">
            AI
          </div>
          <div>
            <div className="font-display font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-2">
              AIVerse <span className="text-slate-400 font-normal">|</span> Operations Center
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Healthcare Operations Intelligence</p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative max-w-md w-full mx-6 hidden md:block">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search facilities, patients, resources..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 rounded-xl text-xs border border-transparent focus:border-primary-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>● Operational</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium">Updated 24 sec ago</span>
          </div>

          <button
            onClick={() => {
              if (isDemoScenarioRunning) {
                resetDemoScenario();
                triggerToast('Reset Scenario');
              } else {
                runDemoScenario();
                triggerToast('Executing AIVerse Intelligence Flow...');
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isDemoScenarioRunning ? <RotateCcw size={14} /> : <Play size={14} />}
            <span>{isDemoScenarioRunning ? 'Reset Scenario' : 'Demo Flow'}</span>
          </button>

          <button onClick={() => setAIPanelOpen(true)} className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100" title="Medii AI Assistant">
            <Sparkles size={16} className="text-primary-600" />
          </button>

          <button className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 relative">
            <Bell size={16} />
            {alerts.filter(a => a.status === 'Active').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-600 absolute top-1.5 right-1.5" />
            )}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {user?.name?.[0] || 'O'}
            </div>
          </div>
        </div>
      </header>

      {/* 2. EMERGENCY INCIDENT ALERT STRIP (ONLY WHEN INCIDENT IS ACTIVE) */}
      {isEmergencyMode && (
        <div className="bg-rose-600 text-white px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b border-rose-700 shadow-md">
          <div className="flex items-center gap-2">
            <Flame size={16} className="animate-bounce" />
            <span><strong>ACTIVE INCIDENT</strong> — 3 regional facilities affected — High surge pressure on oxygen & ICU capacity</span>
          </div>
          <button
            onClick={() => setCurrentNav('emergency')}
            className="px-3 py-1 rounded-lg bg-white text-rose-700 font-bold hover:bg-rose-50 text-[11px] transition-colors"
          >
            View Incident →
          </button>
        </div>
      )}

      {/* 3. APPLICATION SHELL WITH ENTERPRISE SIDEBAR NAVIGATION */}
      <div className="flex-1 flex overflow-hidden">
        {/* COMPACT ENTERPRISE SIDEBAR */}
        <aside className="w-60 bg-white border-r border-slate-200/90 p-4 space-y-4 shrink-0 hidden md:block overflow-y-auto">
          {/* Group 1: OVERVIEW */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block">OVERVIEW</span>
            <button
              onClick={() => setCurrentNav('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                currentNav === 'overview'
                  ? 'bg-primary-50 text-primary-700 font-bold border border-primary-100'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <Activity size={15} className={currentNav === 'overview' ? 'text-primary-600' : 'text-slate-400'} />
              <span>Operations Overview</span>
            </button>
          </div>

          {/* Group 2: OPERATIONS */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSidebarGroup('operations')}
              className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 hover:text-slate-600 cursor-pointer"
            >
              <span>OPERATIONS</span>
              <ChevronDown size={12} className={`transition-transform ${expandedGroups['operations'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedGroups['operations'] && (
              <div className="space-y-0.5 pl-1">
                {[
                  { id: 'patient-flow', label: 'Patient Flow', icon: Users },
                  { id: 'capacity', label: 'Capacity', icon: Bed },
                  { id: 'workforce', label: 'Workforce', icon: ShieldCheck },
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = currentNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentNav(item.id as AIVerseNav)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-bold border border-primary-100'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }`}
                    >
                      <Icon size={15} className={isActive ? 'text-primary-600' : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Group 3: RESOURCES */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSidebarGroup('resources')}
              className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 hover:text-slate-600 cursor-pointer"
            >
              <span>RESOURCES</span>
              <ChevronDown size={12} className={`transition-transform ${expandedGroups['resources'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedGroups['resources'] && (
              <div className="space-y-0.5 pl-1">
                {[
                  { id: 'inventory', label: 'Inventory', icon: Package },
                  { id: 'supply-chain', label: 'Supply Chain', icon: Database },
                  { id: 'transfers', label: 'Transfers', icon: Truck, badge: `${transfers.length}` },
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = currentNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentNav(item.id as AIVerseNav)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-bold border border-primary-100'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={15} className={isActive ? 'text-primary-600' : 'text-slate-400'} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 text-[10px] font-extrabold bg-slate-200 text-slate-700 rounded-md">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Group 4: INTELLIGENCE */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSidebarGroup('intelligence')}
              className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 hover:text-slate-600 cursor-pointer"
            >
              <span>INTELLIGENCE</span>
              <ChevronDown size={12} className={`transition-transform ${expandedGroups['intelligence'] ? 'rotate-180' : ''}`} />
            </button>
            {expandedGroups['intelligence'] && (
              <div className="space-y-0.5 pl-1">
                {[
                  { id: 'forecasts', label: 'Forecasts', icon: TrendingUp },
                  { id: 'recommendations', label: 'Recommendations', icon: Sparkles, badge: `${stockOutPredictions.length}` },
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = currentNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentNav(item.id as AIVerseNav)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-bold border border-primary-100'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={15} className={isActive ? 'text-primary-600' : 'text-slate-400'} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 text-[10px] font-extrabold bg-rose-100 text-rose-700 rounded-md">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Group 5: ALERTS & NETWORK */}
          <div className="space-y-0.5 pt-2 border-t border-slate-100">
            <button
              onClick={() => setCurrentNav('alerts')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                currentNav === 'alerts'
                  ? 'bg-primary-50 text-primary-700 font-bold border border-primary-100'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert size={15} className={currentNav === 'alerts' ? 'text-primary-600' : 'text-slate-400'} />
                <span>Alerts & Incidents</span>
              </div>
              <span className="px-1.5 py-0.2 text-[10px] font-extrabold bg-rose-100 text-rose-700 rounded-md">
                {alerts.filter(a => a.status === 'Active').length}
              </span>
            </button>

            <button
              onClick={() => setCurrentNav('network')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                currentNav === 'network'
                  ? 'bg-primary-50 text-primary-700 font-bold border border-primary-100'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <MapPin size={15} className={currentNav === 'network' ? 'text-primary-600' : 'text-slate-400'} />
              <span>Facility Network</span>
            </button>
          </div>
        </aside>

        {/* 4. MAIN WORKSPACE */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* WORKSPACE 1: OPERATIONS OVERVIEW (EXACT VISUAL HIERARCHY: SEE → UNDERSTAND → PREDICT → DECIDE → ACT) */}
          {currentNav === 'overview' && (
            <div className="space-y-6">
              {/* Page Title Header */}
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-slate-900">Operations Overview</h1>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time visibility across healthcare capacity, patients, workforce and resources.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block font-mono">Last updated {currentTime}</span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Network Operational
                  </span>
                </div>
              </div>

              {/* Executive Summary Bar (4 Primary Metrics) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Facilities</span>
                  <div className="text-2xl font-extrabold font-display text-slate-900">128</div>
                  <span className="text-[11px] text-slate-500 block">10 regional nodes online</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Beds</span>
                  <div className="text-2xl font-extrabold font-display text-slate-900">1,780</div>
                  <span className="text-[11px] text-slate-700 font-semibold block">81.7% occupied</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Patient Load</span>
                  <div className="text-2xl font-extrabold font-display text-slate-900">1,476</div>
                  <span className="text-[11px] text-emerald-600 font-semibold block">+8.4% today</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs border-l-4 border-l-amber-500 space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Resource Risk</span>
                  <div className="text-2xl font-extrabold font-display text-amber-700">3</div>
                  <span className="text-[11px] text-amber-700 font-semibold block">require attention</span>
                </div>
              </div>

              {/* Supporting Sub-metrics strip */}
              <div className="flex items-center gap-6 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                <span>ICU: <strong className="text-slate-900 font-bold">79% occupied</strong></span>
                <span>•</span>
                <span>Oxygen: <strong className="text-slate-900 font-bold">4.2 days remaining</strong></span>
                <span>•</span>
                <span>Staff Coverage: <strong className="text-emerald-700 font-bold">92% on shift</strong></span>
              </div>

              {/* TWO-COLUMN GRID: LEFT NETWORK PULSE / RIGHT NEEDS ATTENTION */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT: NETWORK PULSE MAP (Simplified, calm, non-glowing map) */}
                <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h2 className="font-display font-bold text-slate-900 text-sm">Network Pulse</h2>
                    <button onClick={() => setCurrentNav('network')} className="text-primary-600 text-xs font-semibold hover:underline">
                      View Facility Network →
                    </button>
                  </div>

                  {/* Clean SVG Network Node Map */}
                  <div className="relative w-full h-[320px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 p-3">
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />
                    {facilities.map(fac => (
                      <div
                        key={fac.id}
                        onClick={() => setSelectedFacility(fac)}
                        style={{ left: `${fac.xPercent}%`, top: `${fac.yPercent}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                      >
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                          fac.status === 'Critical' ? 'bg-rose-500 ring-4 ring-rose-500/30' :
                          fac.status === 'High Load' ? 'bg-amber-500' : 'bg-emerald-400'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        </span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-900 text-white text-[10px] rounded-lg font-bold whitespace-nowrap z-20 pointer-events-none">
                          {fac.name} ({fac.status})
                        </span>
                      </div>
                    ))}

                    {/* Facility Pill Footer */}
                    {selectedFacility && (
                      <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-900/90 backdrop-blur-md rounded-xl text-white flex items-center justify-between text-xs border border-slate-700">
                        <div>
                          <strong className="font-bold text-slate-100 block">{selectedFacility.name}</strong>
                          <span className="text-[10px] text-slate-400">{selectedFacility.district} · Occupancy: {Math.round((selectedFacility.occupiedBeds/selectedFacility.totalBeds)*100)}%</span>
                        </div>
                        <button onClick={() => setSelectedFacility(selectedFacility)} className="text-primary-400 font-bold text-xs hover:underline">
                          View Facility →
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT: NEEDS ATTENTION (Top 3-5 Critical Issues) */}
                <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h2 className="font-display font-bold text-slate-900 text-sm">Needs Attention</h2>
                    <span className="text-xs text-slate-400">Top 3 priority issues</span>
                  </div>

                  <div className="space-y-3">
                    {needsAttentionItems.map(item => (
                      <div key={item.id} className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 text-xs space-y-1 transition-colors">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900 font-bold text-xs">{item.title}</strong>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.severity === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.severity}
                          </span>
                        </div>
                        <p className="text-slate-700 font-semibold">{item.facility}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                          <span>{item.metric} · {item.impact}</span>
                          <button onClick={() => setCurrentNav(item.targetNav)} className="text-primary-600 font-bold hover:underline">
                            {item.actionLabel}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* OPERATIONAL TREND GRAPH */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h2 className="font-display font-bold text-slate-900 text-sm">Operational Trend</h2>
                  <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                    {(['Patients', 'Capacity', 'Utilization'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setOverviewTrendTab(tab)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          overviewTrendTab === tab ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="timeLabel" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey={overviewTrendTab === 'Patients' ? 'currentPatientLoad' : overviewTrendTab === 'Capacity' ? 'currentBedDemand' : 'currentIcuDemand'}
                        stroke="#0284c7"
                        fill="#e0f2fe"
                        fillOpacity={0.5}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AIVERSE RECOMMENDATION DECISION CARD */}
              {stockOutPredictions.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border-2 border-primary-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-primary-700 flex items-center gap-1.5">
                      <Sparkles size={16} /> AIVerse Recommendation
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Confidence: High (96%)</span>
                  </div>

                  <div>
                    <h3 className="font-display font-extrabold text-base text-slate-900">
                      Transfer 20 Oxygen Concentrator units to {stockOutPredictions[0].facilityName}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      <strong>Why:</strong> Projected oxygen stock-out within 36 hours due to respiratory admission surge.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div><span className="text-slate-400 block text-[10px]">FROM</span><strong>{stockOutPredictions[0].suggestedSourceFacilityName}</strong></div>
                    <div><span className="text-slate-400 block text-[10px]">TO</span><strong className="text-rose-700">{stockOutPredictions[0].facilityName}</strong></div>
                    <div><span className="text-slate-400 block text-[10px]">QUANTITY</span><strong>20 units</strong></div>
                    <div><span className="text-slate-400 block text-[10px]">ETA</span><strong>2h 15m</strong></div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => setSelectedRecommendation(stockOutPredictions[0])}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Review Recommendation →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* WORKSPACE 2: PATIENT FLOW PAGE */}
          {currentNav === 'patient-flow' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200/80 pb-4">
                <h1 className="text-2xl font-display font-bold text-slate-900">Patient Flow</h1>
                <p className="text-xs text-slate-500 mt-0.5">Admissions, discharges, emergency arrivals, and flow rate analytics.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs"><span className="text-xs font-semibold text-slate-500 block">Admissions</span><strong className="text-xl font-extrabold font-display text-slate-900">216</strong></div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs"><span className="text-xs font-semibold text-slate-500 block">Discharges</span><strong className="text-xl font-extrabold font-display text-slate-900">184</strong></div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs"><span className="text-xs font-semibold text-slate-500 block">Transfers</span><strong className="text-xl font-extrabold font-display text-slate-900">42</strong></div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs"><span className="text-xs font-semibold text-slate-500 block">Emergency Arrivals</span><strong className="text-xl font-extrabold font-display text-rose-700">85</strong></div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs"><span className="text-xs font-semibold text-slate-500 block">Avg Triage Wait</span><strong className="text-xl font-extrabold font-display text-slate-900">18 mins</strong></div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 text-xs">Patient Demand (Historical vs Projected)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="timeLabel" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip />
                      <Line type="monotone" dataKey="currentPatientLoad" stroke="#3b82f6" strokeWidth={2} name="Actual Load" />
                      <Line type="monotone" dataKey="predictedPatientLoad" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" name="Projected Load" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* WORKSPACE 3: CAPACITY PAGE */}
          {currentNav === 'capacity' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200/80 pb-4">
                <h1 className="text-2xl font-display font-bold text-slate-900">Capacity Management</h1>
                <p className="text-xs text-slate-500 mt-0.5">Network bed, ICU, and emergency capacity indicators.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 space-y-1"><span className="text-xs font-semibold text-slate-500">Network Beds</span><div className="text-2xl font-bold font-display text-slate-900">1,780</div><p className="text-[11px] text-slate-500">1,454 Occupied · 326 Available</p></div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 space-y-1"><span className="text-xs font-semibold text-slate-500">ICU Capacity</span><div className="text-2xl font-bold font-display text-amber-700">219</div><p className="text-[11px] text-slate-500">173 Occupied (79%) · 46 Available</p></div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 space-y-1"><span className="text-xs font-semibold text-slate-500">Emergency Bays</span><div className="text-2xl font-bold font-display text-slate-900">185</div><p className="text-[11px] text-slate-500">142 Occupied · 43 Available</p></div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="p-3.5">Facility</th>
                      <th className="p-3.5">Beds Occupied</th>
                      <th className="p-3.5">ICU Occupied</th>
                      <th className="p-3.5">Emergency Load</th>
                      <th className="p-3.5 text-right">Heat Indicator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {facilities.map(fac => (
                      <tr key={fac.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-slate-900">{fac.name}</td>
                        <td className="p-3.5 font-mono">{fac.occupiedBeds}/{fac.totalBeds} ({Math.round((fac.occupiedBeds/fac.totalBeds)*100)}%)</td>
                        <td className="p-3.5 font-mono">{fac.icuOccupied}/{fac.icuTotal}</td>
                        <td className="p-3.5 font-mono text-slate-700">{fac.emergencyCount} patients</td>
                        <td className="p-3.5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            fac.status === 'Critical' ? 'bg-rose-100 text-rose-800' :
                            fac.status === 'High Load' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {fac.status === 'Critical' ? 'Critical' : fac.status === 'High Load' ? 'High' : 'Stable'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* WORKSPACE 4: RESOURCE INTELLIGENCE TABLE */}
          {currentNav === 'inventory' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200/80 pb-4">
                <h1 className="text-2xl font-display font-bold text-slate-900">Resource Intelligence</h1>
                <p className="text-xs text-slate-500 mt-0.5">Centralized inventory ledger and consumption rates.</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="p-3.5">Resource</th>
                      <th className="p-3.5">Facility</th>
                      <th className="p-3.5 font-right">Stock</th>
                      <th className="p-3.5 font-right">Daily Consumption</th>
                      <th className="p-3.5 font-right">Days Remaining</th>
                      <th className="p-3.5">Risk Level</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInventoryTable.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-slate-900">{inv.resourceName}</td>
                        <td className="p-3.5 font-semibold text-slate-700">{inv.facilityName}</td>
                        <td className="p-3.5 font-mono text-slate-900 font-bold">{inv.currentStock} {inv.unit}</td>
                        <td className="p-3.5 font-mono text-slate-500">{inv.dailyConsumption} / day</td>
                        <td className="p-3.5 font-mono font-bold text-slate-900">{inv.daysRemaining} days</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.riskLevel === 'HIGH RISK' || inv.riskLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                            inv.riskLevel === 'WARNING' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {inv.riskLevel}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSelectedInventoryDetail(inv)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px]"
                          >
                            Review →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* WORKSPACE 5: AI RECOMMENDATIONS WORKSPACE */}
          {currentNav === 'recommendations' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200/80 pb-4">
                <h1 className="text-2xl font-display font-bold text-slate-900">Recommendations</h1>
                <p className="text-xs text-slate-500 mt-0.5">Actionable decision cards generated by AIVerse intelligence.</p>
              </div>

              <div className="space-y-4">
                {stockOutPredictions.map(pred => (
                  <div key={pred.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <strong className="text-slate-900 font-bold text-base">Transfer {pred.resourceName}</strong>
                      <span className="badge-warning text-[10px]">Confidence: High</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3 bg-slate-50 rounded-xl">
                      <div><span className="text-slate-400 block text-[10px]">WHY</span><span className="text-slate-900 font-semibold">Shortage within 36h</span></div>
                      <div><span className="text-slate-400 block text-[10px]">FROM</span><strong className="text-slate-900">{pred.suggestedSourceFacilityName}</strong></div>
                      <div><span className="text-slate-400 block text-[10px]">TO</span><strong className="text-rose-700">{pred.facilityName}</strong></div>
                      <div><span className="text-slate-400 block text-[10px]">QUANTITY</span><strong>{pred.recommendedTransferQty} {pred.unit}</strong></div>
                    </div>

                    <div className="flex gap-2 pt-2 justify-end">
                      <button
                        onClick={() => setSelectedRecommendation(pred)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => {
                          acceptTransferRecommendation(pred.id);
                          triggerToast('Recommendation Approved');
                        }}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-xs"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OTHER NAV WORKSPACES FALLBACK */}
          {currentNav !== 'overview' && currentNav !== 'patient-flow' && currentNav !== 'capacity' && currentNav !== 'inventory' && currentNav !== 'recommendations' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 space-y-2">
              <h2 className="font-display font-bold text-slate-900 text-base uppercase">Workspace: {currentNav}</h2>
              <p className="text-xs text-slate-500">AIVerse Operations Intelligence synchronization active.</p>
            </div>
          )}
        </main>
      </div>

      {/* RECOMMENDATION REVIEW DECISION PANEL (LARGE MODAL / DRAWER) */}
      <AnimatePresence>
        {selectedRecommendation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-5 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display font-extrabold text-slate-900 text-base">AIVerse Decision Analysis</h3>
                <button onClick={() => setSelectedRecommendation(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Situation</span>
                  <p className="text-slate-800 text-xs font-semibold">
                    {selectedRecommendation.facilityName} is projected to exhaust its {selectedRecommendation.resourceName} stock within 1.7 days due to a 23% surge in admissions.
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Evidence</span>
                  <p className="text-slate-600 text-[11px]">
                    {selectedRecommendation.aiReason}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Impact if Acted</span>
                  <p className="text-emerald-700 font-bold text-[11px]">
                    ✓ Prevents critical stock-out, extends facility operational buffer to 8.5 days.
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">AIVerse Suggestion</span>
                  <p className="text-slate-900 font-bold">
                    Transfer {selectedRecommendation.recommendedTransferQty} units from {selectedRecommendation.suggestedSourceFacilityName} (ETA 2h 15m).
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button onClick={() => setSelectedRecommendation(null)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    acceptTransferRecommendation(selectedRecommendation.id);
                    setSelectedRecommendation(null);
                    triggerToast('Transfer Approved & Dispatched');
                  }}
                  className="flex-1 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500"
                >
                  Approve Transfer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RESOURCE DETAIL DRAWER */}
      <AnimatePresence>
        {selectedInventoryDetail && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 p-6 overflow-y-auto text-xs space-y-4"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-display font-extrabold text-slate-900 text-base">{selectedInventoryDetail.resourceName}</h3>
                    <p className="text-slate-400 font-mono">{selectedInventoryDetail.facilityName}</p>
                  </div>
                  <button onClick={() => setSelectedInventoryDetail(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3 pt-3">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current Stock:</span>
                      <strong className="text-slate-900">{selectedInventoryDetail.currentStock} {selectedInventoryDetail.unit}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Daily Consumption:</span>
                      <strong className="text-slate-900">{selectedInventoryDetail.dailyConsumption} / day</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Days Remaining:</span>
                      <strong className="text-slate-900">{selectedInventoryDetail.daysRemaining} days</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Supplier:</span>
                      <strong className="text-slate-900">{selectedInventoryDetail.supplier}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={() => setSelectedInventoryDetail(null)} className="w-full py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">
                Close Drawer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
