import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Brain, CheckCircle, Database, RefreshCw, Server, Zap,
  XCircle, Filter, Settings, ShieldAlert, AlertTriangle, Plus
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { TrendChart } from '../charts';
import { askMedAI } from '../../services/azureOpenAI';

interface ValidationRule {
  id: string;
  name: string;
  type: 'Schema' | 'Clinical' | 'Logic';
  status: 'enabled' | 'disabled';
  violations: number;
  description: string;
}

interface Violation {
  id: string;
  ruleId: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  time: string;
  status: 'active' | 'resolved';
}

const initialRules: ValidationRule[] = [
  { id: 'R001', name: 'Patient birthDate Presence', type: 'Schema', status: 'enabled', violations: 1, description: 'Verifies that the birthDate element is present in all Patient resources.' },
  { id: 'R002', name: 'Lab Value Range Bounds', type: 'Clinical', status: 'enabled', violations: 1, description: 'Ensures that lab result values do not exceed physiological or logical bounds (e.g., negative values).' },
  { id: 'R003', name: 'Encounter Temporal Logic', type: 'Logic', status: 'enabled', violations: 0, description: 'Checks that encounter end time is after the start time.' },
  { id: 'R004', name: 'MedicationRequest Practitioner', type: 'Schema', status: 'enabled', violations: 2, description: 'Verifies that all MedicationRequest resources specify a prescribing practitioner.' },
  { id: 'R005', name: 'Cross-Resource Diagnosis Match', type: 'Clinical', status: 'enabled', violations: 0, description: 'Checks if prescribed high-risk medications have a corresponding active diagnosis.' },
];

const initialViolations: Violation[] = [
  { id: 'V001', ruleId: 'R002', description: 'Observation O-9821: Lab value -45 is negative (out of range)', severity: 'high', source: 'Lab Systems', time: '5m ago', status: 'active' },
  { id: 'V002', ruleId: 'R004', description: 'MedicationRequest M-1049: Missing prescribing practitioner reference', severity: 'medium', source: 'Epic EHR', time: '12m ago', status: 'active' },
  { id: 'V003', ruleId: 'R004', description: 'MedicationRequest M-1077: Missing prescribing practitioner reference', severity: 'medium', source: 'Cerner', time: '25m ago', status: 'active' },
  { id: 'V004', ruleId: 'R001', description: 'Patient P-1029: Missing birthDate field in Epic FHIR Resource', severity: 'high', source: 'Epic EHR', time: '1h ago', status: 'active' },
];

const trendData = Array.from({ length: 12 }, (_, i) => ({
  time: `${i * 2}h`,
  completeness: 97.5 + Math.random() * 2,
  violations: Math.round(5 + Math.random() * 8),
}));

const severityConfig = {
  critical: 'bg-rose-50 border-rose-300 text-rose-700',
  high: 'bg-orange-50 border-orange-300 text-orange-700',
  medium: 'bg-amber-50 border-amber-300 text-amber-700',
  low: 'bg-blue-50 border-blue-300 text-blue-700',
};

export const DataQualityModule: React.FC = () => {
  const [rules, setRules] = useState<ValidationRule[]>(initialRules);
  const [violations, setViolations] = useState<Violation[]>(initialViolations);
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'violations' | 'rules'>('violations');
  const [aiResult, setAiResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [newRuleName, setNewRuleName] = useState<string>('');
  const [newRuleType, setNewRuleType] = useState<'Schema' | 'Clinical' | 'Logic'>('Schema');
  const [newRuleDesc, setNewRuleDesc] = useState<string>('');
  const [showAddRule, setShowAddRule] = useState<boolean>(false);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(rule =>
      rule.id === id ? { ...rule, status: rule.status === 'enabled' ? 'disabled' : 'enabled' } : rule
    ));
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    const newRule: ValidationRule = {
      id: `R00${rules.length + 1}`,
      name: newRuleName,
      type: newRuleType,
      status: 'enabled',
      violations: 0,
      description: newRuleDesc || 'Custom user-defined validation rule.'
    };

    setRules(prev => [...prev, newRule]);
    setNewRuleName('');
    setNewRuleDesc('');
    setShowAddRule(false);
  };

  const runAIQualityAudit = async (action: string) => {
    setLoading(true);
    setAiResult('');
    try {
      const activeRules = rules.filter(r => r.status === 'enabled').map(r => r.name).join(', ');
      const currentViolations = violations.map(v => `${v.source}: ${v.description} (${v.severity})`).join('\n');
      const prompt = `${action}\n\nActive Rules:\n${activeRules}\n\nRecent Violations:\n${currentViolations}\n\nSelected Source: ${selectedSource}`;
      
      const res = await askMedAI(prompt, 'operations');
      setAiResult(res);
    } catch (err) {
      setAiResult('Error communicating with Azure OpenAI. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const filteredViolations = selectedSource === 'All'
    ? violations
    : violations.filter(v => v.source === selectedSource);

  const totalViolations = filteredViolations.length;
  const activeRulesCount = rules.filter(r => r.status === 'enabled').length;

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Data Quality Monitor</h1>
          <p className="text-sm text-slate-400">Clinical data validation · FHIR profile compliance & integrity</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
            <Filter size={13} className="text-slate-400" />
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="text-xs font-semibold text-slate-600 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="All">All Sources</option>
              <option value="Epic EHR">Epic EHR</option>
              <option value="Cerner">Cerner</option>
              <option value="Lab Systems">Lab Systems</option>
              <option value="Pharmacy">Pharmacy</option>
            </select>
          </div>
          <button
            onClick={() => runAIQualityAudit('Perform a comprehensive AI data quality audit, analyze anomalies, and suggest corrections.')}
            className="btn-primary text-xs flex items-center gap-1.5"
            disabled={loading}
          >
            <Brain size={13} />
            AI Quality Audit
          </button>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Completeness" value="98.6%" subtitle="Required FHIR fields" trend={0.4} icon={<Database size={16} />} color="blue" delay={0} />
        <MetricCard title="Schema Validity" value="99.2%" subtitle="Profile compliance" trend={0.1} icon={<CheckCircle size={16} />} color="emerald" delay={0.05} />
        <MetricCard title="Logical Consistency" value="97.8%" subtitle="Cross-resource logic" trend={-0.3} icon={<Activity size={16} />} color="violet" delay={0.1} />
        <MetricCard title="Active Violations" value={totalViolations} subtitle={`${selectedSource} source`} icon={<ShieldAlert size={16} />} color="rose" delay={0.15} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Violations & Rules */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-surface-100 bg-surface-50 p-2 gap-2">
              <button
                onClick={() => setActiveTab('violations')}
                className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'violations'
                    ? 'bg-white text-primary-700 shadow-sm border border-slate-100'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Active Violations ({totalViolations})
              </button>
              <button
                onClick={() => setActiveTab('rules')}
                className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'rules'
                    ? 'bg-white text-primary-700 shadow-sm border border-slate-100'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Validation Rules ({activeRulesCount}/{rules.length} Active)
              </button>
            </div>

            {/* Tab Panels */}
            <div className="p-5">
              {activeTab === 'violations' ? (
                <div className="space-y-3">
                  {filteredViolations.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle size={32} className="text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700">No active violations</p>
                      <p className="text-xs text-slate-400">All clinical data matches the active validation rules.</p>
                    </div>
                  ) : (
                    filteredViolations.map(violation => (
                      <div
                        key={violation.id}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors bg-white hover:border-slate-300`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          violation.severity === 'critical' ? 'bg-rose-500 animate-pulse' :
                          violation.severity === 'high' ? 'bg-orange-500' :
                          violation.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-slate-700 truncate">{violation.description}</p>
                            <span className="text-[10px] text-slate-400 shrink-0">{violation.time}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                              {violation.source}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${severityConfig[violation.severity]}`}>
                              {violation.severity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-slate-400">Configure real-time schema validation and clinical checks.</p>
                    <button
                      onClick={() => setShowAddRule(!showAddRule)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Rule
                    </button>
                  </div>

                  {showAddRule && (
                    <motion.form
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleAddRule}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
                    >
                      <p className="text-xs font-bold text-slate-700">Add New Validation Rule</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase">Rule Name</label>
                          <input
                            type="text"
                            required
                            value={newRuleName}
                            onChange={(e) => setNewRuleName(e.target.value)}
                            placeholder="e.g. Patient Gender Presence"
                            className="mt-1 w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase">Rule Type</label>
                          <select
                            value={newRuleType}
                            onChange={(e) => setNewRuleType(e.target.value as any)}
                            className="mt-1 w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                          >
                            <option value="Schema">Schema</option>
                            <option value="Clinical">Clinical</option>
                            <option value="Logic">Logic</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase">Description</label>
                        <textarea
                          value={newRuleDesc}
                          onChange={(e) => setNewRuleDesc(e.target.value)}
                          placeholder="Describe the validation rule..."
                          rows={2}
                          className="mt-1 w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddRule(false)}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs rounded-lg font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs rounded-lg font-medium"
                        >
                          Save Rule
                        </button>
                      </div>
                    </motion.form>
                  )}

                  <div className="space-y-3">
                    {rules.map(rule => (
                      <div
                        key={rule.id}
                        className="flex items-start justify-between p-3.5 rounded-xl border border-slate-100 bg-white hover:border-slate-200"
                      >
                        <div className="space-y-1 max-w-[75%]">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-700">{rule.name}</p>
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                              {rule.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{rule.description}</p>
                          {rule.violations > 0 && rule.status === 'enabled' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-semibold mt-1">
                              <AlertTriangle size={10} /> {rule.violations} active violations
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleRule(rule.id)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                              rule.status === 'enabled' ? 'bg-primary-600' : 'bg-slate-200'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                                rule.status === 'enabled' ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Trend & AI Panel */}
        <div className="space-y-4">
          {/* Trend Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5">
            <h3 className="font-display font-semibold text-slate-800 text-sm mb-3">Completeness & Error Trend</h3>
            <TrendChart
              data={trendData}
              lines={[
                { key: 'completeness', label: 'Completeness %', color: '#0c90e6' },
                { key: 'violations', label: 'Violations', color: '#e11d48' }
              ]}
              xKey="time"
              height={140}
            />
          </motion.div>

          {/* AI Panel */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
            <h3 className="font-display font-semibold text-slate-800 text-sm mb-3">AI Quality Assistant</h3>
            <p className="text-xs text-slate-400 mb-3">Use clinical AI to run validation audits, recommend rules, or identify data anomalies.</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { label: 'Suggest Rules', prompt: 'Analyze our current rules and suggest 3 new schema or logic validation rules for clinical FHIR resources.' },
                { label: 'Analyze Anomalies', prompt: 'Review our active violations and explain the clinical and operational risk of these issues.' }
              ].map(action => (
                <button
                  key={action.label}
                  onClick={() => runAIQualityAudit(action.prompt)}
                  disabled={loading}
                  className="px-2.5 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs rounded-lg font-medium flex items-center gap-1 disabled:opacity-50"
                >
                  <Zap size={10} />
                  {action.label}
                </button>
              ))}
            </div>

            {(loading || aiResult) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3.5 bg-primary-50 border border-primary-100 rounded-xl">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Brain size={12} className="text-primary-500" />
                  <span className="text-xs font-semibold text-primary-700">AI Quality Analysis</span>
                </div>
                {loading ? (
                  <div className="flex gap-1 py-2">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{aiResult}</p>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
};
