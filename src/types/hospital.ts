export type DoctorStatus = 'Available' | 'On Break' | 'In Consultation' | 'Off Duty' | 'On Leave';
export type NurseStatus = 'On Duty' | 'On Break' | 'Off Duty' | 'On Leave';
export type PatientCondition = 'Stable' | 'Observation' | 'Critical' | 'Discharged';
export type BedStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Reserved' | 'Maintenance';
export type ShiftType = 'Morning' | 'Evening' | 'Night' | 'Custom';
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave' | 'Half Day';
export type TaskPriority = 'urgent' | 'high' | 'normal';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
export type MedAdminStatus = 'Due' | 'Overdue' | 'Administered';

export interface DoctorAppointment {
  id: string;
  time: string;
  patientName: string;
  patientId: string;
  type: string;
  status: 'Scheduled' | 'Completed' | 'In Progress' | 'Cancelled';
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: 'doctor' | 'nurse';
  department: string;
  sector: string;
  date: string;
  shift: ShiftType;
  scheduledStart: string;
  scheduledEnd: string;
  actualLogin?: string;
  actualLogout?: string;
  totalHours?: string;
  isLate: boolean;
  lateMinutes?: number;
  status: AttendanceStatus;
  notes?: string;
}

export interface HospitalDoctor {
  id: string;
  doctorId: string; // e.g. DOC-1042
  name: string;
  avatarUrl: string;
  gender: 'Male' | 'Female' | 'Other';
  specialization: string;
  department: string;
  sector: string;
  floor: number;
  ward: string;
  phone: string;
  email: string;
  experienceYears: number;
  qualification: string;
  currentShift: ShiftType;
  shiftHours: string; // "08:00 AM – 04:00 PM"
  status: DoctorStatus;
  loginStatus: 'Online' | 'Offline' | 'In Consultation';
  patientsAssignedCount: number;
  joiningDate: string;
  assignedPatients: Array<{ id: string; name: string; bed: string; condition: string }>;
  assignedBeds: string[];
  todayAppointments: DoctorAppointment[];
  attendanceHistory: AttendanceRecord[];
}

export interface HospitalNurse {
  id: string;
  nurseId: string; // e.g. NUR-2084
  name: string;
  avatarUrl: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  qualification: string;
  experienceYears: number;
  department: string;
  sector: string; // e.g. "ICU-A"
  floor: number;
  ward: string; // e.g. "ICU"
  assignedBeds: string[]; // ["ICU-01", "ICU-02", "ICU-03", "ICU-04", "ICU-05"]
  currentShift: ShiftType;
  shiftStart: string; // "06:00 AM"
  shiftEnd: string; // "02:00 PM"
  todayLogin?: string; // "05:54 AM"
  todayLogout?: string;
  isLate: boolean;
  lateMinutes: number;
  status: NurseStatus;
  assignedDoctor: string; // "Dr. Emily Chen, MD"
  assignedPatientsCount: number;
  assignedPatients: Array<{ id: string; name: string; bed: string; condition: string }>;
  joiningDate: string;
  attendanceHistory: AttendanceRecord[];
}

export interface PatientVitals {
  hr: number; // bpm
  spo2: number; // %
  bp: string; // "124/78"
  temp: number; // °F
  respRate?: number;
  lastUpdated: string;
}

export interface HospitalPatient {
  id: string;
  patientId: string; // e.g. PAT-8849
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  department: string;
  ward: string;
  floor: number;
  bedNumber: string; // e.g. "ICU-04"
  assignedDoctor: string; // "Dr. Emily Chen"
  assignedNurse: string; // "Nurse Sarah"
  admissionDate: string;
  condition: PatientCondition;
  diagnosisSummary: string;
  allergies: string[];
  currentMedicationsCount: number;
  vitals: PatientVitals;
  priority: 'critical' | 'high' | 'normal';
  hasActiveAlert: boolean;
  activeAlertMessage?: string;
}

export interface HospitalDepartment {
  id: string;
  deptId: string; // e.g. DPT-ICU
  name: string;
  floor: number;
  sector: string;
  headDoctor: string;
  totalDoctors: number;
  totalNurses: number;
  totalPatients: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  status: 'Normal' | 'Near Capacity' | 'Critical Load';
}

export interface HospitalBed {
  id: string;
  bedNumber: string; // e.g. "ICU-01"
  building: string;
  floor: number;
  department: string;
  ward: string;
  sector: string;
  patientId?: string;
  patientName?: string;
  doctorName?: string;
  nurseName?: string;
  status: BedStatus;
  lastCleaned?: string;
}

export interface StaffShift {
  id: string;
  staffId: string;
  staffName: string;
  role: 'doctor' | 'nurse';
  department: string;
  sector: string;
  date: string;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  assignedLocation: string;
  status: 'Scheduled' | 'Completed' | 'Ongoing' | 'Cancelled';
}

export interface NurseTask {
  id: string;
  title: string;
  patientName: string;
  patientId: string;
  bedNumber: string;
  priority: TaskPriority;
  dueTime: string;
  status: TaskStatus;
  assignedNurseId: string;
  completedAt?: string;
}

export interface NurseMedSchedule {
  id: string;
  patientName: string;
  patientId: string;
  bedNumber: string;
  medicineName: string;
  dosage: string;
  route: string;
  scheduledTime: string;
  status: MedAdminStatus;
  administeredAt?: string;
  administeredBy?: string;
}

export interface HospitalActivityLog {
  id: string;
  user: string;
  role: 'Admin' | 'Doctor' | 'Nurse' | 'System';
  action: string;
  location: string;
  timestamp: string;
  type: 'success' | 'warning' | 'danger' | 'info';
}
