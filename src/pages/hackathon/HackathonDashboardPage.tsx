import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Info,
  MapPin,
  Maximize2,
  Network,
  Pill,
  RefreshCw,
  Rocket,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  XCircle,
} from 'lucide-react';
import { useHackathonStore } from '../../store/hackathonStore';
import { INDIAN_STATES, DEMO_FACILITIES, IndianStateData, IndianFacilityData } from '../../data/hackathonData';

export const HackathonDashboardPage: React.FC = () => {
  const {
    nationalResilienceScore,
    facilitiesCount,
    bedAvailabilityPercent,
    medicineAvailabilityPercent,
    staffAvailabilityPercent,
    stockOutPrediction,
    redistributionPlan,
    approveRedistribution,
    rejectRedistribution,
    isSimulating,
    simulationStep,
    runSimulation,
    resetSimulation,
  } = useHackathonStore();
  const navigate = useNavigate();

  const [selectedState, setSelectedState] = useState<IndianStateData | null>(INDIAN_STATES[0]);
  const [selectedFacility, setSelectedFacility] = useState<IndianFacilityData | null>(DEMO_FACILITIES[0]);
  const [showDetailModal, setShowDetailModal] = useState(false);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* Simulation Stepper Banner */}
      {(isSimulating || simulationStep > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50 to-white border border-sky-200 shadow-md relative overflow-hidden text-slate-900"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Rocket className="text-amber-500 animate-bounce" size={20} />
              <h3 className="text-sm font-extrabold text-slate-900">
                Hackathon Live Simulation Active — Phase {simulationStep} of 9
              </h3>
            </div>
            <button
              onClick={resetSimulation}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold underline"
            >
              Reset Simulation
            </button>
          </div>

          <div className="grid grid-cols-9 gap-1.5 mb-2">
            {[
              '1. Normal Ops',
              '2. Demand Surge',
              '3. Medicine Surge',
              '4. AI Risk Scan',
              '5. Shortage Forecast',
              '6. Critical Alert',
              '7. Redistribution',
              '8. Admin Approval',
              '9. Resilience Fixed',
            ].map((stepName, idx) => {
              const current = idx + 1;
              const isPassed = current <= simulationStep;
              const isCurrent = current === simulationStep;
              return (
                <div
                  key={stepName}
                  className={`p-2 rounded-xl text-[10px] font-bold text-center transition-all border ${
                    isCurrent
                      ? 'bg-sky-600 text-white border-sky-400 ring-2 ring-sky-300 shadow-md'
                      : isPassed
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  <span className="block truncate">{stepName}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Header Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-sky-100 text-sky-800 border border-sky-200 rounded-full">
              MEDRESILIENCE AI
            </span>
            <span className="text-xs text-slate-500 font-semibold">REAL-TIME COMMAND CENTER</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            National Health Resilience Overview
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            AI-powered visibility across hospitals and Primary Health Centres
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-primary-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] flex items-center gap-2"
          >
            <Rocket size={16} className="text-yellow-300" />
            <span>🚀 Run Emergency Simulation</span>
          </button>
        </div>
      </div>

      {/* SECTION 8: DASHBOARD KPI CARDS (WHITE THEME) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Healthcare Facilities</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Network size={18} />
            </div>
          </div>
          <div className="text-3xl font-display font-black text-slate-900">{facilitiesCount.toLocaleString()}</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
            <TrendingUp size={14} />
            <span>+3.2% vs last month</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Bed Availability</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Activity size={18} />
            </div>
          </div>
          <div className="text-3xl font-display font-black text-slate-900">{bedAvailabilityPercent}%</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-amber-600">
            <TrendingDown size={14} />
            <span>-1.4% capacity load</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Medicine Availability</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Pill size={18} />
            </div>
          </div>
          <div className="text-3xl font-display font-black text-slate-900">{medicineAvailabilityPercent}%</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-rose-600">
            <AlertTriangle size={14} />
            <span>17 risk items</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Staff Availability</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Users size={18} />
            </div>
          </div>
          <div className="text-3xl font-display font-black text-slate-900">{staffAvailabilityPercent}%</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
            <TrendingUp size={14} />
            <span>Stable coverage</span>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20 relative overflow-hidden group hover:scale-[1.01] transition-all">
          <div className="flex items-center justify-between text-white/80 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">National Resilience</span>
            <div className="p-2 rounded-xl bg-white/20 text-white">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="text-3xl font-display font-black text-white">{nationalResilienceScore} / 100</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-white/90">
            <ShieldAlert size={14} />
            <span>AI Resilience Score</span>
          </div>
        </div>
      </div>

      {/* SECTION 9: AI RISK CENTER (WHITE THEME) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <h2 className="text-xl font-display font-extrabold text-slate-900">AI-Detected Risks</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">3 Critical Risk Clusters Identified</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white border border-rose-200 shadow-md relative flex flex-col justify-between hover:shadow-lg transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-black uppercase tracking-wider border border-rose-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  🔴 Critical Severity
                </span>
                <span className="text-xs text-slate-500 font-mono">94% Confidence</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Critical Medicine Shortage</h3>
              <p className="text-xs text-rose-700 font-semibold mb-3">
                17 facilities predicted to experience shortages within 7 days.
              </p>
              <div className="space-y-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div><span className="text-slate-500 font-bold">Location:</span> Coimbatore & Tiruppur Districts</div>
                <div><span className="text-slate-500 font-bold">Timeframe:</span> Peak shortage in 4 days</div>
                <div><span className="text-slate-500 font-bold">Recommended:</span> Cross-district transfer from DH Coimbatore B</div>
              </div>
            </div>
            <button
              onClick={() => {
                const el = document.getElementById('stock-out-prediction-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View Prediction</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white border border-amber-200 shadow-md relative flex flex-col justify-between hover:shadow-lg transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black uppercase tracking-wider border border-amber-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  🟡 High Risk
                </span>
                <span className="text-xs text-slate-500 font-mono">89% Confidence</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">ICU Capacity Pressure</h3>
              <p className="text-xs text-amber-700 font-semibold mb-3">
                8 districts predicted to exceed 90% ICU utilization.
              </p>
              <div className="space-y-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div><span className="text-slate-500 font-bold">Location:</span> Western TN & Northern Kerala</div>
                <div><span className="text-slate-500 font-bold">Timeframe:</span> Next 48 to 72 hours</div>
                <div><span className="text-slate-500 font-bold">Recommended:</span> Activate non-critical transfer protocols</div>
              </div>
            </div>
            <button
              onClick={() => navigate('/hackathon/beds')}
              className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs border border-amber-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View Capacity Map</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white border border-amber-200 shadow-md relative flex flex-col justify-between hover:shadow-lg transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black uppercase tracking-wider border border-amber-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  🟡 Workforce Deficit
                </span>
                <span className="text-xs text-slate-500 font-mono">86% Confidence</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Workforce Risk</h3>
              <p className="text-xs text-amber-700 font-semibold mb-3">
                12 facilities predicted to experience staffing shortages.
              </p>
              <div className="space-y-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div><span className="text-slate-500 font-bold">Location:</span> Nilgiris Tribal PHC Belt</div>
                <div><span className="text-slate-500 font-bold">Timeframe:</span> Upcoming Weekend Shift</div>
                <div><span className="text-slate-500 font-bold">Recommended:</span> Deploy Tele-ICU physician rotation</div>
              </div>
            </div>
            <button
              onClick={() => navigate('/hackathon/staff')}
              className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs border border-amber-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View Staff Plan</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 10: HEALTH NETWORK MAP (WHITE THEME) */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="text-sky-600" size={22} />
              <h2 className="text-xl font-display font-extrabold text-slate-900">Health Network Map</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive visibility across Indian States, Districts & Healthcare Facilities
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Stable
            </span>
            <span className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Warning
            </span>
            <span className="flex items-center gap-1.5 text-xs text-rose-700 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" /> Critical
            </span>
          </div>
        </div>

        {/* State Selectors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
          {INDIAN_STATES.map((st) => {
            const isSelected = selectedState?.id === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setSelectedState(st)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-500/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{st.name}</span>
                <span
                  className={`px-1.5 py-0.5 text-[9px] rounded-md font-extrabold ${
                    st.status === 'Critical'
                      ? 'bg-rose-100 text-rose-800'
                      : st.status === 'Warning'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {st.resilienceScore}
                </span>
              </button>
            );
          })}
        </div>

        {/* Map Cards Grid */}
        <div className="relative rounded-2xl bg-gradient-to-b from-sky-50/40 to-slate-50 border border-slate-200 p-6 flex flex-col justify-between">
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {INDIAN_STATES.map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setSelectedState(st);
                  setShowDetailModal(true);
                }}
                className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] ${
                  st.id === selectedState?.id
                    ? 'bg-white border-sky-500 shadow-md ring-2 ring-sky-200'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">{st.name}</span>
                  <span
                    className={`w-3 h-3 rounded-full ${
                      st.status === 'Critical'
                        ? 'bg-rose-500 animate-ping'
                        : st.status === 'Warning'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-medium">
                  <div>
                    Facilities: <span className="text-slate-900 font-bold">{st.facilitiesCount}</span>
                  </div>
                  <div>
                    Beds: <span className="text-slate-900 font-bold">{st.bedOccupancyPercent}% occ</span>
                  </div>
                  <div>
                    Meds Risk: <span className="text-slate-900 font-bold">{st.medicineAvailabilityPercent}%</span>
                  </div>
                  <div>
                    Resilience: <span className="text-sky-700 font-bold">{st.resilienceScore}/100</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600">
            <div>
              Selected State:{' '}
              <span className="text-slate-900 font-bold">{selectedState?.name || 'Tamil Nadu'}</span> ({selectedState?.districtsCount} Districts, {selectedState?.facilitiesCount} Facilities)
            </div>
            <button
              onClick={() => setShowDetailModal(true)}
              className="text-sky-700 hover:text-sky-800 font-bold flex items-center gap-1 mt-2 sm:mt-0"
            >
              <span>Inspect District Facilities</span>
              <Maximize2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 11: AI STOCK-OUT PREDICTION (WHITE THEME) */}
      <div id="stock-out-prediction-section" className="p-6 rounded-3xl bg-white border border-rose-300 shadow-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider border border-rose-200">
                PROACTIVE AI FORECAST
              </span>
              <span className="text-xs text-slate-500 font-mono">Confidence: {stockOutPrediction.aiConfidence}%</span>
            </div>
            <h2 className="text-2xl font-display font-black text-slate-900">
              {stockOutPrediction.drugName} Shortage Predicted
            </h2>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">
              Target Facility: <span className="text-slate-900">{stockOutPrediction.facilityName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 border border-rose-200 text-xs font-black uppercase tracking-wider">
              Risk: {stockOutPrediction.riskLevel}
            </span>
          </div>
        </div>

        {/* Prediction Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Current Stock</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stockOutPrediction.currentStock} units</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Daily Consumption</div>
            <div className="text-2xl font-black text-amber-700 mt-1">{stockOutPrediction.dailyConsumption} units/day</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Expected Deficit</div>
            <div className="text-2xl font-black text-rose-700 mt-1">-{stockOutPrediction.expectedShortage} units</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Predicted In</div>
            <div className="text-2xl font-black text-sky-700 mt-1">{stockOutPrediction.daysToShortage} Days</div>
          </div>
        </div>

        {/* Why this prediction? */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Info size={16} className="text-sky-600" />
            Why this prediction?
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stockOutPrediction.reasons.map((reason, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Button to Trigger Redistribution */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              const el = document.getElementById('ai-redistribution-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all"
          >
            <RefreshCw size={16} />
            <span>Generate Redistribution Plan</span>
          </button>
        </div>
      </div>

      {/* SECTION 12: AI REDISTRIBUTION (WHITE THEME) */}
      <div id="ai-redistribution-section" className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="text-sky-600" size={20} />
              <h2 className="text-xl font-display font-extrabold text-slate-900">AI Recommendation</h2>
            </div>
            <p className="text-xs text-slate-500">
              Optimal cross-district resource movement generated by MedResilience AI engine
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              redistributionPlan.status === 'Approved'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : redistributionPlan.status === 'Rejected'
                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            Status: {redistributionPlan.status}
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-6">
          <div className="text-lg font-black text-slate-900 tracking-wide">
            {redistributionPlan.item}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">From Facility</span>
              <span className="text-sm font-bold text-emerald-700">{redistributionPlan.fromFacility}</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="text-xs font-bold text-sky-700 flex items-center gap-1">
                <Truck size={16} />
                <span>{redistributionPlan.distanceKm} km ({redistributionPlan.transportEta})</span>
              </div>
              <ArrowRight className="text-slate-400 my-1" size={20} />
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">To Facility</span>
              <span className="text-sm font-bold text-rose-700">{redistributionPlan.toFacility}</span>
            </div>
          </div>

          {/* Expected Impact */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-500">Expected Impact</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {redistributionPlan.impactPoints.map((pt, i) => (
                <div key={i} className="p-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-emerald-800">
                  {pt}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={rejectRedistribution}
              className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Reset to Pending
            </button>
            <button
              onClick={approveRedistribution}
              className={`px-6 py-2.5 rounded-xl text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                redistributionPlan.status === 'Approved'
                  ? 'bg-emerald-700 hover:bg-emerald-600 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20 hover:scale-[1.02]'
              }`}
            >
              <CheckCircle2 size={16} />
              <span>{redistributionPlan.status === 'Approved' ? '✓ Dispatched — Click to Re-Dispatch' : 'Approve & Dispatch Transfer'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full space-y-6 shadow-2xl relative text-slate-900"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedState?.name} Health Facilities Breakdown</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Capital: {selectedState?.capital} | Total PHCs: {selectedState?.phcs}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-3">
                {DEMO_FACILITIES.map((fac) => (
                  <div key={fac.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{fac.name}</span>
                        <span className="text-[10px] font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-700">{fac.code}</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        Type: {fac.type} | Available Beds: <span className="text-sky-700 font-bold">{fac.availableBeds}/{fac.totalBeds}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        fac.status === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {fac.status}
                      </span>
                      <div className="text-xs text-slate-500 mt-1 font-bold">Resilience: {fac.resilienceScore}/100</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
