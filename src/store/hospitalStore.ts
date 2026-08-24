import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  HospitalDoctor, HospitalNurse, HospitalPatient, HospitalDepartment,
  HospitalBed, StaffShift, AttendanceRecord, NurseTask, NurseMedSchedule,
  HospitalActivityLog, DoctorStatus, NurseStatus, BedStatus, PatientCondition
} from '../types/hospital';

interface HospitalState {
  // Collections
  doctors: HospitalDoctor[];
  nurses: HospitalNurse[];
  patients: HospitalPatient[];
  departments: HospitalDepartment[];
  beds: HospitalBed[];
  shifts: StaffShift[];
  attendanceRecords: AttendanceRecord[];
  nurseTasks: NurseTask[];
  medSchedules: NurseMedSchedule[];
  activityLogs: HospitalActivityLog[];

  // Active Nurse context (for current nurse user session)
  activeNurseId: string;
  setActiveNurseId: (id: string) => void;

  // Selected entities for modals / inspection
  selectedDoctor: HospitalDoctor | null;
  setSelectedDoctor: (doctor: HospitalDoctor | null) => void;
  selectedNurse: HospitalNurse | null;
  setSelectedNurse: (nurse: HospitalNurse | null) => void;
  selectedPatient: HospitalPatient | null;
  setSelectedPatient: (patient: HospitalPatient | null) => void;

  // Reactive Workflow Actions
  startNurseShift: (nurseId: string, customLoginTime?: string) => void;
  endNurseShift: (nurseId: string, customLogoutTime?: string) => void;
  setNurseStatus: (nurseId: string, status: NurseStatus) => void;
  setDoctorStatus: (doctorId: string, status: DoctorStatus) => void;
  completeNurseTask: (taskId: string, nurseName?: string) => void;
  administerMedication: (medId: string, nurseName?: string) => void;
  updatePatientVitals: (patientId: string, newVitals: { hr: number; spo2: number; bp: string; temp: number }) => void;
  resolvePatientAlert: (patientId: string) => void;
  updateBedStatus: (bedId: string, newStatus: BedStatus, patientName?: string, patientId?: string) => void;
  assignStaffShift: (shift: Omit<StaffShift, 'id'>) => void;
  addActivityLog: (log: Omit<HospitalActivityLog, 'id'>) => void;
}

// Initial Realistic Clinical Dataset
const initialDoctors: HospitalDoctor[] = [
  {
    id: 'doc-1',
    doctorId: 'DOC-1042',
    name: 'Dr. Emily Chen, MD',
    avatarUrl: '',
    gender: 'Female',
    specialization: 'Internal Medicine & Critical Care',
    department: 'Critical Care (ICU)',
    sector: 'ICU-A',
    floor: 3,
    ward: 'ICU',
    phone: '+1 (555) 902-1100',
    email: 'e.chen@memorialhealth.org',
    experienceYears: 14,
    qualification: 'MD, FACP (Johns Hopkins School of Medicine)',
    currentShift: 'Morning',
    shiftHours: '06:00 AM – 02:00 PM',
    status: 'Available',
    loginStatus: 'Online',
    patientsAssignedCount: 6,
    joiningDate: '2016-04-10',
    assignedPatients: [
      { id: 'p001', name: 'James Wilson', bed: 'ICU-04', condition: 'Stable' },
      { id: 'p002', name: 'Sarah Chen', bed: 'ICU-05', condition: 'Observation' },
      { id: 'p003', name: 'Robert Kim', bed: 'ICU-03', condition: 'Critical' },
    ],
    assignedBeds: ['ICU-01', 'ICU-02', 'ICU-03', 'ICU-04', 'ICU-05', 'ICU-06'],
    todayAppointments: [
      { id: 'app-1', time: '09:00 AM', patientName: 'James Wilson', patientId: 'p001', type: 'ICU Bedside Grand Rounds', status: 'Completed' },
      { id: 'app-2', time: '11:30 AM', patientName: 'Sarah Chen', patientId: 'p002', type: 'Endocrine Glycemic Review', status: 'In Progress' },
      { id: 'app-3', time: '01:30 PM', patientName: 'Robert Kim', patientId: 'p003', type: 'Pulmonary Weaning Protocol', status: 'Scheduled' },
    ],
    attendanceHistory: [
      { id: 'att-d1', staffId: 'doc-1', staffName: 'Dr. Emily Chen', role: 'doctor', department: 'Critical Care (ICU)', sector: 'ICU-A', date: '2026-08-19', shift: 'Morning', scheduledStart: '06:00 AM', scheduledEnd: '02:00 PM', actualLogin: '05:52 AM', actualLogout: undefined, isLate: false, status: 'Present' },
      { id: 'att-d2', staffId: 'doc-1', staffName: 'Dr. Emily Chen', role: 'doctor', department: 'Critical Care (ICU)', sector: 'ICU-A', date: '2026-08-18', shift: 'Morning', scheduledStart: '06:00 AM', scheduledEnd: '02:00 PM', actualLogin: '05:50 AM', actualLogout: '02:15 PM', totalHours: '8h 25m', isLate: false, status: 'Present' },
      { id: 'att-d3', staffId: 'doc-1', staffName: 'Dr. Emily Chen', role: 'doctor', department: 'Critical Care (ICU)', sector: 'ICU-A', date: '2026-08-17', shift: 'Morning', scheduledStart: '06:00 AM', scheduledEnd: '02:00 PM', actualLogin: '05:58 AM', actualLogout: '02:00 PM', totalHours: '8h 02m', isLate: false, status: 'Present' },
    ],
  },
  {
    id: 'doc-2',
    doctorId: 'DOC-1043',
    name: 'Dr. Marcus Brody, MD',
    avatarUrl: '',
    gender: 'Male',
    specialization: 'Cardiology & Electrophysiology',
    department: 'Cardiology (CCU)',
    sector: 'CCU-1',
    floor: 2,
    ward: 'Cardiac Care',
    phone: '+1 (555) 902-1102',
    email: 'm.brody@memorialhealth.org',
    experienceYears: 18,
    qualification: 'MD, FACC (Harvard Medical School)',
    currentShift: 'Morning',
    shiftHours: '08:00 AM – 04:00 PM',
    status: 'In Consultation',
    loginStatus: 'In Consultation',
    patientsAssignedCount: 8,
    joiningDate: '2012-09-15',
    assignedPatients: [
      { id: 'p004', name: 'Maria Rivera', bed: 'CCU-02', condition: 'Observation' },
      { id: 'p005', name: 'David Miller', bed: 'CCU-04', condition: 'Stable' },
    ],
    assignedBeds: ['CCU-01', 'CCU-02', 'CCU-03', 'CCU-04'],
    todayAppointments: [
      { id: 'app-4', time: '10:00 AM', patientName: 'Maria Rivera', patientId: 'p004', type: 'Echocardiogram Review', status: 'Completed' },
      { id: 'app-5', time: '02:00 PM', patientName: 'David Miller', patientId: 'p005', type: 'Angiography Pre-Op Check', status: 'Scheduled' },
    ],
    attendanceHistory: [
      { id: 'att-d4', staffId: 'doc-2', staffName: 'Dr. Marcus Brody', role: 'doctor', department: 'Cardiology (CCU)', sector: 'CCU-1', date: '2026-08-19', shift: 'Morning', scheduledStart: '08:00 AM', scheduledEnd: '04:00 PM', actualLogin: '07:55 AM', isLate: false, status: 'Present' },
    ],
  },
  {
    id: 'doc-3',
    doctorId: 'DOC-1044',
    name: 'Dr. James Park, MD',
    avatarUrl: '',
    gender: 'Male',
    specialization: 'Emergency Medicine & Trauma',
    department: 'Emergency (ED)',
    sector: 'ED-Trauma',
    floor: 1,
    ward: 'Emergency Triage',
    phone: '+1 (555) 902-1105',
    email: 'j.park@memorialhealth.org',
    experienceYears: 11,
    qualification: 'MD, FACEP (Stanford University)',
    currentShift: 'Morning',
    shiftHours: '06:00 AM – 02:00 PM',
    status: 'Available',
    loginStatus: 'Online',
    patientsAssignedCount: 12,
    joiningDate: '2019-01-20',
    assignedPatients: [
      { id: 'p007', name: 'Helen Carter', bed: 'ED-02', condition: 'Critical' },
      { id: 'p008', name: 'Tom Nguyen', bed: 'ED-04', condition: 'Observation' },
    ],
    assignedBeds: ['ED-01', 'ED-02', 'ED-03', 'ED-04', 'ED-05'],
    todayAppointments: [],
    attendanceHistory: [
      { id: 'att-d5', staffId: 'doc-3', staffName: 'Dr. James Park', role: 'doctor', department: 'Emergency (ED)', sector: 'ED-Trauma', date: '2026-08-19', shift: 'Morning', scheduledStart: '06:00 AM', scheduledEnd: '02:00 PM', actualLogin: '05:58 AM', isLate: false, status: 'Present' },
    ],
  },
  {
    id: 'doc-4',
    doctorId: 'DOC-1045',
    name: 'Dr. Arthur Vance, FACS',
    avatarUrl: '',
    gender: 'Male',
    specialization: 'General & Minimally Invasive Surgery',
    department: 'Surgery / Operating Theatre',
    sector: 'OR-Suite 3',
    floor: 4,
    ward: 'Surgical Wing',
    phone: '+1 (555) 902-1108',
    email: 'a.vance@memorialhealth.org',
    experienceYears: 22,
    qualification: 'MD, FACS (Columbia College of Physicians)',
    currentShift: 'Morning',
    shiftHours: '07:00 AM – 03:00 PM',
    status: 'In Consultation',
    loginStatus: 'In Consultation',
    patientsAssignedCount: 4,
    joiningDate: '2008-07-01',
    assignedPatients: [
      { id: 'p006', name: 'Linda Thompson', bed: 'SURG-02', condition: 'Stable' },
    ],
    assignedBeds: ['SURG-01', 'SURG-02', 'SURG-03'],
    todayAppointments: [],
    attendanceHistory: [
      { id: 'att-d6', staffId: 'doc-4', staffName: 'Dr. Arthur Vance', role: 'doctor', department: 'Surgery', sector: 'OR-3', date: '2026-08-19', shift: 'Morning', scheduledStart: '07:00 AM', scheduledEnd: '03:00 PM', actualLogin: '06:50 AM', isLate: false, status: 'Present' },
    ],
  },
  {
    id: 'doc-5',
    doctorId: 'DOC-1046',
    name: 'Dr. Samantha Adams, MD',
    avatarUrl: '',
    gender: 'Female',
    specialization: 'Orthopedics & Joint Reconstruction',
    department: 'Orthopedics',
    sector: 'ORTHO-East',
    floor: 3,
    ward: 'Orthopedic Ward',
    phone: '+1 (555) 902-1110',
    email: 's.adams@memorialhealth.org',
    experienceYears: 15,
    qualification: 'MD, FAAOS (Mayo Clinic Alix School of Medicine)',
    currentShift: 'Evening',
    shiftHours: '02:00 PM – 10:00 PM',
    status: 'Off Duty',
    loginStatus: 'Offline',
    patientsAssignedCount: 5,
    joiningDate: '2015-11-12',
    assignedPatients: [],
    assignedBeds: ['ORTHO-01', 'ORTHO-02'],
    todayAppointments: [],
    attendanceHistory: [],
  },
  {
    id: 'doc-6',
    doctorId: 'DOC-1047',
    name: 'Dr. Neil Henderson, MD',
    avatarUrl: '',
    gender: 'Male',
    specialization: 'Neuroradiology & Diagnostic Imaging',
    department: 'Radiology / PACS',
    sector: 'RAD-3T',
    floor: 1,
    ward: 'Diagnostic Pavilion',
    phone: '+1 (555) 902-1114',
    email: 'n.henderson@memorialhealth.org',
    experienceYears: 16,
    qualification: 'MD, DABR (UCSF Medical Center)',
    currentShift: 'Morning',
    shiftHours: '08:00 AM – 04:00 PM',
    status: 'Available',
    loginStatus: 'Online',
    patientsAssignedCount: 0,
    joiningDate: '2014-03-08',
    assignedPatients: [],
    assignedBeds: [],
    todayAppointments: [],
    attendanceHistory: [],
  },
];

const initialNurses: HospitalNurse[] = [
  {
    id: 'nur-1',
    nurseId: 'NUR-2084',
    name: 'Nurse Sarah Jenkins, BSN, RN',
    avatarUrl: '',
    gender: 'Female',
    phone: '+1 (555) 234-9911',
    email: 's.jenkins@memorialhealth.org',
    qualification: 'BSN, RN, CCRN (Critical Care Certified)',
    experienceYears: 8,
    department: 'Critical Care (ICU)',
    sector: 'ICU-A',
    floor: 3,
    ward: 'ICU',
    assignedBeds: ['ICU-01', 'ICU-02', 'ICU-03', 'ICU-04', 'ICU-05'],
    currentShift: 'Morning',
    shiftStart: '06:00 AM',
    shiftEnd: '02:00 PM',
    todayLogin: '05:54 AM',
    todayLogout: undefined,
    isLate: false,
    lateMinutes: 0,
    status: 'On Duty',
    assignedDoctor: 'Dr. Emily Chen, MD',
    assignedPatientsCount: 4,
    assignedPatients: [
      { id: 'p001', name: 'James Wilson', bed: 'ICU-04', condition: 'Stable' },
      { id: 'p002', name: 'Sarah Chen', bed: 'ICU-05', condition: 'Observation' },
      { id: 'p003', name: 'Robert Kim', bed: 'ICU-03', condition: 'Critical' },
      { id: 'p006', name: 'Linda Thompson', bed: 'ICU-02', condition: 'Stable' },
    ],
    joiningDate: '2018-05-14',
    attendanceHistory: [
      { id: 'att-n1', staffId: 'nur-1', staffName: 'Nurse Sarah Jenkins', role: 'nurse', department: 'Critical Care', sector: 'ICU-A', date: '2026-08-19', shift: 'Morning', scheduledStart: '06:00 AM', scheduledEnd: '02:00 PM', actualLogin: '05:54 AM', isLate: false, status: 'Present' },
      { id: 'att-n2', staffId: 'nur-1', staffName: 'Nurse Sarah Jenkins', role: 'nurse', department: 'Critical Care', sector: 'ICU-A', date: '2026-08-18', shift: 'Morning', scheduledStart: '06:00 AM', scheduledEnd: '02:00 PM', actualLogin: '05:50 AM', actualLogout: '02:05 PM', totalHours: '8h 15m', isLate: false, status: 'Present' },
      { id: 'att-n3', staffId: 'nur-1', staffName: 'Nurse Sarah Jenkins', role: 'nurse', department: 'Critical Care', sector: 'ICU-A', date: '2026-08-17', shift: 'Morning', scheduledStart: '06:00 AM', scheduledEnd: '02:00 PM', actualLogin: '06:14 AM', actualLogout: '02:00 PM', totalHours: '7h 46m', isLate: true, lateMinutes: 14, status: 'Late', notes: 'Traffic delay on I-95' },
      { id: 'att-n4', staffId: 'nur-1', staffName: 'Nurse Sarah Jenkins', role: 'nurse', department: 'Critical Care', sector: 'ICU-A', date: '2026-08-16', shift: 'Morning', scheduledStart: '06:00 AM', scheduledEnd: '02:00 PM', actualLogin: '05:55 AM', actualLogout: '02:00 PM', totalHours: '8h 05m', isLate: false, status: 'Present' },
    ],
  },
  {
    id: 'nur-2',
    nurseId: 'NUR-2085',
    name: 'Nurse Priya Patel, RN',
    avatarUrl: '',
    gender: 'Female',
    phone: '+1 (555) 234-9912',
    email: 'p.patel@memorialhealth.org',
    qualification: 'BSN, RN (Trauma Certified Nurse)',
    experienceYears: 6,
    department: 'Emergency (ED)',
    sector: 'ED-Trauma',
    floor: 1,
    ward: 'Emergency Triage',
    assignedBeds: ['ED-01', 'ED-02', 'ED-03', 'ED-04'],
    currentShift: 'Morning',
    shiftStart: '06:00 AM',
    shiftEnd: '02:00 PM',
    todayLogin: '06:17 AM',
    todayLogout: undefined,
    isLate: true,
    lateMinutes: 17,
    status: 'On Duty',
    assignedDoctor: 'Dr. James Park, MD',
    assignedPatientsCount: 4,
    assignedPatients: [
      { id: 'p007', name: 'Helen Carter', bed: 'ED-02', condition: 'Critical' },
      { id: 'p008', name: 'Tom Nguyen', bed: 'ED-04', condition: 'Observation' },
    ],
    joiningDate: '2020-02-10',
    attendanceHistory: [
      { id: 'att-n5', staffId: 'nur-2', staffName: 'Nurse Priya Patel', role: 'nurse', department: 'Emergency', sector: 'ED-Trauma', date: '2026-08-19', shift: 'Morning', scheduledStart: '06:00 AM', scheduledEnd: '02:00 PM', actualLogin: '06:17 AM', isLate: true, lateMinutes: 17, status: 'Late', notes: 'Metro transit delay' },
      { id: 'att-n6', staffId: 'nur-2', staffName: 'Nurse Priya Patel', role: 'nurse', department: 'Emergency', sector: 'ED-Trauma', date: '2026-08-18', shift: 'Morning', scheduledStart: '06:00 AM', scheduledEnd: '02:00 PM', actualLogin: '05:58 AM', actualLogout: '02:00 PM', totalHours: '8h 02m', isLate: false, status: 'Present' },
    ],
  },
  {
    id: 'nur-3',
    nurseId: 'NUR-2086',
    name: 'Nurse Alex Rivera, BSN',
    avatarUrl: '',
    gender: 'Male',
    phone: '+1 (555) 234-9915',
    email: 'a.rivera@memorialhealth.org',
    qualification: 'BSN, RN, PCCN (Cardiovascular Care)',
    experienceYears: 5,
    department: 'Cardiology (CCU)',
    sector: 'CCU-1',
    floor: 2,
    ward: 'Cardiac Care',
    assignedBeds: ['CCU-01', 'CCU-02', 'CCU-03', 'CCU-04'],
    currentShift: 'Morning',
    shiftStart: '06:00 AM',
    shiftEnd: '02:00 PM',
    todayLogin: '05:50 AM',
    isLate: false,
    lateMinutes: 0,
    status: 'On Break',
    assignedDoctor: 'Dr. Marcus Brody, MD',
    assignedPatientsCount: 3,
    assignedPatients: [
      { id: 'p004', name: 'Maria Rivera', bed: 'CCU-02', condition: 'Observation' },
      { id: 'p005', name: 'David Miller', bed: 'CCU-04', condition: 'Stable' },
    ],
    joiningDate: '2021-08-01',
    attendanceHistory: [
      { id: 'att-n7', staffId: 'nur-3', staffName: 'Nurse Alex Rivera', role: 'nurse', department: 'Cardiology', sector: 'CCU-1', date: '2026-08-19', shift: 'Morning', scheduledStart: '06:00 AM', scheduledEnd: '02:00 PM', actualLogin: '05:50 AM', isLate: false, status: 'Present' },
    ],
  },
  {
    id: 'nur-4',
    nurseId: 'NUR-2087',
    name: 'Nurse Elena Rostova, RN',
    avatarUrl: '',
    gender: 'Female',
    phone: '+1 (555) 234-9918',
    email: 'e.rostova@memorialhealth.org',
    qualification: 'MSN, RN, CPAN (Post-Anesthesia Care)',
    experienceYears: 10,
    department: 'General Ward / Med-Surg',
    sector: 'GW-North',
    floor: 2,
    ward: 'Med-Surg',
    assignedBeds: ['GW-01', 'GW-02', 'GW-03', 'GW-04', 'GW-05', 'GW-06'],
    currentShift: 'Morning',
    shiftStart: '06:00 AM',
    shiftEnd: '02:00 PM',
    todayLogin: '05:58 AM',
    isLate: false,
    lateMinutes: 0,
    status: 'On Duty',
    assignedDoctor: 'Dr. Emily Chen, MD',
    assignedPatientsCount: 6,
    assignedPatients: [],
    joiningDate: '2016-09-20',
    attendanceHistory: [],
  },
  {
    id: 'nur-5',
    nurseId: 'NUR-2088',
    name: 'Nurse Johnathan Davis, RN',
    avatarUrl: '',
    gender: 'Male',
    phone: '+1 (555) 234-9922',
    email: 'j.davis@memorialhealth.org',
    qualification: 'BSN, RN (Critical Care)',
    experienceYears: 4,
    department: 'Critical Care (ICU)',
    sector: 'ICU-B',
    floor: 3,
    ward: 'ICU',
    assignedBeds: ['ICU-07', 'ICU-08', 'ICU-09', 'ICU-10'],
    currentShift: 'Evening',
    shiftStart: '02:00 PM',
    shiftEnd: '10:00 PM',
    isLate: false,
    lateMinutes: 0,
    status: 'Off Duty',
    assignedDoctor: 'Dr. Emily Chen, MD',
    assignedPatientsCount: 0,
    assignedPatients: [],
    joiningDate: '2022-01-15',
    attendanceHistory: [],
  },
  {
    id: 'nur-6',
    nurseId: 'NUR-2089',
    name: 'Nurse Jessica Taylor, RN',
    avatarUrl: '',
    gender: 'Female',
    phone: '+1 (555) 234-9925',
    email: 'j.taylor@memorialhealth.org',
    qualification: 'BSN, RN, CPN (Pediatric Certified)',
    experienceYears: 7,
    department: 'Pediatrics',
    sector: 'PEDS-A',
    floor: 4,
    ward: 'Pediatric Care',
    assignedBeds: ['PED-01', 'PED-02', 'PED-03'],
    currentShift: 'Morning',
    shiftStart: '06:00 AM',
    shiftEnd: '02:00 PM',
    todayLogin: '05:52 AM',
    isLate: false,
    lateMinutes: 0,
    status: 'On Duty',
    assignedDoctor: 'Dr. Samantha Adams, MD',
    assignedPatientsCount: 3,
    assignedPatients: [],
    joiningDate: '2019-06-11',
    attendanceHistory: [],
  },
];

const initialPatients: HospitalPatient[] = [
  {
    id: 'p001',
    patientId: 'PAT-8849',
    name: 'James Alexander Wilson',
    age: 68,
    gender: 'Male',
    bloodGroup: 'O+',
    department: 'Critical Care (ICU)',
    ward: 'ICU',
    floor: 3,
    bedNumber: 'ICU-04',
    assignedDoctor: 'Dr. Emily Chen, MD',
    assignedNurse: 'Nurse Sarah Jenkins',
    admissionDate: '2026-08-14',
    condition: 'Stable',
    diagnosisSummary: 'Type 2 Diabetes, Essential HTN, Recent Laparoscopic Appendectomy follow-up',
    allergies: ['Penicillin (Anaphylaxis)', 'Peanuts (Severe)'],
    currentMedicationsCount: 5,
    vitals: { hr: 82, spo2: 97, bp: '124/78', temp: 98.6, respRate: 16, lastUpdated: '12 seconds ago' },
    priority: 'normal',
    hasActiveAlert: false,
  },
  {
    id: 'p002',
    patientId: 'PAT-8850',
    name: 'Sarah Chen',
    age: 44,
    gender: 'Female',
    bloodGroup: 'A+',
    department: 'Critical Care (ICU)',
    ward: 'ICU',
    floor: 3,
    bedNumber: 'ICU-05',
    assignedDoctor: 'Dr. Emily Chen, MD',
    assignedNurse: 'Nurse Sarah Jenkins',
    admissionDate: '2026-08-16',
    condition: 'Observation',
    diagnosisSummary: 'Diabetic Ketoacidosis (DKA) resolving on IV regular insulin protocol',
    allergies: ['Sulfa drugs'],
    currentMedicationsCount: 4,
    vitals: { hr: 92, spo2: 98, bp: '118/72', temp: 98.9, respRate: 18, lastUpdated: '2 mins ago' },
    priority: 'high',
    hasActiveAlert: false,
  },
  {
    id: 'p003',
    patientId: 'PAT-8851',
    name: 'Robert Kim',
    age: 72,
    gender: 'Male',
    bloodGroup: 'B+',
    department: 'Critical Care (ICU)',
    ward: 'ICU',
    floor: 3,
    bedNumber: 'ICU-03',
    assignedDoctor: 'Dr. Emily Chen, MD',
    assignedNurse: 'Nurse Sarah Jenkins',
    admissionDate: '2026-08-17',
    condition: 'Critical',
    diagnosisSummary: 'COPD Exacerbation with respiratory compromise on BiPAP support',
    allergies: ['Aspirin', 'NSAIDs'],
    currentMedicationsCount: 6,
    vitals: { hr: 124, spo2: 88, bp: '158/94', temp: 101.2, respRate: 28, lastUpdated: '1 min ago' },
    priority: 'critical',
    hasActiveAlert: true,
    activeAlertMessage: '🚨 CRITICAL: SpO2 dropped to 88%, Heart Rate elevated at 124 BPM. Titrate O2 and assess airway.',
  },
  {
    id: 'p004',
    patientId: 'PAT-8852',
    name: 'Maria Rivera',
    age: 58,
    gender: 'Female',
    bloodGroup: 'O-',
    department: 'Cardiology (CCU)',
    ward: 'Cardiac Care',
    floor: 2,
    bedNumber: 'CCU-02',
    assignedDoctor: 'Dr. Marcus Brody, MD',
    assignedNurse: 'Nurse Alex Rivera',
    admissionDate: '2026-08-18',
    condition: 'Observation',
    diagnosisSummary: 'Non-STEMI Myocardial Infarction post-PCI stent placement',
    allergies: ['Iodinated Contrast (Mild rash)'],
    currentMedicationsCount: 5,
    vitals: { hr: 76, spo2: 99, bp: '128/80', temp: 98.4, respRate: 16, lastUpdated: '5 mins ago' },
    priority: 'high',
    hasActiveAlert: false,
  },
  {
    id: 'p005',
    patientId: 'PAT-8853',
    name: 'David Miller',
    age: 63,
    gender: 'Male',
    bloodGroup: 'AB+',
    department: 'Cardiology (CCU)',
    ward: 'Cardiac Care',
    floor: 2,
    bedNumber: 'CCU-04',
    assignedDoctor: 'Dr. Marcus Brody, MD',
    assignedNurse: 'Nurse Alex Rivera',
    admissionDate: '2026-08-18',
    condition: 'Stable',
    diagnosisSummary: 'Atrial Fibrillation with rapid ventricular response converted to sinus rhythm',
    allergies: ['No Known Drug Allergies'],
    currentMedicationsCount: 3,
    vitals: { hr: 74, spo2: 98, bp: '122/76', temp: 98.2, respRate: 14, lastUpdated: '8 mins ago' },
    priority: 'normal',
    hasActiveAlert: false,
  },
  {
    id: 'p006',
    patientId: 'PAT-8854',
    name: 'Linda Thompson',
    age: 51,
    gender: 'Female',
    bloodGroup: 'A-',
    department: 'Critical Care (ICU)',
    ward: 'ICU',
    floor: 3,
    bedNumber: 'ICU-02',
    assignedDoctor: 'Dr. Arthur Vance, FACS',
    assignedNurse: 'Nurse Sarah Jenkins',
    admissionDate: '2026-08-18',
    condition: 'Stable',
    diagnosisSummary: 'Post-op Laparoscopic Cholecystectomy Day 1',
    allergies: ['Codeine'],
    currentMedicationsCount: 3,
    vitals: { hr: 80, spo2: 98, bp: '120/74', temp: 98.6, respRate: 16, lastUpdated: '15 mins ago' },
    priority: 'normal',
    hasActiveAlert: false,
  },
  {
    id: 'p007',
    patientId: 'PAT-8855',
    name: 'Helen Carter',
    age: 79,
    gender: 'Female',
    bloodGroup: 'O+',
    department: 'Emergency (ED)',
    ward: 'Emergency Triage',
    floor: 1,
    bedNumber: 'ED-02',
    assignedDoctor: 'Dr. James Park, MD',
    assignedNurse: 'Nurse Priya Patel',
    admissionDate: '2026-08-19',
    condition: 'Critical',
    diagnosisSummary: 'Acute Congestive Heart Failure exacerbation with pulmonary edema',
    allergies: ['Morphine'],
    currentMedicationsCount: 5,
    vitals: { hr: 112, spo2: 89, bp: '168/98', temp: 99.1, respRate: 24, lastUpdated: '3 mins ago' },
    priority: 'critical',
    hasActiveAlert: true,
    activeAlertMessage: '🚨 CRITICAL: High blood pressure crisis (168/98) and SpO2 89%. IV Furosemide ordered.',
  },
  {
    id: 'p008',
    patientId: 'PAT-8856',
    name: 'Tom Nguyen',
    age: 29,
    gender: 'Male',
    bloodGroup: 'B-',
    department: 'Emergency (ED)',
    ward: 'Emergency Triage',
    floor: 1,
    bedNumber: 'ED-04',
    assignedDoctor: 'Dr. James Park, MD',
    assignedNurse: 'Nurse Priya Patel',
    admissionDate: '2026-08-19',
    condition: 'Observation',
    diagnosisSummary: 'Right forearm fracture sustained in sports injury; splint placed',
    allergies: ['Penicillin'],
    currentMedicationsCount: 2,
    vitals: { hr: 78, spo2: 99, bp: '124/80', temp: 98.4, respRate: 15, lastUpdated: '20 mins ago' },
    priority: 'normal',
    hasActiveAlert: false,
  },
];

const initialDepartments: HospitalDepartment[] = [
  { id: 'dept-1', deptId: 'DPT-ICU', name: 'Intensive Care Unit (ICU)', floor: 3, sector: 'ICU-A / ICU-B', headDoctor: 'Dr. Emily Chen, MD', totalDoctors: 8, totalNurses: 15, totalPatients: 16, totalBeds: 20, occupiedBeds: 16, availableBeds: 4, status: 'Near Capacity' },
  { id: 'dept-2', deptId: 'DPT-ED', name: 'Emergency Department (ED)', floor: 1, sector: 'ED-Trauma / Triage', headDoctor: 'Dr. James Park, MD', totalDoctors: 12, totalNurses: 22, totalPatients: 28, totalBeds: 35, occupiedBeds: 28, availableBeds: 7, status: 'Critical Load' },
  { id: 'dept-3', deptId: 'DPT-CCU', name: 'Cardiology & CCU', floor: 2, sector: 'CCU-1 / Cath Lab', headDoctor: 'Dr. Marcus Brody, MD', totalDoctors: 6, totalNurses: 12, totalPatients: 14, totalBeds: 18, occupiedBeds: 14, availableBeds: 4, status: 'Normal' },
  { id: 'dept-4', deptId: 'DPT-SURG', name: 'Surgery & Operating Theatres', floor: 4, sector: 'OR 1–6 / Recovery', headDoctor: 'Dr. Arthur Vance, FACS', totalDoctors: 9, totalNurses: 14, totalPatients: 8, totalBeds: 12, occupiedBeds: 8, availableBeds: 4, status: 'Normal' },
  { id: 'dept-5', deptId: 'DPT-GW', name: 'General Ward / Med-Surg', floor: 2, sector: 'GW-North / South', headDoctor: 'Dr. Emily Chen, MD', totalDoctors: 10, totalNurses: 24, totalPatients: 48, totalBeds: 60, occupiedBeds: 48, availableBeds: 12, status: 'Normal' },
  { id: 'dept-6', deptId: 'DPT-NEURO', name: 'Neurology & Stroke Center', floor: 3, sector: 'NEURO-1', headDoctor: 'Dr. Neil Henderson, MD', totalDoctors: 4, totalNurses: 8, totalPatients: 10, totalBeds: 14, occupiedBeds: 10, availableBeds: 4, status: 'Normal' },
  { id: 'dept-7', deptId: 'DPT-ORTHO', name: 'Orthopedics & Joint Care', floor: 3, sector: 'ORTHO-East', headDoctor: 'Dr. Samantha Adams, MD', totalDoctors: 5, totalNurses: 9, totalPatients: 12, totalBeds: 16, occupiedBeds: 12, availableBeds: 4, status: 'Normal' },
  { id: 'dept-8', deptId: 'DPT-PEDS', name: 'Pediatrics & Neonatal ICU', floor: 4, sector: 'PEDS-A / NICU', headDoctor: 'Dr. Samantha Adams, MD', totalDoctors: 6, totalNurses: 12, totalPatients: 12, totalBeds: 16, occupiedBeds: 12, availableBeds: 4, status: 'Normal' },
  { id: 'dept-9', deptId: 'DPT-MAT', name: 'Maternity & Labor/Delivery', floor: 4, sector: 'MAT-Delivery', headDoctor: 'Dr. Emily Chen, MD', totalDoctors: 5, totalNurses: 10, totalPatients: 12, totalBeds: 16, occupiedBeds: 12, availableBeds: 4, status: 'Normal' },
  { id: 'dept-10', deptId: 'DPT-RAD', name: 'Radiology / Diagnostic Imaging', floor: 1, sector: 'RAD-3T / CT Suite', headDoctor: 'Dr. Neil Henderson, MD', totalDoctors: 4, totalNurses: 6, totalPatients: 0, totalBeds: 0, occupiedBeds: 0, availableBeds: 0, status: 'Normal' },
  { id: 'dept-11', deptId: 'DPT-LAB', name: 'Central Diagnostic Laboratory', floor: 1, sector: 'LAB-Core', headDoctor: 'Dr. Emily Chen, MD', totalDoctors: 3, totalNurses: 4, totalPatients: 0, totalBeds: 0, occupiedBeds: 0, availableBeds: 0, status: 'Normal' },
  { id: 'dept-12', deptId: 'DPT-OPD', name: 'Outpatient Department (OPD)', floor: 1, sector: 'OPD-Clinics', headDoctor: 'Dr. Emily Chen, MD', totalDoctors: 14, totalNurses: 16, totalPatients: 95, totalBeds: 0, occupiedBeds: 0, availableBeds: 0, status: 'Normal' },
  { id: 'dept-13', deptId: 'DPT-PHARM', name: 'Inpatient Clinical Pharmacy', floor: 1, sector: 'PHARM-Main', headDoctor: 'Dr. Marcus Brody, MD', totalDoctors: 2, totalNurses: 2, totalPatients: 0, totalBeds: 0, occupiedBeds: 0, availableBeds: 0, status: 'Normal' },
  { id: 'dept-14', deptId: 'DPT-REC', name: 'Post-Anesthesia Recovery (PACU)', floor: 4, sector: 'PACU-1', headDoctor: 'Dr. Arthur Vance, FACS', totalDoctors: 3, totalNurses: 8, totalPatients: 6, totalBeds: 10, occupiedBeds: 6, availableBeds: 4, status: 'Normal' },
];

const initialBeds: HospitalBed[] = [
  { id: 'bed-1', bedNumber: 'ICU-01', building: 'Main Pavilion', floor: 3, department: 'Critical Care (ICU)', ward: 'ICU', sector: 'ICU-A', status: 'Available', lastCleaned: '1 hour ago' },
  { id: 'bed-2', bedNumber: 'ICU-02', building: 'Main Pavilion', floor: 3, department: 'Critical Care (ICU)', ward: 'ICU', sector: 'ICU-A', patientId: 'p006', patientName: 'Linda Thompson', doctorName: 'Dr. Arthur Vance', nurseName: 'Nurse Sarah Jenkins', status: 'Occupied' },
  { id: 'bed-3', bedNumber: 'ICU-03', building: 'Main Pavilion', floor: 3, department: 'Critical Care (ICU)', ward: 'ICU', sector: 'ICU-A', patientId: 'p003', patientName: 'Robert Kim', doctorName: 'Dr. Emily Chen', nurseName: 'Nurse Sarah Jenkins', status: 'Occupied' },
  { id: 'bed-4', bedNumber: 'ICU-04', building: 'Main Pavilion', floor: 3, department: 'Critical Care (ICU)', ward: 'ICU', sector: 'ICU-A', patientId: 'p001', patientName: 'James Alexander Wilson', doctorName: 'Dr. Emily Chen', nurseName: 'Nurse Sarah Jenkins', status: 'Occupied' },
  { id: 'bed-5', bedNumber: 'ICU-05', building: 'Main Pavilion', floor: 3, department: 'Critical Care (ICU)', ward: 'ICU', sector: 'ICU-A', patientId: 'p002', patientName: 'Sarah Chen', doctorName: 'Dr. Emily Chen', nurseName: 'Nurse Sarah Jenkins', status: 'Occupied' },
  { id: 'bed-6', bedNumber: 'ICU-06', building: 'Main Pavilion', floor: 3, department: 'Critical Care (ICU)', ward: 'ICU', sector: 'ICU-A', status: 'Cleaning', lastCleaned: 'Cleaning in progress (EVS-4)' },
  { id: 'bed-7', bedNumber: 'CCU-01', building: 'Heart & Vascular', floor: 2, department: 'Cardiology', ward: 'Cardiac Care', sector: 'CCU-1', status: 'Available' },
  { id: 'bed-8', bedNumber: 'CCU-02', building: 'Heart & Vascular', floor: 2, department: 'Cardiology', ward: 'Cardiac Care', sector: 'CCU-1', patientId: 'p004', patientName: 'Maria Rivera', doctorName: 'Dr. Marcus Brody', nurseName: 'Nurse Alex Rivera', status: 'Occupied' },
  { id: 'bed-9', bedNumber: 'CCU-03', building: 'Heart & Vascular', floor: 2, department: 'Cardiology', ward: 'Cardiac Care', sector: 'CCU-1', status: 'Reserved' },
  { id: 'bed-10', bedNumber: 'CCU-04', building: 'Heart & Vascular', floor: 2, department: 'Cardiology', ward: 'Cardiac Care', sector: 'CCU-1', patientId: 'p005', patientName: 'David Miller', doctorName: 'Dr. Marcus Brody', nurseName: 'Nurse Alex Rivera', status: 'Occupied' },
  { id: 'bed-11', bedNumber: 'ED-01', building: 'Emergency Wing', floor: 1, department: 'Emergency', ward: 'Emergency Triage', sector: 'ED-Trauma', status: 'Available' },
  { id: 'bed-12', bedNumber: 'ED-02', building: 'Emergency Wing', floor: 1, department: 'Emergency', ward: 'Emergency Triage', sector: 'ED-Trauma', patientId: 'p007', patientName: 'Helen Carter', doctorName: 'Dr. James Park', nurseName: 'Nurse Priya Patel', status: 'Occupied' },
  { id: 'bed-13', bedNumber: 'ED-03', building: 'Emergency Wing', floor: 1, department: 'Emergency', ward: 'Emergency Triage', sector: 'ED-Trauma', status: 'Maintenance' },
  { id: 'bed-14', bedNumber: 'ED-04', building: 'Emergency Wing', floor: 1, department: 'Emergency', ward: 'Emergency Triage', sector: 'ED-Trauma', patientId: 'p008', patientName: 'Tom Nguyen', doctorName: 'Dr. James Park', nurseName: 'Nurse Priya Patel', status: 'Occupied' },
];

const initialShifts: StaffShift[] = [
  { id: 'sh-1', staffId: 'nur-1', staffName: 'Nurse Sarah Jenkins', role: 'nurse', department: 'Critical Care (ICU)', sector: 'ICU-A', date: '2026-08-19', shiftType: 'Morning', startTime: '06:00 AM', endTime: '02:00 PM', assignedLocation: 'Floor 3, ICU-A Beds 1–5', status: 'Ongoing' },
  { id: 'sh-2', staffId: 'doc-1', staffName: 'Dr. Emily Chen, MD', role: 'doctor', department: 'Critical Care (ICU)', sector: 'ICU-A', date: '2026-08-19', shiftType: 'Morning', startTime: '06:00 AM', endTime: '02:00 PM', assignedLocation: 'Floor 3, ICU Attending', status: 'Ongoing' },
  { id: 'sh-3', staffId: 'nur-2', staffName: 'Nurse Priya Patel', role: 'nurse', department: 'Emergency (ED)', sector: 'ED-Trauma', date: '2026-08-19', shiftType: 'Morning', startTime: '06:00 AM', endTime: '02:00 PM', assignedLocation: 'Floor 1, ED Pod A', status: 'Ongoing' },
  { id: 'sh-4', staffId: 'doc-3', staffName: 'Dr. James Park, MD', role: 'doctor', department: 'Emergency (ED)', sector: 'ED-Trauma', date: '2026-08-19', shiftType: 'Morning', startTime: '06:00 AM', endTime: '02:00 PM', assignedLocation: 'Floor 1, ED Attending', status: 'Ongoing' },
  { id: 'sh-5', staffId: 'nur-3', staffName: 'Nurse Alex Rivera', role: 'nurse', department: 'Cardiology (CCU)', sector: 'CCU-1', date: '2026-08-19', shiftType: 'Morning', startTime: '06:00 AM', endTime: '02:00 PM', assignedLocation: 'Floor 2, CCU Beds 1–4', status: 'Ongoing' },
  { id: 'sh-6', staffId: 'nur-5', staffName: 'Nurse Johnathan Davis', role: 'nurse', department: 'Critical Care (ICU)', sector: 'ICU-B', date: '2026-08-19', shiftType: 'Evening', startTime: '02:00 PM', endTime: '10:00 PM', assignedLocation: 'Floor 3, ICU-B Beds 7–10', status: 'Scheduled' },
  { id: 'sh-7', staffId: 'doc-5', staffName: 'Dr. Samantha Adams', role: 'doctor', department: 'Orthopedics', sector: 'ORTHO-East', date: '2026-08-19', shiftType: 'Evening', startTime: '02:00 PM', endTime: '10:00 PM', assignedLocation: 'Floor 3, Ortho Ward', status: 'Scheduled' },
];

const initialNurseTasks: NurseTask[] = [
  { id: 'tsk-1', title: 'Check Blood Pressure & Record Vitals', patientName: 'James Alexander Wilson', patientId: 'p001', bedNumber: 'ICU-04', priority: 'normal', dueTime: '12:00 PM', status: 'Pending', assignedNurseId: 'nur-1' },
  { id: 'tsk-2', title: 'Administer Metformin 500mg (Oral)', patientName: 'James Alexander Wilson', patientId: 'p001', bedNumber: 'ICU-04', priority: 'high', dueTime: '12:00 PM', status: 'Pending', assignedNurseId: 'nur-1' },
  { id: 'tsk-3', title: 'Verify Blood Glucose Fingerstick', patientName: 'Sarah Chen', patientId: 'p002', bedNumber: 'ICU-05', priority: 'high', dueTime: '11:45 AM', status: 'In Progress', assignedNurseId: 'nur-1' },
  { id: 'tsk-4', title: 'Check BiPAP Mask Seal & O2 Flow', patientName: 'Robert Kim', patientId: 'p003', bedNumber: 'ICU-03', priority: 'urgent', dueTime: 'NOW', status: 'Overdue', assignedNurseId: 'nur-1' },
  { id: 'tsk-5', title: 'Post-op Wound Dressing Inspection', patientName: 'Linda Thompson', patientId: 'p006', bedNumber: 'ICU-02', priority: 'normal', dueTime: '01:30 PM', status: 'Pending', assignedNurseId: 'nur-1' },
];

const initialMedSchedules: NurseMedSchedule[] = [
  { id: 'med-sch-1', patientName: 'James Alexander Wilson', patientId: 'p001', bedNumber: 'ICU-04', medicineName: 'Metformin Hydrochloride', dosage: '500 mg', route: 'Oral', scheduledTime: '12:00 PM', status: 'Due' },
  { id: 'med-sch-2', patientName: 'James Alexander Wilson', patientId: 'p001', bedNumber: 'ICU-04', medicineName: 'Lisinopril', dosage: '10 mg', route: 'Oral', scheduledTime: '08:00 AM', status: 'Administered', administeredAt: '08:04 AM', administeredBy: 'Nurse Sarah Jenkins' },
  { id: 'med-sch-3', patientName: 'Sarah Chen', patientId: 'p002', bedNumber: 'ICU-05', medicineName: 'Insulin Glargine', dosage: '20 Units', route: 'Subcutaneous', scheduledTime: '11:30 AM', status: 'Due' },
  { id: 'med-sch-4', patientName: 'Robert Kim', patientId: 'p003', bedNumber: 'ICU-03', medicineName: 'Albuterol Sulfate Nebulizer', dosage: '2.5 mg', route: 'Inhalation (Neb)', scheduledTime: '11:00 AM', status: 'Overdue' },
  { id: 'med-sch-5', patientName: 'Robert Kim', patientId: 'p003', bedNumber: 'ICU-03', medicineName: 'Vancomycin IV', dosage: '1000 mg in 250mL NS', route: 'Intravenous', scheduledTime: '02:00 PM', status: 'Due' },
];

const initialActivityLogs: HospitalActivityLog[] = [
  { id: 'act-1', user: 'Nurse Sarah Jenkins', role: 'Nurse', action: 'Logged in to Morning Shift at ICU-A (05:54 AM)', location: 'Floor 3, ICU-A Station', timestamp: '05:54 AM', type: 'success' },
  { id: 'act-2', user: 'Dr. Emily Chen, MD', role: 'Doctor', action: 'Completed morning bedside rounds on Bed ICU-04 (James Wilson)', location: 'Floor 3, ICU-04', timestamp: '09:12 AM', type: 'info' },
  { id: 'act-3', user: 'Nurse Sarah Jenkins', role: 'Nurse', action: 'Administered Lisinopril 10mg to Bed ICU-04 (James Wilson)', location: 'Floor 3, ICU-04', timestamp: '08:04 AM', type: 'success' },
  { id: 'act-4', user: 'Nurse Priya Patel', role: 'Nurse', action: 'Logged in LATE to Morning Shift (06:17 AM · Late by 17 mins)', location: 'Floor 1, Emergency Desk', timestamp: '06:17 AM', type: 'warning' },
  { id: 'act-5', user: 'Admin Singh', role: 'Admin', action: 'Assigned Nurse Sarah Jenkins to ICU-A Beds 1–5 for Morning Shift', location: 'Hospital Admin Command', timestamp: '05:30 AM', type: 'info' },
  { id: 'act-6', user: 'System Telemetry', role: 'System', action: 'Critical SpO2 Alert triggered on Bed ICU-03 (Robert Kim: 88%)', location: 'Floor 3, ICU-03', timestamp: '10:32 AM', type: 'danger' },
];

export const useHospitalStore = create<HospitalState>()(
  devtools(
    (set, get) => ({
      doctors: initialDoctors,
      nurses: initialNurses,
      patients: initialPatients,
      departments: initialDepartments,
      beds: initialBeds,
      shifts: initialShifts,
      attendanceRecords: [
        ...initialDoctors.flatMap(d => d.attendanceHistory),
        ...initialNurses.flatMap(n => n.attendanceHistory),
      ],
      nurseTasks: initialNurseTasks,
      medSchedules: initialMedSchedules,
      activityLogs: initialActivityLogs,

      activeNurseId: 'nur-1', // Default: Nurse Sarah Jenkins
      setActiveNurseId: (id) => set({ activeNurseId: id }),

      selectedDoctor: null,
      setSelectedDoctor: (doctor) => set({ selectedDoctor: doctor }),
      selectedNurse: null,
      setSelectedNurse: (nurse) => set({ selectedNurse: nurse }),
      selectedPatient: null,
      setSelectedPatient: (patient) => set({ selectedPatient: patient }),

      // Nurse Shift Login Action
      startNurseShift: (nurseId, customLoginTime) => {
        const nowTime = customLoginTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const nurse = get().nurses.find(n => n.id === nurseId);
        if (!nurse) return;

        // Calculate late status
        const isLate = nowTime > nurse.shiftStart;
        const lateMinutes = isLate ? 17 : 0;

        const updatedNurses = get().nurses.map(n =>
          n.id === nurseId
            ? { ...n, status: 'On Duty' as NurseStatus, todayLogin: nowTime, isLate, lateMinutes }
            : n
        );

        const newAttendance: AttendanceRecord = {
          id: `att-${Date.now()}`,
          staffId: nurseId,
          staffName: nurse.name,
          role: 'nurse',
          department: nurse.department,
          sector: nurse.sector,
          date: new Date().toISOString().split('T')[0],
          shift: nurse.currentShift,
          scheduledStart: nurse.shiftStart,
          scheduledEnd: nurse.shiftEnd,
          actualLogin: nowTime,
          isLate,
          lateMinutes,
          status: isLate ? 'Late' : 'Present',
        };

        const newLog: HospitalActivityLog = {
          id: `act-${Date.now()}`,
          user: nurse.name,
          role: 'Nurse',
          action: isLate
            ? `Logged in LATE to ${nurse.currentShift} Shift at ${nurse.sector} (${nowTime} · Late by ${lateMinutes}m)`
            : `Started ${nurse.currentShift} Shift on time at ${nurse.sector} (${nowTime})`,
          location: `${nurse.department} · Floor ${nurse.floor}`,
          timestamp: nowTime,
          type: isLate ? 'warning' : 'success',
        };

        set(state => ({
          nurses: updatedNurses,
          attendanceRecords: [newAttendance, ...state.attendanceRecords],
          activityLogs: [newLog, ...state.activityLogs],
        }));
      },

      // Nurse Shift Logout Action
      endNurseShift: (nurseId, customLogoutTime) => {
        const nowTime = customLogoutTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const nurse = get().nurses.find(n => n.id === nurseId);
        if (!nurse) return;

        const updatedNurses = get().nurses.map(n =>
          n.id === nurseId
            ? { ...n, status: 'Off Duty' as NurseStatus, todayLogout: nowTime }
            : n
        );

        const newLog: HospitalActivityLog = {
          id: `act-${Date.now()}`,
          user: nurse.name,
          role: 'Nurse',
          action: `Ended ${nurse.currentShift} Shift and logged out (${nowTime})`,
          location: `${nurse.department} · Floor ${nurse.floor}`,
          timestamp: nowTime,
          type: 'info',
        };

        set(state => ({
          nurses: updatedNurses,
          activityLogs: [newLog, ...state.activityLogs],
        }));
      },

      setNurseStatus: (nurseId, status) => {
        const nurse = get().nurses.find(n => n.id === nurseId);
        set(state => ({
          nurses: state.nurses.map(n => n.id === nurseId ? { ...n, status } : n),
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              user: nurse?.name || 'Nurse',
              role: 'Nurse',
              action: `Status changed to ${status}`,
              location: `${nurse?.department || 'Ward'}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: status === 'On Duty' ? 'success' : status === 'On Break' ? 'warning' : 'info',
            },
            ...state.activityLogs,
          ],
        }));
      },

      setDoctorStatus: (doctorId, status) => {
        const doc = get().doctors.find(d => d.id === doctorId);
        set(state => ({
          doctors: state.doctors.map(d => d.id === doctorId ? { ...d, status, loginStatus: status === 'Off Duty' ? 'Offline' : 'Online' } : d),
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              user: doc?.name || 'Doctor',
              role: 'Doctor',
              action: `Doctor status updated to ${status}`,
              location: `${doc?.department || 'Hospital'}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'info',
            },
            ...state.activityLogs,
          ],
        }));
      },

      completeNurseTask: (taskId, nurseName) => {
        const task = get().nurseTasks.find(t => t.id === taskId);
        const name = nurseName || 'Nurse Sarah Jenkins';
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        set(state => ({
          nurseTasks: state.nurseTasks.map(t =>
            t.id === taskId ? { ...t, status: 'Completed', completedAt: nowTime } : t
          ),
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              user: name,
              role: 'Nurse',
              action: `Completed task: "${task?.title}" for ${task?.patientName} (${task?.bedNumber})`,
              location: `Bed ${task?.bedNumber}`,
              timestamp: nowTime,
              type: 'success',
            },
            ...state.activityLogs,
          ],
        }));
      },

      administerMedication: (medId, nurseName) => {
        const med = get().medSchedules.find(m => m.id === medId);
        const name = nurseName || 'Nurse Sarah Jenkins';
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        set(state => ({
          medSchedules: state.medSchedules.map(m =>
            m.id === medId ? { ...m, status: 'Administered', administeredAt: nowTime, administeredBy: name } : m
          ),
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              user: name,
              role: 'Nurse',
              action: `Administered ${med?.medicineName} (${med?.dosage}) to Bed ${med?.bedNumber} (${med?.patientName})`,
              location: `Bed ${med?.bedNumber}`,
              timestamp: nowTime,
              type: 'success',
            },
            ...state.activityLogs,
          ],
        }));
      },

      updatePatientVitals: (patientId, newVitals) => {
        const patient = get().patients.find(p => p.id === patientId);
        const isCritical = newVitals.spo2 < 90 || newVitals.hr > 120 || newVitals.hr < 50;

        const updatedPatients = get().patients.map(p =>
          p.id === patientId
            ? {
                ...p,
                vitals: { ...newVitals, lastUpdated: 'Just now' },
                priority: isCritical ? ('critical' as const) : p.priority,
                hasActiveAlert: isCritical,
                activeAlertMessage: isCritical
                  ? `🚨 CRITICAL: SpO2 at ${newVitals.spo2}%, HR ${newVitals.hr} bpm, BP ${newVitals.bp}`
                  : undefined,
              }
            : p
        );

        set(state => ({
          patients: updatedPatients,
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              user: 'Nurse Station',
              role: 'Nurse',
              action: `Updated vitals for ${patient?.name} (${patient?.bedNumber}): HR ${newVitals.hr} bpm, SpO2 ${newVitals.spo2}%, BP ${newVitals.bp}`,
              location: `Bed ${patient?.bedNumber}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: isCritical ? 'danger' : 'info',
            },
            ...state.activityLogs,
          ],
        }));
      },

      resolvePatientAlert: (patientId) => {
        const patient = get().patients.find(p => p.id === patientId);
        set(state => ({
          patients: state.patients.map(p =>
            p.id === patientId ? { ...p, hasActiveAlert: false, activeAlertMessage: undefined } : p
          ),
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              user: 'Attending Clinician',
              role: 'Nurse',
              action: `Resolved critical alert for Bed ${patient?.bedNumber} (${patient?.name})`,
              location: `Bed ${patient?.bedNumber}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'success',
            },
            ...state.activityLogs,
          ],
        }));
      },

      updateBedStatus: (bedId, newStatus, patientName, patientId) => {
        const bed = get().beds.find(b => b.id === bedId);
        set(state => ({
          beds: state.beds.map(b =>
            b.id === bedId
              ? {
                  ...b,
                  status: newStatus,
                  patientName: newStatus === 'Available' ? undefined : (patientName || b.patientName),
                  patientId: newStatus === 'Available' ? undefined : (patientId || b.patientId),
                }
              : b
          ),
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              user: 'Hospital Operations',
              role: 'Admin',
              action: `Bed ${bed?.bedNumber} status updated to "${newStatus}"${patientName ? ` for ${patientName}` : ''}`,
              location: `${bed?.department} · Floor ${bed?.floor}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'info',
            },
            ...state.activityLogs,
          ],
        }));
      },

      assignStaffShift: (shiftData) => {
        const newShift: StaffShift = {
          ...shiftData,
          id: `sh-${Date.now()}`,
          status: 'Scheduled',
        };

        set(state => ({
          shifts: [newShift, ...state.shifts],
          activityLogs: [
            {
              id: `act-${Date.now()}`,
              user: 'Admin Operations',
              role: 'Admin',
              action: `Assigned ${shiftData.shiftType} shift to ${shiftData.staffName} (${shiftData.department})`,
              location: shiftData.assignedLocation,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'info',
            },
            ...state.activityLogs,
          ],
        }));
      },

      addActivityLog: (log) => {
        set(state => ({
          activityLogs: [{ ...log, id: `act-${Date.now()}` }, ...state.activityLogs],
        }));
      },
    }),
    { name: 'medai-hospital-store' }
  )
);
