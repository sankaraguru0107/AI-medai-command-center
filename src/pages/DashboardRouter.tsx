import React from 'react';
import { useAppStore } from '../store/appStore';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { DoctorDashboard } from '../components/dashboard/DoctorDashboard';
import { NurseDashboard } from '../components/dashboard/NurseDashboard';
import { OperationsDashboard } from '../components/dashboard/OperationsDashboard';
import { AIVerseResilienceDashboard } from '../components/dashboard/AIVerseResilienceDashboard';
import { PatientDashboard } from '../components/dashboard/PatientDashboard';

export const DashboardRouter: React.FC = () => {
  const { user, activeModule } = useAppStore();

  // If a module is selected, route to it
  if (activeModule && activeModule !== 'overview') {
    return <ModulePageRenderer moduleId={activeModule} />;
  }

  // Default: show role-based dashboard
  switch (user?.role) {
    case 'doctor': return <DoctorDashboard />;
    case 'nurse': return <NurseDashboard />;
    case 'operations': return <AIVerseResilienceDashboard />;
    case 'patient': return <PatientDashboard />;
    default: return <AdminDashboard />;
  }
};

// Inline module renderer for routing within sidebar
const ModulePageRenderer: React.FC<{ moduleId: string }> = ({ moduleId }) => {
  const modules: Record<string, React.LazyExoticComponent<React.FC>> = {
    'patients': React.lazy(() => import('../components/modules/PatientRegistryModule').then(m => ({ default: m.PatientRegistryModule }))),
    'medical-profile': React.lazy(() => import('../components/medical-profile/MedicalProfileModule').then(m => ({ default: m.MedicalProfileModule }))),
    'prior-auth': React.lazy(() => import('../components/modules/PriorAuthModule').then(m => ({ default: m.PriorAuthModule }))),
    'benefits-verify': React.lazy(() => import('../components/modules/RCMVerificationModule').then(m => ({ default: m.RCMVerificationModule }))),
    'claims': React.lazy(() => import('../components/modules/ClaimsModule').then(m => ({ default: m.ClaimsModule }))),
    'documentation': React.lazy(() => import('../components/modules/ClinicalDocumentationModule').then(m => ({ default: m.ClinicalDocumentationModule }))),
    'ambient-scribing': React.lazy(() => import('../components/modules/AmbientScribingModule').then(m => ({ default: m.AmbientScribingModule }))),
    'nurse-call': React.lazy(() => import('../components/modules/NurseCallModule').then(m => ({ default: m.NurseCallModule }))),
    'virtual-care': React.lazy(() => import('../components/modules/VirtualCareModule').then(m => ({ default: m.VirtualCareModule }))),
    'bed-management': React.lazy(() => import('../components/modules/BedManagementModule').then(m => ({ default: m.BedManagementModule }))),
    'utilization': React.lazy(() => import('../components/modules/UtilizationModule').then(m => ({ default: m.UtilizationModule }))),
    'fhir-engine': React.lazy(() => import('../components/modules/FHIRModule').then(m => ({ default: m.FHIRModule }))),
    'data-quality': React.lazy(() => import('../components/modules/DataQualityModule').then(m => ({ default: m.DataQualityModule }))),
    'clinical-decision': React.lazy(() => import('../components/modules/ClinicalDecisionModule').then(m => ({ default: m.ClinicalDecisionModule }))),
    'med-alerts': React.lazy(() => import('../components/modules/MedicationAlertsModule').then(m => ({ default: m.MedicationAlertsModule }))),
    'opioid-monitor': React.lazy(() => import('../components/modules/OpioidMonitorModule').then(m => ({ default: m.OpioidMonitorModule }))),
    'soc-dashboard': React.lazy(() => import('../components/modules/SOCDashboard').then(m => ({ default: m.SOCDashboard }))),
    'threat-detection': React.lazy(() => import('../components/modules/ThreatDetectionModule').then(m => ({ default: m.ThreatDetectionModule }))),
    'post-discharge': React.lazy(() => import('../components/modules/PostDischargeModule').then(m => ({ default: m.PostDischargeModule }))),
    'patient-chatbot': React.lazy(() => import('../components/modules/PatientChatbotModule').then(m => ({ default: m.PatientChatbotModule }))),
    'icu-sedation': React.lazy(() => import('../components/modules/ICUSedationModule').then(m => ({ default: m.ICUSedationModule }))),
    'chronic-care': React.lazy(() => import('../components/modules/ChronicCareModule').then(m => ({ default: m.ChronicCareModule }))),
    'maternal': React.lazy(() => import('../components/modules/MaternalModule').then(m => ({ default: m.MaternalModule }))),
    'dialysis': React.lazy(() => import('../components/modules/DialysisModule').then(m => ({ default: m.DialysisModule }))),
    'chemo-toxicity': React.lazy(() => import('../components/modules/ChemoToxicityModule').then(m => ({ default: m.ChemoToxicityModule }))),
    'transfusion': React.lazy(() => import('../components/modules/TransfusionModule').then(m => ({ default: m.TransfusionModule }))),
    'transplant': React.lazy(() => import('../components/modules/TransplantModule').then(m => ({ default: m.TransplantModule }))),
    'radiology-alerts': React.lazy(() => import('../components/modules/RadiologyAlertsModule').then(m => ({ default: m.RadiologyAlertsModule }))),
    'incidental-findings': React.lazy(() => import('../components/modules/IncidentalFindingsModule').then(m => ({ default: m.IncidentalFindingsModule }))),
    'contrast-protocol': React.lazy(() => import('../components/modules/ContrastProtocolModule').then(m => ({ default: m.ContrastProtocolModule }))),
    'rare-disease': React.lazy(() => import('../components/modules/RareDiseaseModule').then(m => ({ default: m.RareDiseaseModule }))),
    'clinical-trials': React.lazy(() => import('../components/modules/ClinicalTrialsModule').then(m => ({ default: m.ClinicalTrialsModule }))),
    'it-helpdesk': React.lazy(() => import('../components/modules/ITHelpdeskModule').then(m => ({ default: m.ITHelpdeskModule }))),
    'app-support': React.lazy(() => import('../components/modules/AppSupportModule').then(m => ({ default: m.AppSupportModule }))),
    'settings': React.lazy(() => import('../components/modules/SettingsModule').then(m => ({ default: m.SettingsModule }))),
  };

  const Module = modules[moduleId];
  if (!Module) return <GenericModulePlaceholder moduleId={moduleId} />;

  return (
    <React.Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" /></div>}>
      <Module />
    </React.Suspense>
  );
};

const GenericModulePlaceholder: React.FC<{ moduleId: string }> = ({ moduleId }) => {
  const { setAIPanelOpen, setAIContext } = useAppStore();

  const moduleNames: Record<string, string> = {
    'benefits-verify': 'Benefits Verification',
    'documentation': 'Clinical Documentation AI',
    'nurse-call': 'Nurse Call System',
    'virtual-care': 'Virtual Care Monitor',
    'utilization': 'Utilization Management',
    'data-quality': 'Data Quality Monitor',
    'clinical-decision': 'Clinical Decision Support',
    'opioid-monitor': 'Opioid & Pain Monitoring',
    'threat-detection': 'Threat Detection',
    'post-discharge': 'Post-Discharge Follow-Up',
    'patient-chatbot': 'Patient Chatbot',
    'icu-sedation': 'ICU Sedation & Delirium',
    'chronic-care': 'Chronic Care RPM',
    'maternal': 'Maternal High-Risk Tracking',
    'dialysis': 'Dialysis Monitoring',
    'chemo-toxicity': 'Chemotherapy Toxicity',
    'transfusion': 'Transfusion Reaction Monitor',
    'transplant': 'Organ Transplant Monitor',
    'radiology-alerts': 'Radiology Critical Findings',
    'incidental-findings': 'Incidental Findings AI',
    'contrast-protocol': 'Contrast Allergy Protocol',
    'rare-disease': 'Rare Disease Diagnostic AI',
    'clinical-trials': 'Clinical Trial Matching',
    'it-helpdesk': 'IT Helpdesk AI',
    'app-support': 'Clinical Application Support',
  };

  const name = moduleNames[moduleId] || moduleId;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-teal flex items-center justify-center mx-auto mb-4 shadow-glow-blue">
          <span className="text-2xl">🏥</span>
        </div>
        <h2 className="text-xl font-display font-bold text-slate-900 mb-2">{name}</h2>

        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => { setAIPanelOpen(true); setAIContext('clinical'); }}
            className="btn-primary text-xs"
          >
            Open AI Assistant
          </button>
          <button className="btn-secondary text-xs">View Documentation</button>
        </div>

        <div className="mt-8 p-4 bg-surface-50 rounded-xl text-left">
          <p className="text-xs font-semibold text-slate-700 mb-2">Module Features:</p>
          <ul className="text-xs text-slate-500 space-y-1">
            <li>• Real-time AI analysis powered by Medii Intelligence Engine</li>
            <li>• Supabase real-time data subscriptions</li>
            <li>• HIPAA-compliant audit logging</li>
            <li>• Role-based access control</li>
            <li>• Configurable alert thresholds</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
