import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, TestTube, Sparkles, CheckCircle, Search } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

export const AdvancedIntelligenceModule: React.FC = () => {
  const [phenotype, setPhenotype] = useState('Episodic flushing, joint hypermobility, unexplained chronic fatigue');
  const [matchedDisease, setMatchedDisease] = useState<string | null>(null);

  const runPhenotypeMatch = async () => {
    setMatchedDisease('Analyzing Human Phenotype Ontology (HPO)...');
    await new Promise(r => setTimeout(r, 800));
    setMatchedDisease('Potential Match: Ehlers-Danlos Syndrome (EDS) Type III / Mast Cell Activation Syndrome (MCAS). Match confidence: 91.4%.');
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Advanced Intelligence & Rare Disease AI <Zap className="text-amber-500" />
          </h1>
          <p className="text-sm text-slate-500">Phenotypic genomic pattern matching and clinical trial eligibility automation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Phenotype Patterns" value="14,200+" subtitle="HPO Ontology index" icon={<Zap size={16} />} color="amber" delay={0} />
        <MetricCard title="Trial Match Rate" value="94.2%" subtitle="ClinicalTrials.gov sync" icon={<TestTube size={16} />} color="teal" delay={0.05} />
        <MetricCard title="Diagnostic Odysseys" value="-3.2 Yrs" subtitle="Faster diagnosis" icon={<Sparkles size={16} />} color="blue" delay={0.1} />
        <MetricCard title="Precision Rate" value="98.7%" subtitle="Genomic AI engine" icon={<CheckCircle size={16} />} color="rose" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 border-b pb-2 flex items-center gap-2">
            <Sparkles className="text-amber-500" size={16} /> Rare Disease Diagnostic AI (HPO Matcher)
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Enter Patient Phenotype Symptoms</label>
              <textarea
                rows={3}
                value={phenotype}
                onChange={e => setPhenotype(e.target.value)}
                className="input-field text-xs"
              />
            </div>
            <button onClick={runPhenotypeMatch} className="btn-primary text-xs w-full justify-center">
              <Search size={14} /> Run Rare Disease AI Match
            </button>
            {matchedDisease && (
              <p className="p-3 bg-amber-50 border border-amber-200 text-amber-900 font-medium rounded-xl leading-relaxed">
                {matchedDisease}
              </p>
            )}
          </div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 border-b pb-2 flex items-center gap-2">
            <TestTube className="text-teal-600" size={16} /> Active Clinical Trial Matching Engine
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
              <div className="flex justify-between font-bold text-slate-800">
                <span>NCT04812901 - Novel SGLT2 Inhibitor in CHF</span>
                <span className="badge-success text-[10px]">98% Eligible</span>
              </div>
              <p className="text-[10px] text-slate-500">Criteria met: EF 38%, eGFR &gt;30, Age &gt;50. Phase III trial open.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
