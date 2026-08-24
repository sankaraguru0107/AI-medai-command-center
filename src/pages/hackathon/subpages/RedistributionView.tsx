import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Truck, RefreshCw, AlertCircle, ShieldCheck, Clock, MapPin } from 'lucide-react';
import { useHackathonStore } from '../../../store/hackathonStore';

export const RedistributionView: React.FC = () => {
  const { redistributionPlan, approveRedistribution, rejectRedistribution } = useHackathonStore();
  const [activeModal, setActiveModal] = useState(false);

  const isApproved = redistributionPlan.status === 'Approved';

  const handleApproveClick = () => {
    approveRedistribution();
    setActiveModal(true);
  };

  const handleResetClick = () => {
    rejectRedistribution();
    setActiveModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-slate-900">AI Resource Redistribution</h1>
        <p className="text-xs text-slate-500 mt-1">Cross-district automated balancing matrix for beds, medicines, and medical equipment</p>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="text-sky-600 animate-spin" size={20} style={{ animationDuration: '10s' }} />
            <h3 className="text-lg font-bold text-slate-900">Active Recommended Transfer</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            isApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isApproved ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            Status: {isApproved ? 'Approved & Dispatched' : 'Pending Approval'}
          </span>
        </div>

        {/* Transfer Item Banner */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-lg font-black text-slate-900 tracking-wide">
              {redistributionPlan.item}
            </div>
            <span className="text-xs font-mono font-bold bg-sky-100 text-sky-800 px-3 py-1 rounded-lg w-fit">
              ID: {redistributionPlan.id}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">From Facility (Source)</span>
              <span className="text-sm font-black text-emerald-700 block">{redistributionPlan.fromFacility}</span>
              <span className="text-[11px] text-slate-500 font-medium">Surplus Stock: +1,200 vials</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="text-xs font-bold text-sky-700 flex items-center gap-1.5 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 mb-1">
                <Truck size={16} />
                <span>{redistributionPlan.distanceKm} km ({redistributionPlan.transportEta})</span>
              </div>
              <ArrowRight className="text-slate-400 my-1" size={22} />
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">To Facility (Destination)</span>
              <span className="text-sm font-black text-rose-700 block">{redistributionPlan.toFacility}</span>
              <span className="text-[11px] text-slate-500 font-medium">Deficit: -180 vials (4d risk)</span>
            </div>
          </div>

          {/* Expected Impact */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-500">Expected Impact</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {redistributionPlan.impactPoints.map((pt, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons - ALWAYS WORKING & CLICKABLE */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {isApproved && (
              <button
                onClick={handleResetClick}
                className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all"
              >
                Reset to Pending
              </button>
            )}

            <button
              onClick={handleApproveClick}
              className={`px-6 py-3 rounded-xl text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                isApproved
                  ? 'bg-emerald-700 hover:bg-emerald-600 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <CheckCircle2 size={18} />
              <span>{isApproved ? '✓ Dispatched — Click to Re-Dispatch' : 'Approve & Dispatch'}</span>
            </button>
          </div>
        </div>

        {/* Live Active Dispatch Tracking Box */}
        {isApproved && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-300 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-emerald-900 font-black text-sm">
                <Truck size={20} className="text-emerald-600 animate-bounce" />
                <span>EV Fleet Active Dispatch Tracking</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-extrabold uppercase">
                IN TRANSIT
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-slate-700">
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Vehicle ID</span>
                <span className="font-extrabold text-slate-900">EV-MED-TN-402</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Driver</span>
                <span className="font-extrabold text-slate-900">K. Ramesh (Certified Cold-Chain)</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">Temp Control</span>
                <span className="font-extrabold text-emerald-700">4.2°C (Optimal)</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-200">
                <span className="text-slate-500 font-bold block text-[10px] uppercase">GPS ETA</span>
                <span className="font-extrabold text-sky-700">1 hour 15 mins</span>
              </div>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full w-2/3 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
