import { PatientMedicalProfile } from '../types/medicalRecord';

// Realistic SVG Medical Scan Placeholders
const createBrainMriSvg = (sliceText: string, sliceNum: number) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <rect width="600" height="600" fill="#050508"/>
  <!-- Skull Outline -->
  <ellipse cx="300" cy="300" rx="210" ry="245" fill="#181822" stroke="#4a5568" stroke-width="4"/>
  <ellipse cx="300" cy="300" rx="195" ry="230" fill="#0d0e14" stroke="#2d3748" stroke-width="2"/>
  <!-- Brain Parenchyma Gray/White Matter -->
  <path d="M 200 180 Q 230 140 300 140 Q 370 140 400 180 Q 430 250 420 340 Q 400 420 300 440 Q 200 420 180 340 Z" fill="#252836" opacity="0.85"/>
  <!-- Cerebral Ventricles -->
  <path d="M 285 240 Q 270 290 280 330 Q 295 300 290 240 Z" fill="#050508" stroke="#4a5568" stroke-width="1.5"/>
  <path d="M 315 240 Q 330 290 320 330 Q 305 300 310 240 Z" fill="#050508" stroke="#4a5568" stroke-width="1.5"/>
  <!-- Gyri & Sulci Texture -->
  <path d="M 220 220 Q 260 210 275 250 Q 240 280 210 260 Z" fill="#32374a" opacity="0.7"/>
  <path d="M 380 220 Q 340 210 325 250 Q 360 280 390 260 Z" fill="#32374a" opacity="0.7"/>
  <path d="M 210 320 Q 250 350 280 350 Q 260 380 220 370 Z" fill="#32374a" opacity="0.7"/>
  <path d="M 390 320 Q 350 350 320 350 Q 340 380 380 370 Z" fill="#32374a" opacity="0.7"/>
  <!-- Clinical Annotations HUD -->
  <text x="30" y="45" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold">MRI BRAIN AXIAL T2 / FLAIR</text>
  <text x="30" y="70" fill="#94a3b8" font-family="monospace" font-size="12">TR: 9000ms | TE: 110ms | FOV: 240mm</text>
  <text x="30" y="90" fill="#94a3b8" font-family="monospace" font-size="12">SLICE: ${sliceNum}/4 · ${sliceText}</text>
  <text x="440" y="45" fill="#e2e8f0" font-family="monospace" font-size="13">JAMES WILSON (68M)</text>
  <text x="440" y="68" fill="#38bdf8" font-family="monospace" font-size="11">MRN: 2026-8849</text>
  <text x="440" y="88" fill="#94a3b8" font-family="monospace" font-size="11">MEMORIAL RADIOLOGY</text>
  <!-- Orientation Markers -->
  <text x="295" y="35" fill="#e2e8f0" font-family="sans-serif" font-size="16" font-weight="bold">A</text>
  <text x="295" y="585" fill="#e2e8f0" font-family="sans-serif" font-size="16" font-weight="bold">P</text>
  <text x="15" y="305" fill="#e2e8f0" font-family="sans-serif" font-size="16" font-weight="bold">R</text>
  <text x="575" y="305" fill="#e2e8f0" font-family="sans-serif" font-size="16" font-weight="bold">L</text>
  <!-- Crosshairs -->
  <line x1="300" y1="285" x2="300" y2="315" stroke="#38bdf8" stroke-width="1" opacity="0.6"/>
  <line x1="285" y1="300" x2="315" y2="300" stroke="#38bdf8" stroke-width="1" opacity="0.6"/>
</svg>
`)}`;

const createChestCtSvg = () => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <rect width="600" height="600" fill="#04060a"/>
  <!-- Thoracic Cage Ring -->
  <ellipse cx="300" cy="310" rx="230" ry="190" fill="#10141f" stroke="#475569" stroke-width="4"/>
  <!-- Spine & Vertebral Body -->
  <rect x="280" y="440" width="40" height="35" rx="8" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2"/>
  <circle cx="300" cy="457" r="8" fill="#04060a"/>
  <!-- Sternum -->
  <rect x="285" y="130" width="30" height="15" rx="4" fill="#cbd5e1"/>
  <!-- Right Lung Field (Dark Air Filled) -->
  <path d="M 140 220 Q 240 180 270 240 Q 280 340 260 410 Q 180 430 130 350 Z" fill="#080c14" stroke="#334155" stroke-width="2"/>
  <!-- Left Lung Field -->
  <path d="M 460 220 Q 360 180 330 240 Q 320 340 340 410 Q 420 430 470 350 Z" fill="#080c14" stroke="#334155" stroke-width="2"/>
  <!-- Mediastinum & Cardiac Silhouette -->
  <ellipse cx="320" cy="300" rx="65" ry="75" fill="#334155" opacity="0.9"/>
  <!-- Aorta & Pulmonary Vasculature -->
  <circle cx="285" cy="270" r="18" fill="#64748b"/>
  <circle cx="310" cy="245" r="16" fill="#64748b"/>
  <!-- Rib Profiles -->
  <ellipse cx="100" cy="250" rx="8" ry="14" fill="#e2e8f0"/>
  <ellipse cx="90" cy="310" rx="8" ry="14" fill="#e2e8f0"/>
  <ellipse cx="100" cy="370" rx="8" ry="14" fill="#e2e8f0"/>
  <ellipse cx="500" cy="250" rx="8" ry="14" fill="#e2e8f0"/>
  <ellipse cx="510" cy="310" rx="8" ry="14" fill="#e2e8f0"/>
  <ellipse cx="500" cy="370" rx="8" ry="14" fill="#e2e8f0"/>
  <!-- HUD Text -->
  <text x="30" y="45" fill="#0284c7" font-family="monospace" font-size="14" font-weight="bold">CT CHEST WITH IV CONTRAST (AXIAL)</text>
  <text x="30" y="70" fill="#94a3b8" font-family="monospace" font-size="12">120 kV | 250 mA | Slice: 1.25mm</text>
  <text x="440" y="45" fill="#e2e8f0" font-family="monospace" font-size="13">JAMES WILSON (68M)</text>
  <text x="440" y="68" fill="#0284c7" font-family="monospace" font-size="11">NO PE DETECTED</text>
</svg>
`)}`;

const createChestXRaySvg = () => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <rect width="600" height="600" fill="#08080c"/>
  <!-- Clavicles -->
  <path d="M 120 150 Q 200 170 280 180" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round" fill="none"/>
  <path d="M 480 150 Q 400 170 320 180" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round" fill="none"/>
  <!-- Spine Column -->
  <line x1="300" y1="120" x2="300" y2="520" stroke="#94a3b8" stroke-width="18" stroke-linecap="round" stroke-dasharray="14 4"/>
  <!-- Ribcage Arcs -->
  <path d="M 160 210 Q 240 230 290 220" stroke="#64748b" stroke-width="5" fill="none"/>
  <path d="M 140 260 Q 230 290 290 270" stroke="#64748b" stroke-width="5" fill="none"/>
  <path d="M 130 320 Q 220 350 290 330" stroke="#64748b" stroke-width="5" fill="none"/>
  <path d="M 130 390 Q 220 420 290 400" stroke="#64748b" stroke-width="5" fill="none"/>
  <path d="M 440 210 Q 360 230 310 220" stroke="#64748b" stroke-width="5" fill="none"/>
  <path d="M 460 260 Q 370 290 310 270" stroke="#64748b" stroke-width="5" fill="none"/>
  <path d="M 470 320 Q 380 350 310 330" stroke="#64748b" stroke-width="5" fill="none"/>
  <path d="M 470 390 Q 380 420 310 400" stroke="#64748b" stroke-width="5" fill="none"/>
  <!-- Cardiac Silhouette -->
  <path d="M 290 310 Q 340 330 370 410 Q 310 460 250 460 Q 230 380 290 310 Z" fill="#cbd5e1" opacity="0.85"/>
  <!-- Diaphragm Domes -->
  <path d="M 100 480 Q 200 440 300 470 Q 400 430 500 480" stroke="#cbd5e1" stroke-width="6" fill="#1e293b" opacity="0.6"/>
  <!-- Annotation -->
  <text x="30" y="45" fill="#f8fafc" font-family="monospace" font-size="14" font-weight="bold">CHEST X-RAY (PA ERECT VIEW)</text>
  <text x="30" y="70" fill="#94a3b8" font-family="monospace" font-size="12">Normal cardiothoracic ratio (0.46) · Clear CP angles</text>
  <text x="540" y="80" fill="#ef4444" font-family="sans-serif" font-size="28" font-weight="bold">R</text>
</svg>
`)}`;

const createEcgSvg = () => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 350" width="100%" height="100%">
  <rect width="700" height="350" fill="#030712"/>
  <!-- Medical ECG Grid -->
  <defs>
    <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1f2937" stroke-width="0.5"/>
    </pattern>
    <pattern id="largeGrid" width="50" height="50" patternUnits="userSpaceOnUse">
      <rect width="50" height="50" fill="url(#smallGrid)"/>
      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#374151" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="700" height="350" fill="url(#largeGrid)"/>
  <!-- ECG Lead II Rhythm Trace -->
  <path d="M 20 180 L 80 180 Q 90 180 95 170 Q 100 160 105 180 L 120 180 L 125 190 L 135 70 L 145 220 L 150 180 L 165 180 Q 180 145 195 180 L 260 180 Q 270 180 275 170 Q 280 160 285 180 L 300 180 L 305 190 L 315 70 L 325 220 L 330 180 L 345 180 Q 360 145 375 180 L 440 180 Q 450 180 455 170 Q 460 160 465 180 L 480 180 L 485 190 L 495 70 L 505 220 L 510 180 L 525 180 Q 540 145 555 180 L 680 180" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round"/>
  <!-- HUD Text -->
  <text x="30" y="35" fill="#10b981" font-family="monospace" font-size="14" font-weight="bold">12-LEAD DIAGNOSTIC ECG · LEAD II RHYTHM STRIP</text>
  <text x="30" y="60" fill="#9ca3af" font-family="monospace" font-size="12">HR: 74 BPM | Normal Sinus Rhythm | PR: 162ms | QRS: 88ms | QTc: 418ms</text>
  <text x="520" y="35" fill="#f3f4f6" font-family="monospace" font-size="12">25 mm/s · 10 mm/mV</text>
</svg>
`)}`;

export const demoPatientRecord: PatientMedicalProfile = {
  id: 'p-001',
  mrn: 'MRN-2026-8849',
  fullName: 'James Alexander Wilson',
  dob: '1958-04-12',
  age: 68,
  gender: 'Male',
  bloodGroup: 'O+',
  heightCm: 178,
  weightKg: 82,
  bmi: 25.9,
  avatarUrl: '',

  primaryEmergencyContact: {
    id: 'ec-1',
    name: 'Sarah Wilson',
    relationship: 'Spouse / Wife',
    phone: '+1 (555) 234-8910',
    altPhone: '+1 (555) 234-8911',
    email: 'sarah.wilson@email.com',
    isPrimary: true,
  },
  secondaryEmergencyContact: {
    id: 'ec-2',
    name: 'Michael Wilson',
    relationship: 'Son (Adult Child)',
    phone: '+1 (555) 890-4421',
    isPrimary: false,
  },

  primaryDoctor: {
    name: 'Dr. Emily Chen, MD',
    specialty: 'Internal Medicine & Primary Care',
    hospital: 'Memorial Health University Medical Center',
    phone: '+1 (555) 902-1100',
    email: 'e.chen@memorialhealth.org',
  },
  primaryHospital: {
    name: 'Memorial Health University Medical Center',
    address: '1420 Medical Center Parkway, Pavilion Suite 400',
    emergencyLine: '+1 (555) 911-3000',
  },

  insuranceProvider: 'Blue Cross Blue Shield Comprehensive Medicare Advantage',
  insurancePolicyNumber: 'BCBS-9948201-P',
  organDonorStatus: true,
  advancedDirective: true,
  implantedDevices: ['None (No pacemaker, no ICD, no neurostimulator, no vascular stents)'],
  emergencyNotes: 'CRITICAL: Severe Penicillin allergy causes acute anaphylaxis and airway closure. Patient carries EpiPen. Do NOT administer Beta-Lactam antibiotics.',
  lastUpdated: '2026-08-14T09:30:00Z',
  lastUpdatedBy: 'Dr. Emily Chen, MD (Verified)',

  allergies: [
    {
      id: 'alg-1',
      name: 'Penicillin (All Beta-Lactams)',
      type: 'Drug / Medication',
      severity: 'Critical',
      reaction: 'Anaphylaxis, severe bronchospasm, facial angioedema, hypotension',
      dateIdentified: '1998-06-14',
      notes: 'Requires immediate Epinephrine and avoidance of Amoxicillin, Ampicillin, Piperacillin, and 1st gen Cephalosporins.',
      isVerified: true,
      verifiedBy: 'Dr. Emily Chen, MD',
    },
    {
      id: 'alg-2',
      name: 'Peanuts & Tree Nuts',
      type: 'Food',
      severity: 'Severe',
      reaction: 'Generalized urticaria, throat tightness, severe wheezing',
      dateIdentified: '1975-11-20',
      notes: 'Carries twin-pack Auvi-Q / EpiPen auto-injectors at all times.',
      isVerified: true,
      verifiedBy: 'Dr. Robert Kim, MD',
    },
    {
      id: 'alg-3',
      name: 'Sulfonamides (Sulfa Drugs)',
      type: 'Drug / Medication',
      severity: 'Moderate',
      reaction: 'Maculopapular rash, pruritus, mild facial swelling',
      dateIdentified: '2012-03-05',
      notes: 'Avoid Bactrim / Septra (TMP-SMX).',
      isVerified: true,
      verifiedBy: 'Dr. Emily Chen, MD',
    },
  ],

  medications: [
    {
      id: 'med-1',
      name: 'Metformin Hydrochloride',
      dosage: '500 mg',
      frequency: 'Twice daily (BID)',
      route: 'Oral',
      timing: 'Morning (08:00) & Evening (20:00) with meals',
      reason: 'Type 2 Diabetes Mellitus glycemic control',
      startDate: '2023-03-15',
      prescribingDoctor: 'Dr. Emily Chen, MD',
      hospital: 'Memorial Health University Medical Center',
      status: 'Active',
      specialInstructions: 'Hold prior to IV iodinated radiocontrast procedures.',
      isEmergencyCritical: true,
      isVerified: true,
      verifiedBy: 'Dr. Emily Chen, MD',
    },
    {
      id: 'med-2',
      name: 'Lisinopril',
      dosage: '10 mg',
      frequency: 'Once daily (QD)',
      route: 'Oral',
      timing: 'Morning (08:00)',
      reason: 'Essential Hypertension and renal protection',
      startDate: '2022-09-10',
      prescribingDoctor: 'Dr. Emily Chen, MD',
      hospital: 'Memorial Health University Medical Center',
      status: 'Active',
      specialInstructions: 'Monitor potassium and renal function panels biannually.',
      isEmergencyCritical: true,
      isVerified: true,
      verifiedBy: 'Dr. Emily Chen, MD',
    },
    {
      id: 'med-3',
      name: 'Atorvastatin Calcium',
      dosage: '40 mg',
      frequency: 'Once daily (QD)',
      route: 'Oral',
      timing: 'Bedtime (21:00)',
      reason: 'Hyperlipidemia and primary ASCVD prevention',
      startDate: '2021-04-18',
      prescribingDoctor: 'Dr. Marcus Brody, MD (Cardiology)',
      hospital: 'Heart & Vascular Pavilion',
      status: 'Active',
      specialInstructions: 'Report unexplained muscle pain or brown urine immediately.',
      isEmergencyCritical: false,
      isVerified: true,
      verifiedBy: 'Dr. Marcus Brody, MD',
    },
    {
      id: 'med-4',
      name: 'Aspirin (Enteric Coated)',
      dosage: '81 mg',
      frequency: 'Once daily (QD)',
      route: 'Oral',
      timing: 'Morning (08:00)',
      reason: 'Cardiovascular antiplatelet prophylaxis',
      startDate: '2022-10-01',
      prescribingDoctor: 'Dr. Marcus Brody, MD',
      hospital: 'Heart & Vascular Pavilion',
      status: 'Active',
      specialInstructions: 'Bleeding precaution. Notify surgeon prior to elective procedures.',
      isEmergencyCritical: true,
      isVerified: true,
      verifiedBy: 'Dr. Marcus Brody, MD',
    },
    {
      id: 'med-5',
      name: 'Albuterol Sulfate HFA Inhaler',
      dosage: '90 mcg/actuation',
      frequency: '1-2 puffs every 4-6 hours PRN',
      route: 'Inhalation',
      timing: 'As needed for acute wheezing or shortness of breath',
      reason: 'Mild intermittent asthma exacerbation rescue',
      startDate: '2019-07-22',
      prescribingDoctor: 'Dr. Emily Chen, MD',
      hospital: 'Memorial Health Center',
      status: 'Active',
      specialInstructions: 'Use with spacer device for maximum lung deposition.',
      isEmergencyCritical: true,
      isVerified: true,
      verifiedBy: 'Dr. Emily Chen, MD',
    },
  ],

  conditions: [
    {
      id: 'cnd-1',
      name: 'Type 2 Diabetes Mellitus without acute complications',
      icd10Code: 'E11.9',
      diagnosisDate: '2023-03-10',
      severity: 'Moderate',
      status: 'Controlled',
      treatingDoctor: 'Dr. Emily Chen, MD',
      hospital: 'Memorial Health Clinic',
      currentTreatment: 'Metformin 500mg BID + Low glycemic dietary regimen',
      notes: 'Most recent HbA1c: 7.2% (Target < 7.5%). No diabetic retinopathy on 2025 fundoscopy.',
      isVerified: true,
      verifiedBy: 'Dr. Emily Chen, MD',
    },
    {
      id: 'cnd-2',
      name: 'Essential (Primary) Hypertension',
      icd10Code: 'I10',
      diagnosisDate: '2022-09-02',
      severity: 'Moderate',
      status: 'Controlled',
      treatingDoctor: 'Dr. Emily Chen, MD',
      hospital: 'Memorial Health Clinic',
      currentTreatment: 'Lisinopril 10mg daily',
      notes: 'Baseline resting BP: 124/78 mmHg. Home BP log verified.',
      isVerified: true,
      verifiedBy: 'Dr. Emily Chen, MD',
    },
    {
      id: 'cnd-3',
      name: 'Hyperlipidemia / Mixed Dyslipidemia',
      icd10Code: 'E78.2',
      diagnosisDate: '2021-04-12',
      severity: 'Mild',
      status: 'Controlled',
      treatingDoctor: 'Dr. Marcus Brody, MD',
      hospital: 'Heart & Vascular Institute',
      currentTreatment: 'Atorvastatin 40mg daily',
      notes: 'LDL lowered from 162 mg/dL to 88 mg/dL.',
      isVerified: true,
      verifiedBy: 'Dr. Marcus Brody, MD',
    },
    {
      id: 'cnd-4',
      name: 'Mild Intermittent Asthma',
      icd10Code: 'J45.20',
      diagnosisDate: '2019-07-15',
      severity: 'Mild',
      status: 'Controlled',
      treatingDoctor: 'Dr. Emily Chen, MD',
      hospital: 'Memorial Health Clinic',
      currentTreatment: 'Albuterol HFA Inhaler PRN',
      notes: 'Triggered by cold weather and viral upper respiratory infections.',
      isVerified: true,
      verifiedBy: 'Dr. Emily Chen, MD',
    },
  ],

  surgeries: [
    {
      id: 'srg-1',
      procedureName: 'Laparoscopic Appendectomy',
      date: '2024-06-12',
      hospital: 'Memorial Health University Medical Center',
      surgeon: 'Dr. Arthur Vance, FACS',
      anesthesiaType: 'General Endotracheal Anesthesia',
      indicationReason: 'Acute uncomplicated appendicitis (WBC 14.8, CT verified)',
      outcome: 'Successful without intraoperative or postoperative complications. Discharged POD 1.',
      notes: '3-port laparoscopic approach. Pathology confirmed acute focal appendicitis, negative for malignancy.',
      isVerified: true,
    },
    {
      id: 'srg-2',
      procedureName: 'Right Knee Arthroscopic Partial Meniscectomy',
      date: '2018-10-24',
      hospital: 'Metro Orthopedic Surgical Pavilion',
      surgeon: 'Dr. Samantha Adams, MD',
      anesthesiaType: 'Monitored Anesthesia Care (MAC) + Local',
      indicationReason: 'Complex tear of posterior horn of medial meniscus',
      outcome: 'Successful debridement. Completed 6 weeks physical therapy with full range of motion recovery.',
      implantedHardware: 'None (No metallic implants)',
      notes: 'No residual joint instability.',
      isVerified: true,
    },
  ],

  scans: [
    {
      id: 'scn-1',
      scanType: 'MRI',
      bodyPart: 'Brain (Head with & without contrast)',
      date: '2026-08-12',
      facility: 'Memorial Imaging Center - 3T Skyra MRI',
      orderingDoctor: 'Dr. Emily Chen, MD',
      radiologist: 'Dr. Neil Henderson, MD (Neuroradiology)',
      clinicalReason: 'Evaluation of episodic tension-type headaches and rule out intracranial pathology.',
      findings: 'Ventricular system and basal cisterns are normal in size and configuration. No acute intracranial hemorrhage, mass effect, or midline shift. Normal gray-white matter differentiation. No abnormal parenchymal or meningeal enhancement post-gadolinium.',
      impression: '1. Unremarkable MRI of the brain.\n2. No acute intracranial abnormality or mass lesion.',
      images: [
        { id: 'img-1', label: 'Axial T2 FLAIR - Mid-ventricular level', sliceNumber: 1, totalSlices: 4, url: createBrainMriSvg('Mid-ventricular level', 1), resolution: '2048x2048' },
        { id: 'img-2', label: 'Axial T2 FLAIR - Centrum semiovale', sliceNumber: 2, totalSlices: 4, url: createBrainMriSvg('Centrum Semiovale', 2), resolution: '2048x2048' },
        { id: 'img-3', label: 'Axial T1 Post-Contrast - Posterior fossa', sliceNumber: 3, totalSlices: 4, url: createBrainMriSvg('Posterior Fossa', 3), resolution: '2048x2048' },
        { id: 'img-4', label: 'Axial Diffusion (DWI/ADC) - Vertex', sliceNumber: 4, totalSlices: 4, url: createBrainMriSvg('Vertex / Cortex', 4), resolution: '2048x2048' },
      ],
      notes: 'Patient tolerated the exam well without claustrophobia.',
      isEmergencyRelevant: true,
      isVerified: true,
    },
    {
      id: 'scn-2',
      scanType: 'CT Scan',
      bodyPart: 'Chest (CTA Pulmonary Angiogram)',
      date: '2025-11-04',
      facility: 'Memorial Emergency Radiology',
      orderingDoctor: 'Dr. James Park, MD (Emergency Medicine)',
      radiologist: 'Dr. Neil Henderson, MD',
      clinicalReason: 'Pleuritic chest discomfort following viral illness; evaluate for pulmonary embolism.',
      findings: 'Pulmonary arterial tree is well opacified to the subsegmental level without filling defects. Lungs are clear without focal consolidation, pneumothorax, or pleural effusion. Heart size is normal. Thoracic aorta is normal in caliber.',
      impression: '1. Negative for pulmonary embolism.\n2. No acute cardiopulmonary pathology.',
      images: [
        { id: 'img-ct-1', label: 'Axial CTA Pulmonary Trunk level', sliceNumber: 1, totalSlices: 1, url: createChestCtSvg(), resolution: '1024x1024' },
      ],
      notes: 'IV contrast bolus timing optimal.',
      isEmergencyRelevant: true,
      isVerified: true,
    },
    {
      id: 'scn-3',
      scanType: 'X-Ray',
      bodyPart: 'Chest (PA & Lateral Views)',
      date: '2026-05-18',
      facility: 'Memorial Health University Imaging',
      orderingDoctor: 'Dr. Emily Chen, MD',
      radiologist: 'Dr. Neil Henderson, MD',
      clinicalReason: 'Annual preventative wellness and respiratory screening.',
      findings: 'Lungs are well expanded and clear. Cardiothoracic ratio is normal (0.46). Costophrenic sulci and cardiac borders are sharp. Bony thorax is intact.',
      impression: 'Normal 2-view chest radiograph.',
      images: [
        { id: 'img-cxr-1', label: 'PA Erect Chest Radiograph', sliceNumber: 1, totalSlices: 1, url: createChestXRaySvg(), resolution: '2500x2048' },
      ],
      notes: 'Comparison with 2024 film shows stable baseline.',
      isEmergencyRelevant: false,
      isVerified: true,
    },
    {
      id: 'scn-4',
      scanType: 'ECG / EKG',
      bodyPart: '12-Lead Electrocardiogram',
      date: '2026-06-20',
      facility: 'Heart & Vascular Clinic',
      orderingDoctor: 'Dr. Marcus Brody, MD',
      radiologist: 'Dr. Marcus Brody, MD (Cardiologist)',
      clinicalReason: 'Routine annual cardiovascular rhythm surveillance.',
      findings: 'Ventricular Rate: 74 bpm, PR interval: 162 ms, QRS duration: 88 ms, QTc: 418 ms, P-R-T axes: 48 54 42. Normal sinus rhythm with normal axis.',
      impression: 'Normal 12-lead ECG. No ischemic ST-T wave abnormalities or dysrhythmias.',
      images: [
        { id: 'img-ecg-1', label: 'Lead II & Standard 12-Lead Strip', sliceNumber: 1, totalSlices: 1, url: createEcgSvg(), resolution: '1400x700' },
      ],
      notes: 'No previous baseline changes noted.',
      isEmergencyRelevant: true,
      isVerified: true,
    },
  ],

  labReports: [
    {
      id: 'lab-1',
      testName: 'Hemoglobin A1c (HbA1c)',
      category: 'Metabolic & Diabetes',
      date: '2026-08-02',
      resultValue: '7.2',
      unit: '%',
      referenceRange: '4.0 - 5.6 % (Non-diabetic), < 7.0 % (Target)',
      status: 'High',
      orderingDoctor: 'Dr. Emily Chen, MD',
      laboratory: 'Quest Diagnostics Regional Reference Lab',
      notes: 'Improved from 7.8% on previous 6-month check. Continue current Metformin regimen.',
      isVerified: true,
    },
    {
      id: 'lab-2',
      testName: 'Estimated Glomerular Filtration Rate (eGFR)',
      category: 'Renal / Kidney',
      date: '2026-08-02',
      resultValue: '82',
      unit: 'mL/min/1.73m²',
      referenceRange: '> 60 mL/min/1.73m²',
      status: 'Normal',
      orderingDoctor: 'Dr. Emily Chen, MD',
      laboratory: 'Quest Diagnostics',
      notes: 'Kidney function normal; safe for Metformin and Lisinopril continuation.',
      isVerified: true,
    },
    {
      id: 'lab-3',
      testName: 'Serum Creatinine',
      category: 'Renal / Kidney',
      date: '2026-08-02',
      resultValue: '1.0',
      unit: 'mg/dL',
      referenceRange: '0.7 - 1.3 mg/dL',
      status: 'Normal',
      orderingDoctor: 'Dr. Emily Chen, MD',
      laboratory: 'Quest Diagnostics',
      notes: 'Stable baseline.',
      isVerified: true,
    },
    {
      id: 'lab-4',
      testName: 'Lipid Panel - LDL Cholesterol',
      category: 'Lipid Panel',
      date: '2026-08-02',
      resultValue: '88',
      unit: 'mg/dL',
      referenceRange: '< 100 mg/dL (Optimal for ASCVD)',
      status: 'Normal',
      orderingDoctor: 'Dr. Marcus Brody, MD',
      laboratory: 'Quest Diagnostics',
      notes: 'Atorvastatin 40mg therapy effective.',
      isVerified: true,
    },
    {
      id: 'lab-5',
      testName: 'Complete Blood Count - Hemoglobin',
      category: 'Hematology',
      date: '2026-08-02',
      resultValue: '14.6',
      unit: 'g/dL',
      referenceRange: '13.8 - 17.2 g/dL',
      status: 'Normal',
      orderingDoctor: 'Dr. Emily Chen, MD',
      laboratory: 'Quest Diagnostics',
      notes: 'No anemia.',
      isVerified: true,
    },
    {
      id: 'lab-6',
      testName: 'Platelet Count',
      category: 'Hematology',
      date: '2026-08-02',
      resultValue: '248',
      unit: 'x10³/µL',
      referenceRange: '150 - 450 x10³/µL',
      status: 'Normal',
      orderingDoctor: 'Dr. Emily Chen, MD',
      laboratory: 'Quest Diagnostics',
      notes: 'Normal clotting baseline.',
      isVerified: true,
    },
    {
      id: 'lab-7',
      testName: 'Thyroid Stimulating Hormone (TSH)',
      category: 'Thyroid',
      date: '2026-08-02',
      resultValue: '2.14',
      unit: 'mIU/L',
      referenceRange: '0.40 - 4.50 mIU/L',
      status: 'Normal',
      orderingDoctor: 'Dr. Emily Chen, MD',
      laboratory: 'Quest Diagnostics',
      notes: 'Euthyroid.',
      isVerified: true,
    },
  ],

  vaccinations: [
    {
      id: 'vac-1',
      vaccineName: 'Influenza (Quadrivalent High-Dose Senior)',
      doseNumber: 'Annual 2025/2026',
      dateAdministered: '2025-10-14',
      nextDoseDate: '2026-10-15',
      administeringClinic: 'Walgreens Pharmacy #4920',
      lotNumber: 'FL-9942-A',
      status: 'Completed',
      notes: 'No adverse reaction.',
      isVerified: true,
    },
    {
      id: 'vac-2',
      vaccineName: 'Pneumococcal Conjugate (PCV20 - Prevnar 20)',
      doseNumber: 'Single Dose',
      dateAdministered: '2023-05-10',
      administeringClinic: 'Memorial Health Clinic',
      status: 'Completed',
      notes: 'Lifetime pneumococcal coverage established.',
      isVerified: true,
    },
    {
      id: 'vac-3',
      vaccineName: 'Recombinant Zoster (Shingrix - Shingles)',
      doseNumber: 'Dose 2 of 2',
      dateAdministered: '2022-08-18',
      administeringClinic: 'Memorial Health Clinic',
      status: 'Completed',
      notes: '2-dose series completed.',
      isVerified: true,
    },
    {
      id: 'vac-4',
      vaccineName: 'Tetanus, Diphtheria, Pertussis (Tdap)',
      doseNumber: 'Booster',
      dateAdministered: '2019-06-20',
      nextDoseDate: '2029-06-20',
      administeringClinic: 'Memorial Urgent Care',
      status: 'Completed',
      notes: 'Next booster due in 2029.',
      isVerified: true,
    },
  ],

  familyHistory: [
    {
      id: 'fam-1',
      relation: 'Father',
      side: 'Paternal',
      condition: 'Coronary Artery Disease & Myocardial Infarction',
      ageAtDiagnosis: 58,
      notes: 'Underwent CABG surgery at age 62. Deceased age 79.',
      isCriticalRisk: true,
    },
    {
      id: 'fam-2',
      relation: 'Mother',
      side: 'Maternal',
      condition: 'Type 2 Diabetes Mellitus',
      ageAtDiagnosis: 52,
      notes: 'Managed with insulin and oral agents. Deceased age 84.',
      isCriticalRisk: true,
    },
    {
      id: 'fam-3',
      relation: 'Brother (Older)',
      side: 'Immediate',
      condition: 'Essential Hypertension',
      ageAtDiagnosis: 54,
      notes: 'Active, well controlled on Amlodipine.',
      isCriticalRisk: false,
    },
  ],

  documents: [
    {
      id: 'doc-1',
      title: 'Hospital Discharge Summary — Laparoscopic Appendectomy',
      category: 'Discharge Summary',
      date: '2024-06-13',
      doctor: 'Dr. Arthur Vance, FACS',
      hospital: 'Memorial Health University Medical Center',
      fileType: 'PDF',
      fileSize: '1.4 MB',
      description: 'Complete operative report, pathology clearance, and discharge instructions.',
      isVerified: true,
    },
    {
      id: 'doc-2',
      title: 'Brain MRI Diagnostic Imaging Official Report',
      category: 'Scan & Imaging',
      date: '2026-08-12',
      doctor: 'Dr. Neil Henderson, MD',
      hospital: 'Memorial Radiology Center',
      fileType: 'PDF',
      fileSize: '2.8 MB',
      description: 'Formal radiologist impression and slice localization documentation.',
      isVerified: true,
    },
    {
      id: 'doc-3',
      title: 'Comprehensive Metabolic & Lipid Panel Laboratory Report',
      category: 'Lab Report',
      date: '2026-08-02',
      doctor: 'Dr. Emily Chen, MD',
      hospital: 'Quest Diagnostics',
      fileType: 'PDF',
      fileSize: '840 KB',
      description: 'HbA1c, eGFR, Creatinine, Lipid breakdown, Liver enzymes.',
      isVerified: true,
    },
    {
      id: 'doc-4',
      title: 'Current Active Prescription Electronic Order Sheet',
      category: 'Prescription',
      date: '2026-07-15',
      doctor: 'Dr. Emily Chen, MD',
      hospital: 'Memorial Health Outpatient Pharmacy',
      fileType: 'PDF',
      fileSize: '420 KB',
      description: 'Authorized 90-day refills for Metformin, Lisinopril, and Atorvastatin.',
      isVerified: true,
    },
    {
      id: 'doc-5',
      title: 'Health Insurance Proof of Coverage Card & Policy Summary',
      category: 'Insurance & Billing',
      date: '2026-01-01',
      doctor: 'Blue Cross Blue Shield Medicare',
      hospital: 'BCBS National Network',
      fileType: 'PDF',
      fileSize: '1.1 MB',
      description: 'Primary medical, prescription drug, and emergency trauma coverage details.',
      isVerified: true,
    },
    {
      id: 'doc-6',
      title: 'Cardiology Annual Consultation Clinical Progress Note',
      category: 'Consultation Notes',
      date: '2026-06-20',
      doctor: 'Dr. Marcus Brody, MD',
      hospital: 'Heart & Vascular Institute',
      fileType: 'PDF',
      fileSize: '950 KB',
      description: '12-lead ECG analysis, ASCVD risk recalculation, and exercise clearance.',
      isVerified: true,
    },
  ],

  timeline: [
    {
      id: 'tml-1',
      date: 'Aug 12, 2026',
      year: '2026',
      title: 'Brain MRI Exam Completed',
      type: 'scan',
      categoryLabel: 'Diagnostic Imaging',
      doctor: 'Dr. Neil Henderson, MD',
      facility: 'Memorial Imaging Center',
      summary: '3T MRI Brain with contrast revealed no acute intracranial abnormality, stroke, or mass.',
      criticalFlag: false,
    },
    {
      id: 'tml-2',
      date: 'Aug 02, 2026',
      year: '2026',
      title: 'Comprehensive Lab Panel (HbA1c 7.2%)',
      type: 'lab',
      categoryLabel: 'Laboratory Work',
      doctor: 'Dr. Emily Chen, MD',
      facility: 'Quest Diagnostics',
      summary: 'HbA1c checked at 7.2%, eGFR normal at 82 mL/min, LDL controlled at 88 mg/dL.',
      criticalFlag: false,
    },
    {
      id: 'tml-3',
      date: 'Jun 20, 2026',
      year: '2026',
      title: 'Cardiology Consultation & ECG',
      type: 'doctor_visit',
      categoryLabel: 'Cardiology',
      doctor: 'Dr. Marcus Brody, MD',
      facility: 'Heart & Vascular Institute',
      summary: 'Normal sinus rhythm confirmed on 12-lead ECG; continue preventative Aspirin 81mg and Atorvastatin.',
      criticalFlag: false,
    },
    {
      id: 'tml-4',
      date: 'Nov 04, 2025',
      year: '2025',
      title: 'Chest CTA Scanned in Emergency Dept',
      type: 'emergency',
      categoryLabel: 'Emergency Care',
      doctor: 'Dr. James Park, MD',
      facility: 'Memorial Emergency Radiology',
      summary: 'Emergency evaluation for chest discomfort; CT angiogram ruled out pulmonary embolism and acute coronary event.',
      criticalFlag: true,
    },
    {
      id: 'tml-5',
      date: 'Jun 12, 2024',
      year: '2024',
      title: 'Laparoscopic Appendectomy Surgery',
      type: 'surgery',
      categoryLabel: 'Inpatient Surgery',
      doctor: 'Dr. Arthur Vance, FACS',
      facility: 'Memorial Health University Medical Center',
      summary: 'Urgent laparoscopic removal of inflamed appendix. Uneventful post-op course.',
      criticalFlag: true,
    },
    {
      id: 'tml-6',
      date: 'Mar 10, 2023',
      year: '2023',
      title: 'Diagnosed with Type 2 Diabetes Mellitus',
      type: 'diagnosis',
      categoryLabel: 'Endocrinology',
      doctor: 'Dr. Emily Chen, MD',
      facility: 'Memorial Health Clinic',
      summary: 'Fasting glucose 142 mg/dL, HbA1c 7.9%; initiated on Metformin 500mg BID and diabetic lifestyle coaching.',
      criticalFlag: true,
    },
    {
      id: 'tml-7',
      date: 'Sep 02, 2022',
      year: '2022',
      title: 'Diagnosed with Essential Hypertension',
      type: 'diagnosis',
      categoryLabel: 'Cardiovascular',
      doctor: 'Dr. Emily Chen, MD',
      facility: 'Memorial Health Clinic',
      summary: 'Prescribed Lisinopril 10mg daily with goal BP < 130/80 mmHg.',
      criticalFlag: false,
    },
    {
      id: 'tml-8',
      date: 'Oct 24, 2018',
      year: '2018',
      title: 'Right Knee Meniscal Arthroscopy',
      type: 'surgery',
      categoryLabel: 'Orthopedic Surgery',
      doctor: 'Dr. Samantha Adams, MD',
      facility: 'Metro Orthopedic Pavilion',
      summary: 'Outpatient arthroscopic repair of torn medial meniscus.',
      criticalFlag: false,
    },
  ],

  accessLogs: [
    {
      id: 'log-1',
      timestamp: '2026-08-14 09:30:14',
      accessorName: 'Dr. Emily Chen, MD',
      accessorRole: 'Primary Care Doctor',
      facility: 'Memorial Health Clinic',
      action: 'Updated medication dosage and verified recent Brain MRI diagnostic report.',
      consentType: 'Standard Caregiver Access',
    },
    {
      id: 'log-2',
      timestamp: '2026-08-12 14:15:22',
      accessorName: 'Dr. Neil Henderson, MD',
      accessorRole: 'Emergency Physician',
      facility: 'Memorial Radiology Center',
      action: 'Uploaded 4-slice Brain MRI series and signed formal radiology impression.',
      consentType: 'Standard Caregiver Access',
    },
    {
      id: 'log-3',
      timestamp: '2026-08-02 11:20:05',
      accessorName: 'Quest Diagnostics Automation',
      accessorRole: 'Hospital Admin',
      facility: 'Quest Laboratory HL7 Vault',
      action: 'Direct HL7 laboratory feed ingestion: 7 biochemical biomarkers.',
      consentType: 'Standard Caregiver Access',
    },
    {
      id: 'log-4',
      timestamp: '2025-11-04 22:45:10',
      accessorName: 'Dr. James Park, MD',
      accessorRole: 'Emergency Physician',
      facility: 'Memorial Emergency Department Trauma Bay 2',
      action: 'EMERGENCY OVERRIDE ACCESS: Instant pull of critical allergies, active cardiac medications, and previous surgeries.',
      consentType: 'Emergency Override',
    },
  ],
};
