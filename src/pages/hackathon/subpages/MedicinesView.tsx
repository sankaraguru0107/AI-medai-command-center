import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useHackathonStore } from '../../../store/hackathonStore';

export const MedicinesView: React.FC = () => {
  const { stockOutPrediction } = useHackathonStore();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-slate-900">Medicine Stock-Out Intelligence</h1>
        <p className="text-xs text-slate-500 mt-1">Predictive supply chain tracking for essential antibiotics, IV solutions, and oxygen</p>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-rose-300 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
            <AlertTriangle size={18} />
            <span>Active Stock-Out Forecast</span>
          </div>
          <span className="text-xs font-mono text-slate-500">Target: {stockOutPrediction.facilityCode}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block font-bold">Drug Name</span>
            <span className="text-sm font-black text-slate-900">{stockOutPrediction.drugName}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-bold">Current Stock</span>
            <span className="text-sm font-black text-slate-900">{stockOutPrediction.currentStock} units</span>
          </div>
          <div>
            <span className="text-slate-500 block font-bold">Burn Rate</span>
            <span className="text-sm font-black text-amber-700">{stockOutPrediction.dailyConsumption} units/day</span>
          </div>
          <div>
            <span className="text-slate-500 block font-bold">Predicted Deficit</span>
            <span className="text-sm font-black text-rose-700">-{stockOutPrediction.expectedShortage} units ({stockOutPrediction.daysToShortage}d)</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <span className="font-bold text-slate-700">AI Risk Analysis Factors:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
            {stockOutPrediction.reasons.map((r, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
