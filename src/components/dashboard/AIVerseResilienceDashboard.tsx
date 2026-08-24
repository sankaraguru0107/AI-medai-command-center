import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Bed, BarChart3, Clock, Database, TrendingUp, TrendingDown,
  Users, Zap, Shield, AlertTriangle, CheckCircle2, RefreshCw, Filter,
  ArrowUpRight, ArrowDownRight, Layers, Radio, Sparkles, Building2,
  ChevronRight, ChevronDown, Search, X, Check, FileText, Send, PhoneCall, Cpu,
  MapPin, ShieldAlert, ShieldCheck, Flame, Navigation, Truck, Package,
  AlertCircle, Compass, Play, RotateCcw, ArrowRight, Eye, SlidersHorizontal,
  Bell, User, Settings, CheckSquare, Info, Sliders, ExternalLink, HelpCircle,
  FileSpreadsheet, Share2, Layers3, ActivitySquare, Award, Droplet, UserCheck, HeartPulse
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useAppStore } from '../../store/appStore';
import { useOpsSupplyChainStore } from '../../store/opsSupplyChainStore';
import {
  FacilityNode, DistrictAggregate, StateAggregate, InventoryItem, MedicineItem,
  OxygenUnit, EquipmentItem, ConsumableItem, BloodSupplyItem, ShipmentItem,
  SupplierItem, StockOutPrediction, ResourceTransfer, DoctorRecord, NurseRecord,
  StaffingRiskRecord, ActiveIncident, AlertIncident, FacilityStatus, ResourceRisk
} from '../../types/opsSupplyChain';

type ResilienceViewTab =
  | 'overview'
  | 'network' | 'hospitals' | 'phcs' | 'districts' | 'states'
  | 'beds' | 'icu' | 'emergency-capacity' | 'capacity-forecast'
  | 'patient-flow' | 'admissions' | 'discharges' | 'patient-transfers' | 'demand-forecast' | 'surge-prediction'
  | 'inventory' | 'medicines' | 'oxygen' | 'equipment' | 'consumables' | 'blood' | 'shipments' | 'suppliers'
  | 'ai-forecasting' | 'resource-intelligence' | 'risk-detection' | 'ai-recommendations'
  | 'transfer-requests' | 'active-transfers' | 'transfer-history'
  | 'doctors' | 'nurses' | 'staff-availability' | 'shift-coverage' | 'staffing-risk'
  | 'active-incidents' | 'emergency-response' | 'response-timeline'
  | 'alerts-all' | 'alerts-critical' | 'alerts-capacity' | 'alerts-supply' | 'alerts-workforce' | 'alerts-facility'
  | 'analytics-network' | 'analytics-capacity' | 'analytics-supply' | 'analytics-performance' | 'analytics-history';

export const AIVerseResilienceDashboard: React.FC = () => {
  const { user, setActiveDashboard, setAIPanelOpen } = useAppStore();
  const {
    facilities, selectedFacility, setSelectedFacility, districts, states,
    inventoryItems, medicines, oxygenUnits, equipmentItems, consumables, bloodSupplies,
    shipments, suppliers, doctors, nurses, staffingRisks, activeIncidents,
    stockOutPredictions, transfers, feedEvents, alerts, forecastTimeframe,
    setForecastTimeframe, forecastData, isEmergencyMode, toggleEmergencyMode,
    isDemoScenarioRunning, demoStepIndex, demoLog, runDemoScenario, resetDemoScenario,
    acceptTransferRecommendation, updateTransferStatus, acknowledgeAlert, resolveAlert
  } = useOpsSupplyChainStore();

  const [activeTab, setActiveTab] = useState<ResilienceViewTab>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('all');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>('all');
  const [selectedFacilityTypeFilter, setSelectedFacilityTypeFilter] = useState<string>('all');
  
  const [showResilienceScoreModal, setShowResilienceScoreModal] = useState<boolean>(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<StockOutPrediction | null>(null);
  const [selectedInventoryDetail, setSelectedInventoryDetail] = useState<InventoryItem | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Dynamic Resilience Index
  const networkResilienceScore = useMemo(() => {
    return stockOutPredictions.length === 0 ? 94 : 82;
  }, [stockOutPredictions]);

  // Sidebar Group Collapsible State
  const [openSidebarGroups, setOpenSidebarGroups] = useState<Record<string, boolean>>({
    overview: true, network: true, capacity: true, patientDemand: true,
    supplyChain: true, intelligence: true, redistribution: true,
    workforce: true, emergency: true, alerts: true, analytics: true,
  });

  const toggleGroup = (grp: string) => {
    setOpenSidebarGroups(prev => ({ ...prev, [grp]: !prev[grp] }));
  };

  // Telemetry Clock
  const [currentTime, setCurrentTime] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3000);
  };

  // Filtered Datasets
  const filteredFacilities = useMemo(() => {
    return facilities.filter(fac => {
      const matchState = selectedStateFilter === 'all' || fac.state.toLowerCase() === selectedStateFilter.toLowerCase();
      const matchDistrict = selectedDistrictFilter === 'all' || fac.district.toLowerCase() === selectedDistrictFilter.toLowerCase();
      const matchType = selectedFacilityTypeFilter === 'all' || fac.type.toLowerCase().includes(selectedFacilityTypeFilter.toLowerCase());
      const matchSearch = fac.name.toLowerCase().includes(searchQuery.toLowerCase()) || fac.district.toLowerCase().includes(searchQuery.toLowerCase());
      return matchState && matchDistrict && matchType && matchSearch;
    });
  }, [facilities, selectedStateFilter, selectedDistrictFilter, selectedFacilityTypeFilter, searchQuery]);

  const filteredInventory = useMemo(() => {
    return inventoryItems.filter(inv =>
      inv.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.facilityName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventoryItems, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      {/* Toast Notice */}
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

      {/* 1. TOP ENTERPRISE HEADER */}
      <header className="bg-white border-b border-slate-200/90 px-6 py-3 sticky top-0 z-30 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-extrabold font-display text-xs shadow-xs">
            AR
          </div>
          <div>
            <div className="font-display font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-2">
              AIVerse Resilience <span className="text-slate-300 font-normal">|</span> <span className="text-slate-500 font-normal text-xs">Smart Multi-Hospital Intelligence</span>
            </div>
            <p className="text-[10px] text-primary-700 font-bold tracking-wide">CONNECTED FACILITIES. PREDICTIVE INTELLIGENCE. RESILIENT HEALTHCARE.</p>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <div className="relative w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search network resources..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-100/80 rounded-xl text-xs border border-transparent focus:border-primary-500 focus:bg-white outline-none"
            />
          </div>

          <select
            value={selectedStateFilter}
            onChange={e => setSelectedStateFilter(e.target.value)}
            className="px-2 py-1.5 bg-slate-100/80 border border-transparent rounded-xl text-xs font-semibold outline-none cursor-pointer"
          >
            <option value="all">All States</option>
            <option value="tamil nadu">Tamil Nadu</option>
            <option value="karnataka">Karnataka</option>
          </select>

          <select
            value={selectedDistrictFilter}
            onChange={e => setSelectedDistrictFilter(e.target.value)}
            className="px-2 py-1.5 bg-slate-100/80 border border-transparent rounded-xl text-xs font-semibold outline-none cursor-pointer"
          >
            <option value="all">All Districts</option>
            <option value="coimbatore">Coimbatore</option>
            <option value="salem">Salem</option>
            <option value="madurai">Madurai</option>
            <option value="chennai">Chennai</option>
          </select>
        </div>

        {/* Header Telemetry */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>● Operational</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium">{currentTime || '09:57 AM'}</span>
          </div>

          <button
            onClick={() => {
              if (isDemoScenarioRunning) {
                resetDemoScenario();
                triggerToast('Reset Scenario');
              } else {
                runDemoScenario();
                triggerToast('Executing 18-Step Multi-Hospital Transfer Flow...');
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isDemoScenarioRunning ? <RotateCcw size={14} /> : <Play size={14} />}
            <span>{isDemoScenarioRunning ? 'Reset Scenario' : 'Demo Story'}</span>
          </button>

          <button onClick={() => setAIPanelOpen(true)} className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100" title="Medii AI Intelligence Assistant">
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
              {user?.name?.[0] || 'A'}
            </div>
          </div>
        </div>
      </header>

      {/* EMERGENCY INCIDENT STRIP */}
      {isEmergencyMode && (
        <div className="bg-rose-600 text-white px-6 py-2 text-xs font-semibold flex items-center justify-between border-b border-rose-700 shadow-md">
          <div className="flex items-center gap-2">
            <Flame size={16} className="animate-bounce" />
            <span><strong>ACTIVE EMERGENCY SURGE INCIDENT</strong> — 3 regional facilities operating under critical surge load</span>
          </div>
          <button onClick={() => setActiveTab('active-incidents')} className="px-3 py-1 rounded-lg bg-white text-rose-700 font-bold hover:bg-rose-50 text-[11px]">
            Open Emergency Response →
          </button>
        </div>
      )}

      {/* 2. MAIN APPLICATION SHELL & COMPREHENSIVE SIDEBAR NAVIGATION */}
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 bg-white border-r border-slate-200/90 p-4 space-y-3 shrink-0 hidden md:block overflow-y-auto">
          {/* 1. OVERVIEW */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block">OVERVIEW</span>
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'overview' ? 'bg-primary-50 text-primary-700 font-bold border border-primary-100' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <Activity size={14} className={activeTab === 'overview' ? 'text-primary-600' : 'text-slate-400'} />
              <span>Resilience Overview</span>
            </button>
          </div>

          {/* 2. HEALTH NETWORK */}
          <div className="space-y-0.5">
            <button onClick={() => toggleGroup('network')} className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 cursor-pointer">
              <span>HEALTH NETWORK</span><ChevronDown size={12} className={`transition-transform ${openSidebarGroups['network'] ? 'rotate-180' : ''}`} />
            </button>
            {openSidebarGroups['network'] && (
              <div className="space-y-0.5 pl-1">
                {[
                  { id: 'network', label: 'Facility Network', icon: MapPin },
                  { id: 'hospitals', label: 'Hospitals', icon: Building2 },
                  { id: 'phcs', label: 'PHCs & CHCs', icon: ActivitySquare },
                  { id: 'districts', label: 'District View', icon: Compass },
                  { id: 'states', label: 'State View', icon: Layers3 },
                ].map(item => (
                  <button key={item.id} onClick={() => setActiveTab(item.id as ResilienceViewTab)} className={`w-full flex items-center gap-2.5 px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${activeTab === item.id ? 'bg-primary-50 text-primary-700 font-bold border border-primary-100' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'}`}>
                    <item.icon size={13} className={activeTab === item.id ? 'text-primary-600' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. CAPACITY */}
          <div className="space-y-0.5">
            <button onClick={() => toggleGroup('capacity')} className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 cursor-pointer">
              <span>CAPACITY</span><ChevronDown size={12} className={`transition-transform ${openSidebarGroups['capacity'] ? 'rotate-180' : ''}`} />
            </button>
            {openSidebarGroups['capacity'] && (
              <div className="space-y-0.5 pl-1">
                {[
                  { id: 'beds', label: 'Bed Availability', icon: Bed },
                  { id: 'icu', label: 'ICU Capacity', icon: Activity },
                  { id: 'emergency-capacity', label: 'Emergency Capacity', icon: Flame },
                  { id: 'capacity-forecast', label: 'Capacity Forecast', icon: TrendingUp },
                ].map(item => (
                  <button key={item.id} onClick={() => setActiveTab(item.id as ResilienceViewTab)} className={`w-full flex items-center gap-2.5 px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${activeTab === item.id ? 'bg-primary-50 text-primary-700 font-bold border border-primary-100' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'}`}>
                    <item.icon size={13} className={activeTab === item.id ? 'text-primary-600' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. PATIENT DEMAND */}
          <div className="space-y-0.5">
            <button onClick={() => toggleGroup('patientDemand')} className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 cursor-pointer">
              <span>PATIENT DEMAND</span><ChevronDown size={12} className={`transition-transform ${openSidebarGroups['patientDemand'] ? 'rotate-180' : ''}`} />
            </button>
            {openSidebarGroups['patientDemand'] && (
              <div className="space-y-0.5 pl-1">
                {[
                  { id: 'patient-flow', label: 'Patient Flow', icon: Users },
                  { id: 'admissions', label: 'Admissions', icon: ArrowUpRight },
                  { id: 'discharges', label: 'Discharges', icon: ArrowDownRight },
                  { id: 'patient-transfers', label: 'Patient Transfers', icon: Share2 },
                  { id: 'demand-forecast', label: 'Demand Forecast', icon: BarChart3 },
                  { id: 'surge-prediction', label: 'Surge Prediction', icon: Zap },
                ].map(item => (
                  <button key={item.id} onClick={() => setActiveTab(item.id as ResilienceViewTab)} className={`w-full flex items-center gap-2.5 px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${activeTab === item.id ? 'bg-primary-50 text-primary-700 font-bold border border-primary-100' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'}`}>
                    <item.icon size={13} className={activeTab === item.id ? 'text-primary-600' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. SUPPLY CHAIN */}
          <div className="space-y-0.5">
            <button onClick={() => toggleGroup('supplyChain')} className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 cursor-pointer">
              <span>SUPPLY CHAIN</span><ChevronDown size={12} className={`transition-transform ${openSidebarGroups['supplyChain'] ? 'rotate-180' : ''}`} />
            </button>
            {openSidebarGroups['supplyChain'] && (
              <div className="space-y-0.5 pl-1">
                {[
                  { id: 'inventory', label: 'Master Inventory', icon: Package },
                  { id: 'medicines', label: 'Medicines', icon: Layers },
                  { id: 'oxygen', label: 'Oxygen Management', icon: Zap },
                  { id: 'equipment', label: 'Medical Equipment', icon: Cpu },
                  { id: 'consumables', label: 'Consumables', icon: Layers3 },
                  { id: 'blood', label: 'Blood Supplies', icon: Droplet },
                  { id: 'shipments', label: 'Shipments', icon: Truck },
                  { id: 'suppliers', label: 'Suppliers Directory', icon: Building2 },
                ].map(item => (
                  <button key={item.id} onClick={() => setActiveTab(item.id as ResilienceViewTab)} className={`w-full flex items-center gap-2.5 px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${activeTab === item.id ? 'bg-primary-50 text-primary-700 font-bold border border-primary-100' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'}`}>
                    <item.icon size={13} className={activeTab === item.id ? 'text-primary-600' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 6. INTELLIGENCE */}
          <div className="space-y-0.5">
            <button onClick={() => toggleGroup('intelligence')} className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 cursor-pointer">
              <span>INTELLIGENCE</span><ChevronDown size={12} className={`transition-transform ${openSidebarGroups['intelligence'] ? 'rotate-180' : ''}`} />
            </button>
            {openSidebarGroups['intelligence'] && (
              <div className="space-y-0.5 pl-1">
                {[
                  { id: 'ai-forecasting', label: 'AI Forecasting', icon: TrendingUp },
                  { id: 'resource-intelligence', label: 'Resource Intelligence', icon: Sparkles },
                  { id: 'risk-detection', label: 'Risk Detection', icon: ShieldAlert },
                  { id: 'ai-recommendations', label: 'AI Recommendations', icon: CheckSquare, badge: `${stockOutPredictions.length}` },
                ].map(item => (
                  <button key={item.id} onClick={() => setActiveTab(item.id as ResilienceViewTab)} className={`w-full flex items-center justify-between px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${activeTab === item.id ? 'bg-primary-50 text-primary-700 font-bold border border-primary-100' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'}`}>
                    <div className="flex items-center gap-2.5"><item.icon size={13} className={activeTab === item.id ? 'text-primary-600' : 'text-slate-400'} /><span>{item.label}</span></div>
                    {item.badge && <span className="px-1.5 py-0.2 text-[10px] font-extrabold bg-rose-100 text-rose-700 rounded-md">{item.badge}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 7. REDISTRIBUTION */}
          <div className="space-y-0.5">
            <button onClick={() => toggleGroup('redistribution')} className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 cursor-pointer">
              <span>REDISTRIBUTION</span><ChevronDown size={12} className={`transition-transform ${openSidebarGroups['redistribution'] ? 'rotate-180' : ''}`} />
            </button>
            {openSidebarGroups['redistribution'] && (
              <div className="space-y-0.5 pl-1">
                {[
                  { id: 'transfer-requests', label: 'Transfer Requests', icon: FileText },
                  { id: 'active-transfers', label: 'Active Transfers', icon: Truck, badge: `${transfers.length}` },
                  { id: 'transfer-history', label: 'Transfer History', icon: Clock },
                ].map(item => (
                  <button key={item.id} onClick={() => setActiveTab(item.id as ResilienceViewTab)} className={`w-full flex items-center justify-between px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${activeTab === item.id ? 'bg-primary-50 text-primary-700 font-bold border border-primary-100' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'}`}>
                    <div className="flex items-center gap-2.5"><item.icon size={13} className={activeTab === item.id ? 'text-primary-600' : 'text-slate-400'} /><span>{item.label}</span></div>
                    {item.badge && <span className="px-1.5 py-0.2 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 rounded-md">{item.badge}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 8. WORKFORCE */}
          <div className="space-y-0.5">
            <button onClick={() => toggleGroup('workforce')} className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 cursor-pointer">
              <span>WORKFORCE</span><ChevronDown size={12} className={`transition-transform ${openSidebarGroups['workforce'] ? 'rotate-180' : ''}`} />
            </button>
            {openSidebarGroups['workforce'] && (
              <div className="space-y-0.5 pl-1">
                {[
                  { id: 'doctors', label: 'Doctors', icon: User },
                  { id: 'nurses', label: 'Nurses', icon: Users },
                  { id: 'staff-availability', label: 'Staff Availability', icon: UserCheck },
                  { id: 'shift-coverage', label: 'Shift Coverage', icon: Clock },
                  { id: 'staffing-risk', label: 'Staffing Risk', icon: ShieldCheck },
                ].map(item => (
                  <button key={item.id} onClick={() => setActiveTab(item.id as ResilienceViewTab)} className={`w-full flex items-center gap-2.5 px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${activeTab === item.id ? 'bg-primary-50 text-primary-700 font-bold border border-primary-100' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'}`}>
                    <item.icon size={13} className={activeTab === item.id ? 'text-primary-600' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 9. EMERGENCY */}
          <div className="space-y-0.5">
            <button onClick={() => toggleGroup('emergency')} className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 cursor-pointer">
              <span>EMERGENCY</span><ChevronDown size={12} className={`transition-transform ${openSidebarGroups['emergency'] ? 'rotate-180' : ''}`} />
            </button>
            {openSidebarGroups['emergency'] && (
              <div className="space-y-0.5 pl-1">
                {[
                  { id: 'active-incidents', label: 'Active Incidents', icon: Flame },
                  { id: 'emergency-response', label: 'Emergency Response', icon: HeartPulse },
                  { id: 'response-timeline', label: 'Response Timeline', icon: Activity },
                ].map(item => (
                  <button key={item.id} onClick={() => setActiveTab(item.id as ResilienceViewTab)} className={`w-full flex items-center gap-2.5 px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${activeTab === item.id ? 'bg-rose-50 text-rose-700 font-bold border border-rose-100' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'}`}>
                    <item.icon size={13} className={activeTab === item.id ? 'text-rose-600' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 10. ALERTS */}
          <div className="space-y-0.5 pt-1 border-t border-slate-100">
            <button onClick={() => toggleGroup('alerts')} className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 cursor-pointer">
              <span>ALERTS</span><ChevronDown size={12} className={`transition-transform ${openSidebarGroups['alerts'] ? 'rotate-180' : ''}`} />
            </button>
            {openSidebarGroups['alerts'] && (
              <div className="space-y-0.5 pl-1">
                {[
                  { id: 'alerts-all', label: 'All Alerts', icon: ShieldAlert, badge: `${alerts.length}` },
                  { id: 'alerts-critical', label: 'Critical Alerts', icon: AlertCircle },
                  { id: 'alerts-capacity', label: 'Capacity Alerts', icon: Bed },
                  { id: 'alerts-supply', label: 'Supply Chain Alerts', icon: Package },
                ].map(item => (
                  <button key={item.id} onClick={() => setActiveTab(item.id as ResilienceViewTab)} className={`w-full flex items-center justify-between px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${activeTab === item.id ? 'bg-primary-50 text-primary-700 font-bold border border-primary-100' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'}`}>
                    <div className="flex items-center gap-2.5"><item.icon size={13} className={activeTab === item.id ? 'text-primary-600' : 'text-slate-400'} /><span>{item.label}</span></div>
                    {item.badge && <span className="px-1.5 py-0.2 text-[10px] font-extrabold bg-rose-100 text-rose-700 rounded-md">{item.badge}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 11. ANALYTICS */}
          <div className="space-y-0.5 pt-1 border-t border-slate-100">
            <button onClick={() => toggleGroup('analytics')} className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 cursor-pointer">
              <span>ANALYTICS</span><ChevronDown size={12} className={`transition-transform ${openSidebarGroups['analytics'] ? 'rotate-180' : ''}`} />
            </button>
            {openSidebarGroups['analytics'] && (
              <div className="space-y-0.5 pl-1">
                {[
                  { id: 'analytics-network', label: 'Network Analytics', icon: BarChart3 },
                  { id: 'analytics-performance', label: 'Facility Performance', icon: Award },
                  { id: 'analytics-history', label: 'Historical Trends', icon: TrendingUp },
                ].map(item => (
                  <button key={item.id} onClick={() => setActiveTab(item.id as ResilienceViewTab)} className={`w-full flex items-center gap-2.5 px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${activeTab === item.id ? 'bg-primary-50 text-primary-700 font-bold border border-primary-100' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'}`}>
                    <item.icon size={13} className={activeTab === item.id ? 'text-primary-600' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* 3. MAIN CONTENT WORKSPACE */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* VIEW 1: RESILIENCE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Resilience Overview</h1>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time multi-hospital health network status, capacity pressure, and resource intelligence.</p>
                </div>

                <div
                  onClick={() => setShowResilienceScoreModal(true)}
                  className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 cursor-pointer hover:border-primary-400 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-teal-600 text-white flex items-center justify-center font-extrabold font-display text-lg shadow-sm">
                    {networkResilienceScore}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Network Resilience Index</span>
                    <strong className="text-xs text-slate-900 font-extrabold flex items-center gap-1">
                      {networkResilienceScore > 90 ? '🟢 High Operational Resilience' : '🟠 Moderate Risk Pressure'}
                      <ChevronRight size={14} className="text-slate-400" />
                    </strong>
                  </div>
                </div>
              </div>

              {/* Executive Metrics Bar */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-1"><span className="text-[11px] font-semibold text-slate-500 block">Facilities</span><div className="text-xl font-extrabold font-display text-slate-900">128</div><span className="text-[10px] text-emerald-700 font-bold block">10 Online · 1 At Risk</span></div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-1"><span className="text-[11px] font-semibold text-slate-500 block">Beds Capacity</span><div className="text-xl font-extrabold font-display text-slate-900">1,780</div><span className="text-[10px] text-slate-700 font-semibold block">81.7% Occupied</span></div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-1"><span className="text-[11px] font-semibold text-slate-500 block">ICU Beds</span><div className="text-xl font-extrabold font-display text-amber-700">219</div><span className="text-[10px] text-amber-700 font-semibold block">173 Occ (79%)</span></div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-1"><span className="text-[11px] font-semibold text-slate-500 block">Patient Load</span><div className="text-xl font-extrabold font-display text-slate-900">1,476</div><span className="text-[10px] text-emerald-600 font-semibold block">+8.4% today</span></div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs border-l-4 border-l-rose-500 space-y-1"><span className="text-[11px] font-semibold text-slate-500 block">Resources Risk</span><div className="text-xl font-extrabold font-display text-rose-700">3</div><span className="text-[10px] text-rose-600 font-bold block">Stock-Outs Predicted</span></div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-1"><span className="text-[11px] font-semibold text-slate-500 block">Workforce Coverage</span><div className="text-xl font-extrabold font-display text-slate-900">92%</div><span className="text-[10px] text-slate-600 font-medium block">512 Staff on Shift</span></div>
              </div>

              {/* Network Map & Risk Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h2 className="font-display font-bold text-slate-900 text-sm">Network Health Map</h2>
                    <button onClick={() => setActiveTab('network')} className="text-primary-600 font-bold text-xs hover:underline">Full Map →</button>
                  </div>
                  <div className="relative w-full h-[320px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 p-3">
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:18px_18px]" />
                    {facilities.map(fac => (
                      <div key={fac.id} onClick={() => setSelectedFacility(fac)} style={{ left: `${fac.xPercent}%`, top: `${fac.yPercent}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center ${fac.status === 'Critical' ? 'bg-rose-500 animate-ping' : fac.status === 'High Load' ? 'bg-amber-500' : 'bg-emerald-400'}`}><span className="w-2 h-2 rounded-full bg-white" /></span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-900 text-white text-[10px] rounded-lg font-bold whitespace-nowrap z-20 pointer-events-none">{fac.name} ({fac.status})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h2 className="font-display font-bold text-slate-900 text-sm">Network Risk Summary</h2>
                    <button onClick={() => setActiveTab('risk-detection')} className="text-primary-600 font-bold text-xs hover:underline">Risk Analysis →</button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                      <div className="flex justify-between font-bold"><span>PHC Coimbatore-021</span><span className="text-rose-700">Critical</span></div>
                      <p className="text-slate-600 text-[11px]">ICU at 94% occupied · Oxygen depletion predicted in 1.7 days.</p>
                      <button onClick={() => setActiveTab('ai-recommendations')} className="text-primary-600 font-bold text-[11px] hover:underline pt-1">Review Transfer Action →</button>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
                      <div className="flex justify-between font-bold"><span>PHC Madurai-014</span><span className="text-amber-700">High Risk</span></div>
                      <p className="text-slate-600 text-[11px]">IV Saline stock below threshold (3.2 days remaining).</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3.3: HOSPITALS */}
          {activeTab === 'hospitals' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200/80 pb-4">
                <h1 className="text-2xl font-display font-bold text-slate-900">Hospital Directory</h1>
                <p className="text-xs text-slate-500 mt-0.5">Tertiary and District Hospitals across network.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="p-3.5">Hospital Name</th>
                      <th className="p-3.5">District</th>
                      <th className="p-3.5">Beds</th>
                      <th className="p-3.5">ICU</th>
                      <th className="p-3.5">Oxygen Buffer</th>
                      <th className="p-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {facilities.filter(f => f.type.includes('Hospital')).map(fac => (
                      <tr key={fac.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedFacility(fac)}>
                        <td className="p-3.5 font-bold text-slate-900">{fac.name}</td>
                        <td className="p-3.5 text-slate-700">{fac.district}</td>
                        <td className="p-3.5 font-mono">{fac.occupiedBeds}/{fac.totalBeds} ({Math.round((fac.occupiedBeds/fac.totalBeds)*100)}%)</td>
                        <td className="p-3.5 font-mono">{fac.icuOccupied}/{fac.icuTotal}</td>
                        <td className="p-3.5 font-mono">{fac.oxygenDaysRemaining} days</td>
                        <td className="p-3.5 text-right"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${fac.status === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>{fac.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 3.4: PHCs */}
          {activeTab === 'phcs' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200/80 pb-4">
                <h1 className="text-2xl font-display font-bold text-slate-900">Primary Health Centres (PHCs)</h1>
                <p className="text-xs text-slate-500 mt-0.5">Community & Primary Health Center Network.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="p-3.5">PHC Name</th>
                      <th className="p-3.5">District</th>
                      <th className="p-3.5">Beds</th>
                      <th className="p-3.5">Oxygen Stock</th>
                      <th className="p-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {facilities.filter(f => f.type.includes('Primary')).map(fac => (
                      <tr key={fac.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedFacility(fac)}>
                        <td className="p-3.5 font-bold text-slate-900">{fac.name}</td>
                        <td className="p-3.5 text-slate-700">{fac.district}</td>
                        <td className="p-3.5 font-mono">{fac.occupiedBeds}/{fac.totalBeds} ({Math.round((fac.occupiedBeds/fac.totalBeds)*100)}%)</td>
                        <td className="p-3.5 font-mono">{fac.oxygenDaysRemaining} days remaining</td>
                        <td className="p-3.5 text-right"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${fac.status === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>{fac.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 3.5: DISTRICT VIEW */}
          {activeTab === 'districts' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200/80 pb-4">
                <h1 className="text-2xl font-display font-bold text-slate-900">District Operational View</h1>
                <p className="text-xs text-slate-500 mt-0.5">District-level aggregate metrics, capacity pressure, and resilience scores.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {districts.map(dist => (
                  <div key={dist.id} className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-2 text-xs">
                    <div className="flex justify-between font-bold">
                      <strong className="text-slate-900 text-sm">{dist.name} District</strong>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${dist.riskStatus === 'High Load' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{dist.riskStatus}</span>
                    </div>
                    <div className="space-y-1 text-slate-600 font-medium">
                      <div className="flex justify-between"><span>Facilities:</span><strong className="text-slate-900">{dist.facilityCount}</strong></div>
                      <div className="flex justify-between"><span>Beds Occupied:</span><strong className="text-slate-900">{dist.occupiedBeds}/{dist.totalBeds} ({Math.round((dist.occupiedBeds/dist.totalBeds)*100)}%)</strong></div>
                      <div className="flex justify-between"><span>ICU Occupied:</span><strong className="text-slate-900">{dist.icuOccupied}/{dist.icuTotal}</strong></div>
                      <div className="flex justify-between"><span>Oxygen Buffer Avg:</span><strong className="text-slate-900">{dist.oxygenDaysAvg} days</strong></div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between font-bold">
                      <span>Resilience Score:</span><strong className="text-primary-700">{dist.resilienceScore} / 100</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 3.18: MEDICINES */}
          {activeTab === 'medicines' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200/80 pb-4">
                <h1 className="text-2xl font-display font-bold text-slate-900">Essential Medicines Inventory</h1>
                <p className="text-xs text-slate-500 mt-0.5">Pharmaceutical stock, daily consumption, and expiry management.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="p-3.5">Medicine Name</th>
                      <th className="p-3.5">Facility</th>
                      <th className="p-3.5">Stock</th>
                      <th className="p-3.5">Daily Usage</th>
                      <th className="p-3.5">Days Remaining</th>
                      <th className="p-3.5">Expiry Date</th>
                      <th className="p-3.5 text-right">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medicines.map(med => (
                      <tr key={med.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-slate-900">{med.name}</td>
                        <td className="p-3.5 text-slate-700">{med.facilityName}</td>
                        <td className="p-3.5 font-mono font-bold text-slate-900">{med.stock} {med.unit}</td>
                        <td className="p-3.5 font-mono text-slate-500">{med.dailyConsumption} / day</td>
                        <td className="p-3.5 font-mono font-bold text-slate-900">{med.daysRemaining} days</td>
                        <td className="p-3.5 font-mono text-slate-600">{med.expiryDate}</td>
                        <td className="p-3.5 text-right"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${med.riskLevel === 'WARNING' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{med.riskLevel}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 3.19: OXYGEN */}
          {activeTab === 'oxygen' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200/80 pb-4">
                <h1 className="text-2xl font-display font-bold text-slate-900">Oxygen Resource Management</h1>
                <p className="text-xs text-slate-500 mt-0.5">Liquid tanks, concentrators, daily usage, and supply replenishment telemetry.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="p-3.5">Facility Name</th>
                      <th className="p-3.5">Supply Unit Type</th>
                      <th className="p-3.5">Current Stock</th>
                      <th className="p-3.5">Daily Consumption</th>
                      <th className="p-3.5">Days Remaining</th>
                      <th className="p-3.5">Supplier Status</th>
                      <th className="p-3.5 text-right">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {oxygenUnits.map(oxy => (
                      <tr key={oxy.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-bold text-slate-900">{oxy.facilityName}</td>
                        <td className="p-3.5 text-slate-700">{oxy.type}</td>
                        <td className="p-3.5 font-mono font-bold text-slate-900">{oxy.currentStock} units</td>
                        <td className="p-3.5 font-mono text-slate-500">{oxy.dailyConsumption} / day</td>
                        <td className="p-3.5 font-mono font-bold text-slate-900">{oxy.daysRemaining} days</td>
                        <td className="p-3.5 text-slate-600">{oxy.supplier} ({oxy.incomingEta})</td>
                        <td className="p-3.5 text-right"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${oxy.riskLevel === 'HIGH RISK' ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'}`}>{oxy.riskLevel}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 3.23: SHIPMENTS */}
          {activeTab === 'shipments' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200/80 pb-4">
                <h1 className="text-2xl font-display font-bold text-slate-900">Shipment Tracker</h1>
                <p className="text-xs text-slate-500 mt-0.5">Inter-facility transfers and supplier deliveries in transit.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="p-3.5">Shipment Code</th>
                      <th className="p-3.5">Resource</th>
                      <th className="p-3.5">Origin</th>
                      <th className="p-3.5">Destination</th>
                      <th className="p-3.5">Quantity</th>
                      <th className="p-3.5">ETA</th>
                      <th className="p-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shipments.map(shp => (
                      <tr key={shp.id} className="hover:bg-slate-50">
                        <td className="p-3.5 font-mono font-bold text-primary-600">{shp.shipmentCode}</td>
                        <td className="p-3.5 font-bold text-slate-900">{shp.resourceName}</td>
                        <td className="p-3.5 text-slate-700">{shp.origin}</td>
                        <td className="p-3.5 text-slate-700">{shp.destination}</td>
                        <td className="p-3.5 font-mono text-slate-900">{shp.quantity} {shp.unit}</td>
                        <td className="p-3.5 font-mono text-slate-600">{shp.eta}</td>
                        <td className="p-3.5 text-right"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${shp.status === 'In Transit' ? 'bg-primary-100 text-primary-800' : 'bg-slate-200 text-slate-700'}`}>{shp.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 3.28: AI RECOMMENDATIONS */}
          {activeTab === 'ai-recommendations' && (
            <div className="space-y-4">
              <div className="border-b border-slate-200/80 pb-4">
                <h1 className="text-2xl font-display font-bold text-slate-900">AI Recommendations</h1>
                <p className="text-xs text-slate-500 mt-0.5">Cross-facility resource redistribution recommendations generated by AIVerse engine.</p>
              </div>
              <div className="space-y-4">
                {stockOutPredictions.map(pred => (
                  <div key={pred.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <strong className="text-slate-900 font-bold text-base">Transfer {pred.resourceName}</strong>
                      <span className="badge-warning text-[10px]">Confidence: 96%</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3 bg-slate-50 rounded-xl">
                      <div><span className="text-slate-400 block text-[10px]">WHY</span><span className="text-slate-900 font-semibold">Shortage within 36h</span></div>
                      <div><span className="text-slate-400 block text-[10px]">FROM</span><strong className="text-slate-900">{pred.suggestedSourceFacilityName}</strong></div>
                      <div><span className="text-slate-400 block text-[10px]">TO</span><strong className="text-rose-700">{pred.facilityName}</strong></div>
                      <div><span className="text-slate-400 block text-[10px]">QUANTITY</span><strong>{pred.recommendedTransferQty} {pred.unit}</strong></div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button onClick={() => setSelectedRecommendation(pred)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs">Review Decision Analysis</button>
                      <button onClick={() => { acceptTransferRecommendation(pred.id); triggerToast('Recommendation Approved'); }} className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-xs">Approve Transfer</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ALL OTHER 50 SUBMODULES WORKSPACE FALLBACK */}
          {activeTab !== 'overview' && activeTab !== 'hospitals' && activeTab !== 'phcs' && activeTab !== 'districts' && activeTab !== 'medicines' && activeTab !== 'oxygen' && activeTab !== 'shipments' && activeTab !== 'ai-recommendations' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <h2 className="font-display font-bold text-slate-900 text-lg uppercase tracking-tight">Workspace: {activeTab.replace('-', ' ')}</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                AIVerse Resilience telemetry and analytics synchronized across regional hospital networks.
              </p>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 font-medium">
                Showing live regional operational dataset for <strong>{selectedStateFilter === 'all' ? 'All States' : selectedStateFilter}</strong> · <strong>{selectedDistrictFilter === 'all' ? 'All Districts' : selectedDistrictFilter}</strong>.
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: RESILIENCE SCORE CALCULATION BREAKDOWN */}
      <AnimatePresence>
        {showResilienceScoreModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2"><Award size={20} className="text-primary-600" /><h3 className="font-display font-extrabold text-slate-900 text-base">Network Resilience Index Calculation</h3></div>
                <button onClick={() => setShowResilienceScoreModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"><X size={18} /></button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"><span className="font-bold text-slate-700">Overall Network Score</span><span className="font-display font-extrabold text-xl text-primary-700">{networkResilienceScore} / 100</span></div>
                <div className="space-y-2 text-slate-700">
                  <div className="flex justify-between"><span>Bed & ICU Capacity Readiness:</span><strong className="text-slate-900">84%</strong></div>
                  <div className="flex justify-between"><span>Supply Chain Stability:</span><strong className={networkResilienceScore > 90 ? 'text-emerald-700' : 'text-amber-700'}>{networkResilienceScore > 90 ? '96%' : '78%'}</strong></div>
                  <div className="flex justify-between"><span>Workforce Coverage:</span><strong className="text-slate-900">92%</strong></div>
                  <div className="flex justify-between"><span>Emergency Readiness:</span><strong className="text-slate-900">88%</strong></div>
                </div>
              </div>
              <button onClick={() => setShowResilienceScoreModal(false)} className="w-full py-2 bg-slate-900 text-white font-bold rounded-xl">Close Calculation</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: RECOMMENDATION DECISION ANALYSIS */}
      <AnimatePresence>
        {selectedRecommendation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3"><h3 className="font-display font-extrabold text-slate-900 text-base">AIVerse Decision Analysis</h3><button onClick={() => setSelectedRecommendation(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"><X size={18} /></button></div>
              <div className="space-y-3">
                <div><span className="text-slate-400 text-[10px] uppercase font-bold block">Situation</span><p className="text-slate-800 text-xs font-semibold">{selectedRecommendation.facilityName} is projected to exhaust its {selectedRecommendation.resourceName} stock within 1.7 days due to a 23% surge in admissions.</p></div>
                <div><span className="text-slate-400 text-[10px] uppercase font-bold block">Evidence</span><p className="text-slate-600 text-[11px]">{selectedRecommendation.aiReason}</p></div>
                <div><span className="text-slate-400 text-[10px] uppercase font-bold block">Impact if Acted</span><p className="text-emerald-700 font-bold text-[11px]">✓ Prevents critical stock-out, extends facility operational buffer to 8.5 days.</p></div>
                <div><span className="text-slate-400 text-[10px] uppercase font-bold block">AIVerse Suggestion</span><p className="text-slate-900 font-bold">Transfer {selectedRecommendation.recommendedTransferQty} units from {selectedRecommendation.suggestedSourceFacilityName} (ETA 2h 15m).</p></div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-100"><button onClick={() => setSelectedRecommendation(null)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button><button onClick={() => { acceptTransferRecommendation(selectedRecommendation.id); setSelectedRecommendation(null); triggerToast('Transfer Approved & Dispatched'); }} className="flex-1 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500">Approve Transfer</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FACILITY DETAIL DRAWER */}
      <AnimatePresence>
        {selectedFacility && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs">
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 p-6 overflow-y-auto text-xs space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3"><div><h3 className="font-display font-extrabold text-slate-900 text-base">{selectedFacility.name}</h3><p className="text-slate-400 font-mono">{selectedFacility.code} · {selectedFacility.district}</p></div><button onClick={() => setSelectedFacility(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"><X size={18} /></button></div>
                <div className="space-y-3 pt-3">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                    <div className="flex justify-between"><span className="text-slate-500">Beds Occupied:</span><strong className="text-slate-900">{selectedFacility.occupiedBeds} / {selectedFacility.totalBeds} ({Math.round((selectedFacility.occupiedBeds/selectedFacility.totalBeds)*100)}%)</strong></div>
                    <div className="flex justify-between"><span className="text-slate-500">ICU Occupied:</span><strong className="text-amber-800">{selectedFacility.icuOccupied} / {selectedFacility.icuTotal}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-500">Oxygen Buffer:</span><strong className="text-slate-900">{selectedFacility.oxygenDaysRemaining} days remaining</strong></div>
                    <div className="flex justify-between"><span className="text-slate-500">Staff Available:</span><strong className="text-slate-900">{selectedFacility.availableDoctors} MDs · {selectedFacility.availableNurses} RNs</strong></div>
                  </div>
                  <div className="space-y-1 pt-2"><strong className="text-slate-900 font-bold block">Recommended Action</strong>{selectedFacility.aiRecommendations.map((rec, idx) => (<p key={idx} className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-700 border border-slate-100">{rec}</p>))}</div>
                </div>
              </div>
              <button onClick={() => setSelectedFacility(null)} className="w-full py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Close Drawer</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
