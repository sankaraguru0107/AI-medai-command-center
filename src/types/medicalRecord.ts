export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type AllergySeverity = 'Critical' | 'Severe' | 'Moderate' | 'Mild';
export type AllergyType = 'Drug / Medication' | 'Food' | 'Environmental' | 'Biological / Venom' | 'Other';

export interface AllergyItem {
  id: string;
  name: string;
  type: AllergyType;
  severity: AllergySeverity;
  reaction: string;
  dateIdentified: string;
  notes: string;
  isVerified: boolean;
  verifiedBy?: string;
}

export type MedicationStatus = 'Active' | 'Completed' | 'Stopped' | 'On Hold';
export type MedicationRoute = 'Oral' | 'Subcutaneous Injection' | 'Intravenous (IV)' | 'Inhalation' | 'Topical' | 'Sublingual';

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route: MedicationRoute;
  timing: string;
  reason: string;
  startDate: string;
  endDate?: string;
  prescribingDoctor: string;
  hospital: string;
  status: MedicationStatus;
  specialInstructions: string;
  isEmergencyCritical: boolean;
  isVerified: boolean;
  verifiedBy?: string;
}

export type ConditionSeverity = 'Severe' | 'Moderate' | 'Mild' | 'Chronic';
export type ConditionStatus = 'Active' | 'Controlled' | 'In Remission' | 'Resolved';

export interface MedicalConditionItem {
  id: string;
  name: string;
  icd10Code?: string;
  diagnosisDate: string;
  severity: ConditionSeverity;
  status: ConditionStatus;
  treatingDoctor: string;
  hospital: string;
  currentTreatment: string;
  notes: string;
  isVerified: boolean;
  verifiedBy?: string;
}

export interface SurgeryProcedureItem {
  id: string;
  procedureName: string;
  date: string;
  hospital: string;
  surgeon: string;
  anesthesiaType: string;
  indicationReason: string;
  outcome: string;
  implantedHardware?: string;
  notes: string;
  relatedReportUrl?: string;
  isVerified: boolean;
}

export type ScanModality = 'MRI' | 'CT Scan' | 'X-Ray' | 'Ultrasound' | 'ECG / EKG' | 'Echocardiogram' | 'Mammogram' | 'PET Scan' | 'Dental X-Ray';

export interface ImagingScanItem {
  id: string;
  scanType: ScanModality;
  bodyPart: string;
  date: string;
  facility: string;
  orderingDoctor: string;
  radiologist: string;
  clinicalReason: string;
  findings: string;
  impression: string;
  images: Array<{
    id: string;
    label: string;
    sliceNumber: number;
    totalSlices: number;
    url: string; // Data URL or SVG string
    resolution?: string;
  }>;
  relatedReportPdf?: string;
  notes: string;
  isEmergencyRelevant: boolean;
  isVerified: boolean;
}

export type LabStatus = 'Normal' | 'High' | 'Low' | 'Critical';
export type LabCategory = 'Hematology' | 'Metabolic & Diabetes' | 'Lipid Panel' | 'Renal / Kidney' | 'Hepatic / Liver' | 'Thyroid' | 'Urinalysis' | 'Cardiovascular';

export interface LabReportItem {
  id: string;
  testName: string;
  category: LabCategory;
  date: string;
  resultValue: string | number;
  unit: string;
  referenceRange: string;
  status: LabStatus;
  orderingDoctor: string;
  laboratory: string;
  notes: string;
  reportFileUrl?: string;
  isVerified: boolean;
}

export type VaccinationStatus = 'Completed' | 'Due' | 'Overdue';

export interface VaccinationItem {
  id: string;
  vaccineName: string;
  doseNumber: string;
  dateAdministered: string;
  nextDoseDate?: string;
  administeringClinic: string;
  lotNumber?: string;
  status: VaccinationStatus;
  notes?: string;
  isVerified: boolean;
}

export interface FamilyHistoryItem {
  id: string;
  relation: string;
  side: 'Paternal' | 'Maternal' | 'Immediate';
  condition: string;
  ageAtDiagnosis?: number;
  notes: string;
  isCriticalRisk: boolean;
}

export interface EmergencyContactItem {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  altPhone?: string;
  email?: string;
  isPrimary: boolean;
}

export type DocumentCategory = 'Prescription' | 'Discharge Summary' | 'Medical Certificate' | 'Lab Report' | 'Scan & Imaging' | 'Insurance & Billing' | 'Surgery Report' | 'Consultation Notes';

export interface MedicalDocumentItem {
  id: string;
  title: string;
  category: DocumentCategory;
  date: string;
  doctor: string;
  hospital: string;
  fileType: 'PDF' | 'JPG' | 'PNG' | 'DICOM';
  fileSize: string;
  description: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
  isVerified: boolean;
}

export type TimelineEventType = 'diagnosis' | 'surgery' | 'scan' | 'lab' | 'hospitalization' | 'medication_change' | 'allergy' | 'doctor_visit' | 'emergency';

export interface MedicalTimelineEvent {
  id: string;
  date: string;
  year: string;
  title: string;
  type: TimelineEventType;
  categoryLabel: string;
  doctor?: string;
  facility: string;
  summary: string;
  criticalFlag?: boolean;
  relatedEntityId?: string;
}

export interface AccessLogItem {
  id: string;
  timestamp: string;
  accessorName: string;
  accessorRole: 'Emergency Physician' | 'Primary Care Doctor' | 'Cardiologist' | 'Nurse' | 'Patient' | 'Hospital Admin';
  facility: string;
  action: string;
  consentType: 'Emergency Override' | 'Patient Explicit Consent' | 'Standard Caregiver Access';
}

export interface PatientMedicalProfile {
  // Demographics
  id: string;
  mrn: string;
  fullName: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: BloodGroup;
  heightCm: number;
  weightKg: number;
  bmi: number;
  avatarUrl?: string;

  // Contacts & Care Team
  primaryEmergencyContact: EmergencyContactItem;
  secondaryEmergencyContact?: EmergencyContactItem;
  primaryDoctor: {
    name: string;
    specialty: string;
    hospital: string;
    phone: string;
    email: string;
  };
  primaryHospital: {
    name: string;
    address: string;
    emergencyLine: string;
  };

  // Administrative & Emergency Status
  insuranceProvider: string;
  insurancePolicyNumber: string;
  organDonorStatus: boolean;
  advancedDirective: boolean;
  implantedDevices: string[];
  emergencyNotes: string;
  lastUpdated: string;
  lastUpdatedBy: string;

  // Clinical Collections
  allergies: AllergyItem[];
  medications: MedicationItem[];
  conditions: MedicalConditionItem[];
  surgeries: SurgeryProcedureItem[];
  scans: ImagingScanItem[];
  labReports: LabReportItem[];
  vaccinations: VaccinationItem[];
  familyHistory: FamilyHistoryItem[];
  documents: MedicalDocumentItem[];
  timeline: MedicalTimelineEvent[];
  accessLogs: AccessLogItem[];
}
