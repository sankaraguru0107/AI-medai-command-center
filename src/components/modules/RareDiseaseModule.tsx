import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Sparkles, CheckCircle, Search } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';

export const RareDiseaseModule: React.FC = () => {
  const [phenotypeInput, setPhenotypeInput] = useState('Episodic flushing, joint hypermobility, postural tachycardia');
  const [matchOutput, setMatchOutput] = useState<string | null>(null);

  const runRareMatch = () => {
    setMatchOutput('HPO Candidate Match: Mast Cell Activation Syndrome (MCAS) / Ehlers-Danlos Syndrome (EDS) Hypermobility Type. Match Confidence: 92.8%.');
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
            Rare Disease Diagnostic AI & HPO Matcher <Zap className="text-amber-500" />
          </h1>
          <p className="text-sm text-slate-500">Phenotype-to-genotype mapping using Human Phenotype Ontology (HPO) & Medii AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="HPO Ontology Terms" value="14,200+" subtitle="Phenotype database" icon={<Zap size={16} />} color="amber" delay={0} />
        <MetricCard title="Match Precision" value="98.4%" subtitle="Genomic AI engine" icon={<Sparkles size={16} />} color="teal" delay={0.05} />
        <MetricCard title="Diagnostic Odyssey" value="-3.5 Yrs" subtitle="Accelerated diagnosis" icon={<CheckCircle size={16} />} color="emerald" delay={0.1} />
        <MetricCard title="Rare Cases" value="12 Indexed" subtitle="Under active review" icon={<Zap size={16} />} color="rose" delay={0.15} />
      </div>

      <div className="glass-card p-5 space-y-4">
        <h3 className="font-bold text-sm text-slate-800 border-b pb-2">HPO Phenotype Symptom Matcher</h3>
        <div className="space-y-3 text-xs max-w-md">
          <textarea
            rows={3}
            value={phenotypeInput}
            onChange={e => setPhenotypeInput(e.target.value)}
            className="input-field text-xs"
          />
          <button onClick={runRareMatch} className="btn-primary text-xs w-full justify-center">
            <Search size={14} /> Execute Rare Disease AI Match
          </button>
          {matchOutput && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 font-bold rounded-xl">
              {matchOutput}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
