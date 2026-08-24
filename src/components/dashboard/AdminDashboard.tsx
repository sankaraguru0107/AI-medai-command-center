import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, AlertTriangle, Bed, Brain, Calendar, CheckCircle2,
  Clock, CreditCard, Download, Edit3, Eye, FileText, Filter, Flame,
  Layers, Lock, MapPin, MessageSquare, PhoneCall, Plus, Printer,
  RefreshCw, Search, Send, Server, Shield, ShieldAlert, ShieldCheck,
  Stethoscope, User, UserCheck, Users, X, Zap, ChevronRight, AlertCircle,
  Building2, Briefcase, Award, Sparkles, Check, CheckCircle
} from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { useAppStore } from '../../store/appStore';
import { useHospitalStore } from '../../store/hospitalStore';
import {
  HospitalDoctor, HospitalNurse, HospitalPatient, HospitalDepartment,
  HospitalBed, StaffShift, AttendanceRecord, DoctorStatus, NurseStatus,
  BedStatus, ShiftType
} from '../../types/hospital';
import { MedicalProfileModule } from '../medical-profile/MedicalProfileModule';

type AdminTab = 'overview' | 'doctors' | 'nurses' | 'patients' | 'departments' | 'beds' | 'shifts' | 'attendance' | 'activity';

export const AdminDashboard: React.FC = () => {
  const { setActiveModule, setActiveDashboard } = useAppStore();
  const {
    doctors, nurses, patients, departments, beds, shifts, attendanceRecords,
    activityLogs, selectedDoctor, setSelectedDoctor, selectedNurse, setSelectedNurse,
    selectedPatient, setSelectedPatient, updateBedStatus, assignStaffShift, setDoctorStatus,
    setNurseStatus
  } = useHospitalStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [attendanceRoleTab, setAttendanceRoleTab] = useState<'doctor' | 'nurse'>('nurse');

  // Live Clock
  const [liveTime, setLiveTime] = useState<string>(new Date().toLocaleTimeString());
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Modals
  const [showAssignShiftModal, setShowAssignShiftModal] = useState<boolean>(false);
  const [showBedStatusModal, setShowBedStatusModal] = useState<HospitalBed | null>(null);
  const [showPatientMedicalProfile, setShowPatientMedicalProfile] = useState<boolean>(false);

  // New Shift Form
  const [newShiftStaffName, setNewShiftStaffName] = useState<string>('Nurse Sarah Jenkins');
  const [newShiftRole, setNewShiftRole] = useState<'doctor' | 'nurse'>('nurse');
  const [newShiftDept, setNewShiftDept] = useState<string>('Critical Care (ICU)');
  const [newShiftSector, setNewShiftSector] = useState<string>('ICU-A');
  const [newShiftType, setNewShiftType] = useState<ShiftType>('Morning');
  const [newShiftLocation, setNewShiftLocation] = useState<string>('Floor 3, ICU-A Beds 1–5');

  // Toast
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Filtered Doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const matchSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.doctorId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = departmentFilter === 'all' || doc.department.toLowerCase().includes(departmentFilter.toLowerCase());
      const matchStatus = statusFilter === 'all' || doc.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchDept && matchStatus;
    });
  }, [doctors, searchQuery, departmentFilter, statusFilter]);

  // Filtered Nurses
  const filteredNurses = useMemo(() => {
    return nurses.filter(nur => {
      const matchSearch = nur.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nur.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nur.nurseId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = departmentFilter === 'all' || nur.department.toLowerCase().includes(departmentFilter.toLowerCase());
      const matchStatus = statusFilter === 'all' || nur.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchDept && matchStatus;
    });
  }, [nurses, searchQuery, departmentFilter, statusFilter]);

  // Filtered Patients
  const filteredPatients = useMemo(() => {
    return patients.filter(pat => {
      const matchSearch = pat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pat.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pat.bedNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept = departmentFilter === 'all' || pat.department.toLowerCase().includes(departmentFilter.toLowerCase());
      const matchStatus = statusFilter === 'all' || pat.condition.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchDept && matchStatus;
    });
  }, [patients, searchQuery, departmentFilter, statusFilter]);

  // Filtered Beds
  const filteredBeds = useMemo(() => {
    return beds.filter(b => {
      const matchSearch = b.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.patientName && b.patientName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchDept = departmentFilter === 'all' || b.department.toLowerCase().includes(departmentFilter.toLowerCase());
      const matchStatus = statusFilter === 'all' || b.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchDept && matchStatus;
    });
  }, [beds, searchQuery, departmentFilter, statusFilter]);

  // Filtered Attendance
  const filteredAttendance = useMemo(() => {
    return attendanceRecords.filter(att => att.role === attendanceRoleTab);
  }, [attendanceRecords, attendanceRoleTab]);

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = newShiftRole === 'nurse'
      ? nurses.find(n => n.name === newShiftStaffName)
      : doctors.find(d => d.name === newShiftStaffName);

    assignStaffShift({
      staffId: staff?.id || 'staff-gen',
      staffName: newShiftStaffName,
      role: newShiftRole,
      department: newShiftDept,
      sector: newShiftSector,
      date: new Date().toISOString().split('T')[0],
      shiftType: newShiftType,
      startTime: newShiftType === 'Morning' ? '06:00 AM' : newShiftType === 'Evening' ? '02:00 PM' : '10:00 PM',
      endTime: newShiftType === 'Morning' ? '02:00 PM' : newShiftType === 'Evening' ? '10:00 PM' : '06:00 AM',
      assignedLocation: newShiftLocation,
      status: 'Scheduled',
    });

    setShowAssignShiftModal(false);
    triggerToast(`Assigned ${newShiftType} shift to ${newShiftStaffName}`);
  };

  const handleUpdateBed = (newStatus: BedStatus) => {
    if (!showBedStatusModal) return;
    updateBedStatus(showBedStatusModal.id, newStatus);
    setShowBedStatusModal(null);
    triggerToast(`Bed ${showBedStatusModal.bedNumber} marked as ${newStatus}`);
  };

  const onDutyNursesCount = nurses.filter(n => n.status === 'On Duty').length;
  const onDutyDoctorsCount = doctors.filter(d => d.status === 'Available' || d.status === 'In Consultation').length;
  const occupiedBedsCount = beds.filter(b => b.status === 'Occupied').length;
  const availableBedsCount = beds.filter(b => b.status === 'Available').length;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1700px] mx-auto text-slate-800 font-sans">
      {/* Action Toast */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 right-6 z-50 p-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-2xl"
          >
            <CheckCircle2 size={16} /> {actionNotice}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. EXECUTIVE HERO COMMAND HEADER */}
      <div className="glass-card p-6 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl relative overflow-hidden shadow-2xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-lg flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                HOSPITAL COMMAND
              </span>
              <span className="text-xs text-slate-400 font-medium font-mono">
                St. Jude Memorial Health System · Live Master Vault
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-2 tracking-tight">
              Hospital Enterprise Admin Command Center
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Comprehensive hospital management: monitor doctors, nurses, inpatient beds, clinical departments, staff shifts, real-time attendance, and hospital activity audit streams.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Telemetry Clock</span>
              <span className="font-mono text-sm font-extrabold text-white">{liveTime}</span>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Staff On Duty</span>
              <span className="text-sm font-extrabold text-emerald-400">
                {onDutyDoctorsCount + onDutyNursesCount} Clinicians Active
              </span>
            </div>
            <button
              onClick={() => setShowAssignShiftModal(true)}
              className="btn-primary text-xs py-3 px-4 font-bold bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-500/20 flex items-center gap-1.5 border-none"
            >
              <Plus size={16} /> Assign Shift
            </button>
          </div>
        </div>

        {/* 2. REAL-TIME STAFF ON DUTY TICKER BAR */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-3 overflow-x-auto scrollbar-thin text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0 flex items-center gap-1">
            <Users size={12} className="text-primary-400" /> Live Duty Roster:
          </span>
          {nurses.map(n => (
            <div
              key={n.id}
              onClick={() => setSelectedNurse(n)}
              className="p-1.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 flex items-center gap-2 shrink-0 cursor-pointer transition-all"
            >
              <span className={`w-2 h-2 rounded-full ${
                n.status === 'On Duty' ? 'bg-emerald-400 animate-pulse' : n.status === 'On Break' ? 'bg-amber-400' : 'bg-slate-500'
              }`} />
              <span className="font-bold text-slate-200 text-[11px]">{n.name.split(' ')[0]} {n.name.split(' ')[1]}</span>
              <span className="text-[10px] text-slate-400 font-mono">({n.sector})</span>
            </div>
          ))}
          {doctors.map(d => (
            <div
              key={d.id}
              onClick={() => setSelectedDoctor(d)}
              className="p-1.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 flex items-center gap-2 shrink-0 cursor-pointer transition-all"
            >
              <span className={`w-2 h-2 rounded-full ${
                d.status === 'Available' ? 'bg-emerald-400' : d.status === 'In Consultation' ? 'bg-primary-400' : 'bg-slate-500'
              }`} />
              <span className="font-bold text-slate-200 text-[11px]">{d.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">({d.specialization.split(' ')[0]})</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. HOSPITAL-WIDE METRIC CARDS (Exact Hospital Statistics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
        <div className="glass-card p-3.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Doctors</span>
          <div className="text-xl font-extrabold font-display text-slate-900">42</div>
          <span className="text-[10px] text-emerald-600 font-semibold">{onDutyDoctorsCount} Online</span>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Nurses</span>
          <div className="text-xl font-extrabold font-display text-slate-900">86</div>
          <span className="text-[10px] text-emerald-600 font-semibold">{onDutyNursesCount} On Duty</span>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Patients</span>
          <div className="text-xl font-extrabold font-display text-slate-900">318</div>
          <span className="text-[10px] text-slate-500 font-semibold">{patients.length} Active Reg</span>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Departments</span>
          <div className="text-xl font-extrabold font-display text-slate-900">{departments.length}</div>
          <span className="text-[10px] text-primary-600 font-semibold">14 Sectors</span>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Beds</span>
          <div className="text-xl font-extrabold font-display text-slate-900">450</div>
          <span className="text-[10px] text-slate-500 font-semibold">Licensed</span>
        </div>

        <div className="glass-card p-3.5 space-y-1 bg-rose-50/50 border-rose-200">
          <span className="text-[10px] text-rose-700 font-bold uppercase block">Occupied Beds</span>
          <div className="text-xl font-extrabold font-display text-rose-700">372</div>
          <span className="text-[10px] text-rose-600 font-bold">82.6% Occupancy</span>
        </div>

        <div className="glass-card p-3.5 space-y-1 bg-emerald-50/50 border-emerald-200">
          <span className="text-[10px] text-emerald-700 font-bold uppercase block">Available Beds</span>
          <div className="text-xl font-extrabold font-display text-emerald-700">78</div>
          <span className="text-[10px] text-emerald-600 font-bold">Ready for Intake</span>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">ICU Beds</span>
          <div className="text-xl font-extrabold font-display text-slate-900">20</div>
          <span className="text-[10px] text-amber-600 font-semibold">16 Occ · 4 Avail</span>
        </div>

        <div className="glass-card p-3.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Emergency Beds</span>
          <div className="text-xl font-extrabold font-display text-slate-900">35</div>
          <span className="text-[10px] text-rose-600 font-semibold">28 Occ · 7 Avail</span>
        </div>

        <div className="glass-card p-3.5 space-y-1 bg-primary-50/50 border-primary-200">
          <span className="text-[10px] text-primary-700 font-bold uppercase block">Staff On Duty</span>
          <div className="text-xl font-extrabold font-display text-primary-700">54</div>
          <span className="text-[10px] text-primary-600 font-bold">Morning Shift</span>
        </div>
      </div>

      {/* 4. NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Hospital Overview', icon: Activity, badge: undefined },
          { id: 'doctors', label: 'Doctors', icon: Stethoscope, badge: `${doctors.length}` },
          { id: 'nurses', label: 'Nurses', icon: Users, badge: `${nurses.length}` },
          { id: 'patients', label: 'Patients', icon: User, badge: `${patients.length}` },
          { id: 'departments', label: 'Departments & Sectors', icon: Building2, badge: `${departments.length}` },
          { id: 'beds', label: 'Bed Management', icon: Bed, badge: `${beds.length}` },
          { id: 'shifts', label: 'Shift Management', icon: Calendar, badge: `${shifts.length}` },
          { id: 'attendance', label: 'Staff Attendance', icon: Clock, badge: undefined },
          { id: 'activity', label: 'Hospital Activity', icon: FileText, badge: `${activityLogs.length}` },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as AdminTab);
                setSearchQuery('');
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-primary-400' : 'text-slate-400'} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${
                  isActive ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 5. SEARCH & FILTER CONTROLS (FOR LIST TABS) */}
      {activeTab !== 'overview' && activeTab !== 'activity' && (
        <div className="glass-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-xs border border-transparent focus:border-primary-400 focus:bg-white outline-none transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 bg-slate-100 rounded-xl border border-transparent text-xs font-semibold focus:bg-white outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="critical">Critical Care (ICU)</option>
              <option value="emergency">Emergency (ED)</option>
              <option value="cardiology">Cardiology (CCU)</option>
              <option value="surgery">Surgery / OR</option>
              <option value="general">General Ward</option>
              <option value="orthopedics">Orthopedics</option>
              <option value="pediatrics">Pediatrics</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-100 rounded-xl border border-transparent text-xs font-semibold focus:bg-white outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available / On Duty / Stable</option>
              <option value="on break">On Break / Observation</option>
              <option value="off duty">Off Duty / Critical</option>
              <option value="occupied">Occupied</option>
            </select>
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT VIEWS */}
      <AnimatePresence mode="wait">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
            {/* Department Grid */}
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-display font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Building2 size={16} className="text-primary-600" />
                    Hospital Departments & Capacity Matrix
                  </h3>
                  <p className="text-xs text-slate-400">Live bed utilization and staff allocations across sectors</p>
                </div>
                <button onClick={() => setActiveTab('departments')} className="text-primary-600 font-bold text-xs hover:underline">
                  View All {departments.length} Departments →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {departments.slice(0, 6).map(dept => (
                  <div
                    key={dept.id}
                    onClick={() => {
                      setDepartmentFilter(dept.name.split(' ')[0].toLowerCase());
                      setActiveTab('beds');
                    }}
                    className="p-4 bg-slate-50 hover:bg-primary-50/40 rounded-2xl border border-slate-200/80 cursor-pointer transition-all hover:shadow-md space-y-2.5"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Floor {dept.floor} · {dept.sector}</span>
                        <h4 className="font-bold text-slate-900 text-xs">{dept.name}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        dept.status === 'Critical Load' ? 'bg-rose-100 text-rose-800' :
                        dept.status === 'Near Capacity' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {dept.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] p-2 bg-white rounded-xl border border-slate-100 text-center">
                      <div>
                        <span className="text-slate-400 text-[9px] block">Occupied</span>
                        <strong className="text-slate-900 font-bold">{dept.occupiedBeds}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[9px] block">Available</span>
                        <strong className="text-emerald-700 font-bold">{dept.availableBeds}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[9px] block">Staff</span>
                        <strong className="text-primary-700 font-bold">{dept.totalNurses + dept.totalDoctors}</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Head: <strong>{dept.headDoctor}</strong></span>
                      <span className="text-primary-600 font-bold">Inspect Sector →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Activity & Quick Actions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Recent Activity Audit Stream */}
              <div className="lg:col-span-8 glass-card p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="font-display font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <FileText size={16} className="text-primary-600" />
                    Recent Hospital Activity & Audit Stream
                  </h3>
                  <button onClick={() => setActiveTab('activity')} className="text-primary-600 text-xs font-bold hover:underline">
                    View Full Audit ({activityLogs.length}) →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {activityLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                          log.type === 'danger' ? 'bg-rose-600 animate-pulse' :
                          log.type === 'warning' ? 'bg-amber-500' :
                          log.type === 'success' ? 'bg-emerald-600' : 'bg-primary-600'
                        }`} />
                        <div>
                          <p className="font-bold text-slate-900">{log.action}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">By {log.user} ({log.role}) · {log.location}</p>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="lg:col-span-4 glass-card p-5 space-y-3 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <h3 className="font-display font-extrabold text-white text-sm">Administrative Quick Tools</h3>
                <div className="space-y-2 text-xs font-bold">
                  <button
                    onClick={() => setShowAssignShiftModal(true)}
                    className="w-full p-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white flex items-center justify-between transition-all"
                  >
                    <span>Schedule Staff Shift</span>
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => setActiveTab('beds')}
                    className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center justify-between transition-all"
                  >
                    <span>Manage Bed Allocation</span>
                    <Bed size={16} />
                  </button>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center justify-between transition-all"
                  >
                    <span>Review Staff Login Times</span>
                    <Clock size={16} />
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center justify-between transition-all"
                  >
                    <span>Print Hospital Operations Report</span>
                    <Printer size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: DOCTOR MANAGEMENT */}
        {activeTab === 'doctors' && (
          <motion.div key="doctors" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="glass-card overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="p-3.5">Doctor ID & Name</th>
                      <th className="p-3.5">Specialization & Dept</th>
                      <th className="p-3.5">Assigned Ward</th>
                      <th className="p-3.5">Current Shift</th>
                      <th className="p-3.5">Contact</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Patients</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDoctors.map(doc => (
                      <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold font-display text-xs">
                              {doc.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <div>
                              <strong className="text-slate-900 block font-bold text-xs">{doc.name}</strong>
                              <span className="font-mono text-[10px] text-slate-400">{doc.doctorId} · {doc.qualification.split('(')[0]}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{doc.specialization}</div>
                          <div className="text-[10px] text-slate-400">{doc.department}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                            {doc.sector} (Fl {doc.floor})
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{doc.currentShift}</div>
                          <div className="text-[10px] text-slate-400">{doc.shiftHours}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="text-slate-800">{doc.phone}</div>
                          <div className="text-[10px] text-slate-400">{doc.email}</div>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 w-fit ${
                            doc.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                            doc.status === 'In Consultation' ? 'bg-primary-100 text-primary-800' :
                            doc.status === 'On Break' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              doc.status === 'Available' ? 'bg-emerald-600' :
                              doc.status === 'In Consultation' ? 'bg-primary-600' : 'bg-slate-400'
                            }`} />
                            {doc.status}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {doc.assignedPatients.length} Assigned
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSelectedDoctor(doc)}
                            className="btn-secondary text-[11px] py-1 px-2.5 font-bold"
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: NURSE MANAGEMENT */}
        {activeTab === 'nurses' && (
          <motion.div key="nurses" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="glass-card overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="p-3.5">Nurse ID & Name</th>
                      <th className="p-3.5">Department & Sector</th>
                      <th className="p-3.5">Assigned Beds</th>
                      <th className="p-3.5">Shift & Hours</th>
                      <th className="p-3.5">Today Login / Logout</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredNurses.map(nur => (
                      <tr key={nur.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold font-display text-xs">
                              {nur.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                            <div>
                              <strong className="text-slate-900 block font-bold text-xs">{nur.name}</strong>
                              <span className="font-mono text-[10px] text-slate-400">{nur.nurseId} · {nur.qualification.split(',')[0]}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{nur.department}</div>
                          <div className="text-[10px] text-primary-600 font-mono font-bold">Floor {nur.floor} · {nur.sector}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {nur.assignedBeds.slice(0, 3).map(b => (
                              <span key={b} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono text-[9px] font-bold">
                                {b}
                              </span>
                            ))}
                            {nur.assignedBeds.length > 3 && (
                              <span className="text-[9px] text-slate-400 font-mono">+{nur.assignedBeds.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{nur.currentShift} Shift</div>
                          <div className="text-[10px] text-slate-400">{nur.shiftStart} – {nur.shiftEnd}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-mono text-[11px] font-bold text-slate-800">
                            {nur.todayLogin || '—'}
                          </div>
                          {nur.isLate ? (
                            <span className="text-[10px] text-amber-600 font-bold">⚠ Late ({nur.lateMinutes}m)</span>
                          ) : nur.todayLogin ? (
                            <span className="text-[10px] text-emerald-600 font-bold">✓ On Time</span>
                          ) : null}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 w-fit ${
                            nur.status === 'On Duty' ? 'bg-emerald-100 text-emerald-800' :
                            nur.status === 'On Break' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              nur.status === 'On Duty' ? 'bg-emerald-600 animate-pulse' :
                              nur.status === 'On Break' ? 'bg-amber-600' : 'bg-slate-400'
                            }`} />
                            {nur.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSelectedNurse(nur)}
                            className="btn-secondary text-[11px] py-1 px-2.5 font-bold"
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: PATIENT MANAGEMENT */}
        {activeTab === 'patients' && (
          <motion.div key="patients" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="glass-card overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="p-3.5">Patient ID & Name</th>
                      <th className="p-3.5">Location & Bed</th>
                      <th className="p-3.5">Blood Group & Age</th>
                      <th className="p-3.5">Assigned Doctor & Nurse</th>
                      <th className="p-3.5">Admission Date</th>
                      <th className="p-3.5">Condition</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPatients.map(pat => (
                      <tr key={pat.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <strong className="text-slate-900 block font-bold text-xs">{pat.name}</strong>
                          <span className="font-mono text-[10px] text-primary-600 font-bold">{pat.patientId}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-primary-50 text-primary-800 font-mono text-[11px] font-extrabold border border-primary-200">
                            {pat.bedNumber}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">{pat.department} (Fl {pat.floor})</div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-extrabold text-rose-600 text-xs">{pat.bloodGroup}</span>
                          <div className="text-[10px] text-slate-400">{pat.age}y · {pat.gender}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{pat.assignedDoctor}</div>
                          <div className="text-[10px] text-slate-400">{pat.assignedNurse}</div>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-600">
                          {pat.admissionDate}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            pat.condition === 'Critical' ? 'bg-rose-100 text-rose-800 animate-pulse' :
                            pat.condition === 'Observation' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {pat.condition}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedPatient(pat);
                              setShowPatientMedicalProfile(true);
                            }}
                            className="btn-primary text-[11px] py-1 px-3"
                          >
                            Medical Passport →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: DEPARTMENTS & SECTORS */}
        {activeTab === 'departments' && (
          <motion.div key="departments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map(dept => (
                <div key={dept.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-primary-600 font-mono">Floor {dept.floor} · {dept.sector}</span>
                      <h4 className="font-display font-extrabold text-base text-slate-900">{dept.name}</h4>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      dept.status === 'Critical Load' ? 'bg-rose-100 text-rose-800' :
                      dept.status === 'Near Capacity' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {dept.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Beds</span>
                      <strong className="text-slate-900 font-bold">{dept.totalBeds}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Occupied</span>
                      <strong className="text-rose-700 font-bold">{dept.occupiedBeds}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Available</span>
                      <strong className="text-emerald-700 font-bold">{dept.availableBeds}</strong>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Head Physician:</span>
                      <strong className="text-slate-800">{dept.headDoctor}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Clinical Staff:</span>
                      <strong className="text-slate-800">{dept.totalDoctors} Doctors · {dept.totalNurses} Nurses</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Active Inpatients:</span>
                      <strong className="text-slate-800">{dept.totalPatients} Patients</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 6: BED MANAGEMENT */}
        {activeTab === 'beds' && (
          <motion.div key="beds" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="glass-card overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="p-3.5">Bed Number</th>
                      <th className="p-3.5">Building & Floor</th>
                      <th className="p-3.5">Department & Sector</th>
                      <th className="p-3.5">Current Inpatient</th>
                      <th className="p-3.5">Assigned MD & Nurse</th>
                      <th className="p-3.5">Bed Status</th>
                      <th className="p-3.5 text-right">Status Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBeds.map(bed => (
                      <tr key={bed.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <span className="font-display font-extrabold text-sm text-slate-900">{bed.bedNumber}</span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{bed.building}</div>
                          <div className="text-[10px] text-slate-400">Floor {bed.floor}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{bed.department}</div>
                          <span className="font-mono text-[10px] text-slate-500 font-semibold">{bed.sector}</span>
                        </td>
                        <td className="p-3.5">
                          {bed.patientName ? (
                            <strong className="text-slate-900 font-bold">{bed.patientName}</strong>
                          ) : (
                            <span className="text-slate-400 italic">No patient</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {bed.doctorName ? (
                            <div>
                              <div className="text-slate-800 font-bold">{bed.doctorName}</div>
                              <div className="text-[10px] text-slate-400">{bed.nurseName}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            bed.status === 'Occupied' ? 'bg-rose-100 text-rose-800' :
                            bed.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                            bed.status === 'Cleaning' ? 'bg-amber-100 text-amber-800' :
                            bed.status === 'Reserved' ? 'bg-primary-100 text-primary-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {bed.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setShowBedStatusModal(bed)}
                            className="btn-secondary text-[11px] py-1 px-2.5 font-bold"
                          >
                            Change Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 7: SHIFT MANAGEMENT */}
        {activeTab === 'shifts' && (
          <motion.div key="shifts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display font-extrabold text-slate-900 text-base">Hospital Staff Shift Master Schedule</h3>
                <p className="text-xs text-slate-400">Morning (06:00–14:00), Evening (14:00–22:00), Night (22:00–06:00)</p>
              </div>
              <button
                onClick={() => setShowAssignShiftModal(true)}
                className="btn-primary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5"
              >
                <Plus size={14} /> Schedule Shift
              </button>
            </div>

            <div className="glass-card overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="p-3.5">Staff Member & Role</th>
                      <th className="p-3.5">Department & Sector</th>
                      <th className="p-3.5">Date & Shift Type</th>
                      <th className="p-3.5">Shift Window</th>
                      <th className="p-3.5">Assigned Location</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shifts.map(sh => (
                      <tr key={sh.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <strong className="text-slate-900 font-bold text-xs block">{sh.staffName}</strong>
                          <span className="font-mono text-[10px] text-primary-600 uppercase font-bold">{sh.role}</span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{sh.department}</div>
                          <div className="text-[10px] text-slate-400">{sh.sector}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{sh.shiftType} Shift</div>
                          <div className="text-[10px] font-mono text-slate-400">{sh.date}</div>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-700">
                          {sh.startTime} → {sh.endTime}
                        </td>
                        <td className="p-3.5 text-slate-700">
                          {sh.assignedLocation}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sh.status === 'Ongoing' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {sh.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 8: STAFF ATTENDANCE & LOGIN LOGS */}
        {activeTab === 'attendance' && (
          <motion.div key="attendance" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-extrabold text-slate-900 text-base">Hospital Staff Attendance & Login Audit Logs</h3>
                <p className="text-xs text-slate-400">Cryptographically recorded check-ins, check-outs, and late login tracking</p>
              </div>

              <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setAttendanceRoleTab('nurse')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    attendanceRoleTab === 'nurse' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Nurses Attendance
                </button>
                <button
                  onClick={() => setAttendanceRoleTab('doctor')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    attendanceRoleTab === 'doctor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Doctors Attendance
                </button>
              </div>
            </div>

            <div className="glass-card overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="p-3.5">Staff Name</th>
                      <th className="p-3.5">Department & Sector</th>
                      <th className="p-3.5">Shift & Date</th>
                      <th className="p-3.5">Scheduled Window</th>
                      <th className="p-3.5">Actual Login / Logout</th>
                      <th className="p-3.5">Late Flag</th>
                      <th className="p-3.5">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAttendance.map(att => (
                      <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <strong className="text-slate-900 font-bold text-xs">{att.staffName}</strong>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{att.department}</div>
                          <div className="text-[10px] text-slate-400">{att.sector}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{att.shift}</div>
                          <div className="text-[10px] font-mono text-slate-400">{att.date}</div>
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-700">
                          {att.scheduledStart} – {att.scheduledEnd}
                        </td>
                        <td className="p-3.5 font-mono text-[11px]">
                          <span className="text-slate-800 font-bold">{att.actualLogin || '—'}</span>
                          {att.actualLogout && <span className="text-slate-400"> → {att.actualLogout}</span>}
                          {att.totalHours && <div className="text-[10px] text-slate-400">Total: {att.totalHours}</div>}
                        </td>
                        <td className="p-3.5">
                          {att.isLate ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800">
                              Late ({att.lateMinutes} mins)
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-bold text-[10px]">On Time</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            att.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                            att.status === 'Late' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {att.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 9: HOSPITAL ACTIVITY */}
        {activeTab === 'activity' && (
          <motion.div key="activity" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-extrabold text-slate-900 text-base">Complete Hospital Activity Audit Trail</h3>
                <p className="text-xs text-slate-400">Live immutable stream of staff actions, nurse logins, med administration, and patient events</p>
              </div>
              <span className="badge-success text-xs font-bold">Audit Chain Active</span>
            </div>

            <div className="glass-card p-5 space-y-3">
              {activityLogs.map(log => (
                <div key={log.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-3">
                    <span className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                      log.type === 'danger' ? 'bg-rose-600 animate-pulse' :
                      log.type === 'warning' ? 'bg-amber-500' :
                      log.type === 'success' ? 'bg-emerald-600' : 'bg-primary-600'
                    }`} />
                    <div>
                      <p className="font-extrabold text-slate-900 text-sm leading-snug">{log.action}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span>User: <strong>{log.user}</strong></span>
                        <span>•</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">{log.role}</span>
                        <span>•</span>
                        <span>Location: {log.location}</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400 shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 1: DOCTOR PROFILE DRAWER */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 p-6 overflow-y-auto text-xs space-y-5 text-slate-800"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold font-display text-base">
                      {selectedDoctor.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-slate-900 text-base">{selectedDoctor.name}</h3>
                      <p className="text-slate-400 font-mono">{selectedDoctor.doctorId} · {selectedDoctor.qualification}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedDoctor(null)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4 pt-4">
                  {/* Status Toggle Bar */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Current Doctor Status</span>
                      <div className="font-extrabold text-slate-900">{selectedDoctor.status}</div>
                    </div>
                    <div className="flex gap-1">
                      {(['Available', 'In Consultation', 'On Break', 'Off Duty'] as DoctorStatus[]).map(st => (
                        <button
                          key={st}
                          onClick={() => setDoctorStatus(selectedDoctor.id, st)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            selectedDoctor.status === st ? 'bg-primary-600 text-white' : 'bg-white border text-slate-600'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs">Professional Credentials</h4>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>Specialization: <strong className="block text-slate-800">{selectedDoctor.specialization}</strong></div>
                      <div>Department: <strong className="block text-slate-800">{selectedDoctor.department}</strong></div>
                      <div>Sector/Ward: <strong className="block text-slate-800">{selectedDoctor.sector} (Floor {selectedDoctor.floor})</strong></div>
                      <div>Experience: <strong className="block text-slate-800">{selectedDoctor.experienceYears} Years</strong></div>
                      <div>Contact Phone: <strong className="block text-primary-600">{selectedDoctor.phone}</strong></div>
                      <div>Email: <strong className="block text-slate-800">{selectedDoctor.email}</strong></div>
                    </div>
                  </div>

                  {/* Assigned Inpatients */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center justify-between">
                      <span>Assigned Patients ({selectedDoctor.assignedPatients.length})</span>
                    </h4>
                    <div className="space-y-1.5">
                      {selectedDoctor.assignedPatients.map(pat => (
                        <div key={pat.id} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <strong className="text-slate-900">{pat.name}</strong>
                            <span className="text-[10px] text-slate-400 ml-2">Bed {pat.bed}</span>
                          </div>
                          <span className="badge-success text-[10px]">{pat.condition}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Today's Appointments */}
                  {selectedDoctor.todayAppointments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-900 text-xs">Today's Scheduled Rounds & Consultations</h4>
                      <div className="space-y-1.5">
                        {selectedDoctor.todayAppointments.map(app => (
                          <div key={app.id} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                            <div>
                              <strong className="text-slate-900">{app.type}</strong>
                              <p className="text-[10px] text-slate-400">{app.patientName} · {app.time}</p>
                            </div>
                            <span className="badge-info text-[10px]">{app.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button onClick={() => setSelectedDoctor(null)} className="btn-secondary text-xs flex-1">
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: NURSE PROFILE DRAWER */}
      <AnimatePresence>
        {selectedNurse && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 p-6 overflow-y-auto text-xs space-y-5 text-slate-800"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold font-display text-base">
                      {selectedNurse.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-slate-900 text-base">{selectedNurse.name}</h3>
                      <p className="text-slate-400 font-mono">{selectedNurse.nurseId} · {selectedNurse.qualification}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedNurse(null)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4 pt-4">
                  {/* Status Toggle Bar */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Duty Status</span>
                      <div className="font-extrabold text-slate-900">{selectedNurse.status}</div>
                    </div>
                    <div className="flex gap-1">
                      {(['On Duty', 'On Break', 'Off Duty', 'On Leave'] as NurseStatus[]).map(st => (
                        <button
                          key={st}
                          onClick={() => setNurseStatus(selectedNurse.id, st)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            selectedNurse.status === st ? 'bg-teal-600 text-white' : 'bg-white border text-slate-600'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Work Assignment */}
                  <div className="p-4 bg-teal-50/50 border border-teal-200/80 rounded-2xl space-y-2">
                    <h4 className="font-extrabold text-teal-950 text-xs">Assigned Working Area</h4>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>Department: <strong className="block text-slate-900">{selectedNurse.department}</strong></div>
                      <div>Sector / Floor: <strong className="block text-slate-900">{selectedNurse.sector} · Floor {selectedNurse.floor}</strong></div>
                      <div>Supervising Doctor: <strong className="block text-slate-900">{selectedNurse.assignedDoctor}</strong></div>
                      <div>Assigned Beds: <strong className="block text-slate-900 font-mono">{selectedNurse.assignedBeds.join(', ')}</strong></div>
                    </div>
                  </div>

                  {/* Today's Shift & Login */}
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs">Today's Shift Timing & Login</h4>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>Scheduled Shift: <strong className="block text-slate-800">{selectedNurse.currentShift} ({selectedNurse.shiftStart} – {selectedNurse.shiftEnd})</strong></div>
                      <div>Actual Login Time: <strong className="block text-primary-600 font-mono font-bold">{selectedNurse.todayLogin || 'Not logged in yet'}</strong></div>
                      <div>Late Status: <strong className="block">{selectedNurse.isLate ? `Late by ${selectedNurse.lateMinutes} mins` : 'On Time'}</strong></div>
                      <div>Experience: <strong className="block text-slate-800">{selectedNurse.experienceYears} Years</strong></div>
                    </div>
                  </div>

                  {/* Assigned Inpatients */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs">Assigned Inpatients ({selectedNurse.assignedPatients.length})</h4>
                    <div className="space-y-1.5">
                      {selectedNurse.assignedPatients.map(pat => (
                        <div key={pat.id} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <strong className="text-slate-900">{pat.name}</strong>
                            <span className="text-[10px] text-slate-400 ml-2">Bed {pat.bed}</span>
                          </div>
                          <span className="badge-success text-[10px]">{pat.condition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button onClick={() => setSelectedNurse(null)} className="btn-secondary text-xs flex-1">
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: ASSIGN SHIFT MODAL */}
      <AnimatePresence>
        {showAssignShiftModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display font-extrabold text-slate-900 text-base">Assign Staff Shift</h3>
                <button onClick={() => setShowAssignShiftModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateShift} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Role</label>
                    <select
                      value={newShiftRole}
                      onChange={e => setNewShiftRole(e.target.value as 'doctor' | 'nurse')}
                      className="input-field text-xs font-semibold"
                    >
                      <option value="nurse">Nurse</option>
                      <option value="doctor">Doctor</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Staff Member</label>
                    <select
                      value={newShiftStaffName}
                      onChange={e => setNewShiftStaffName(e.target.value)}
                      className="input-field text-xs font-semibold"
                    >
                      {newShiftRole === 'nurse'
                        ? nurses.map(n => <option key={n.id} value={n.name}>{n.name}</option>)
                        : doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)
                      }
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Department</label>
                    <input
                      type="text"
                      value={newShiftDept}
                      onChange={e => setNewShiftDept(e.target.value)}
                      className="input-field text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Sector / Ward</label>
                    <input
                      type="text"
                      value={newShiftSector}
                      onChange={e => setNewShiftSector(e.target.value)}
                      className="input-field text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Shift Type</label>
                    <select
                      value={newShiftType}
                      onChange={e => setNewShiftType(e.target.value as ShiftType)}
                      className="input-field text-xs font-semibold"
                    >
                      <option value="Morning">Morning (06:00 AM – 02:00 PM)</option>
                      <option value="Evening">Evening (02:00 PM – 10:00 PM)</option>
                      <option value="Night">Night (10:00 PM – 06:00 AM)</option>
                      <option value="Custom">Custom Shift</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Assigned Location</label>
                    <input
                      type="text"
                      value={newShiftLocation}
                      onChange={e => setNewShiftLocation(e.target.value)}
                      className="input-field text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowAssignShiftModal(false)} className="btn-secondary text-xs flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs flex-1 justify-center">
                    Confirm & Schedule Shift
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: BED STATUS CHANGER MODAL */}
      <AnimatePresence>
        {showBedStatusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display font-extrabold text-slate-900 text-base">
                  Update Bed {showBedStatusModal.bedNumber} Status
                </h3>
                <button onClick={() => setShowBedStatusModal(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              <p className="text-slate-500">
                Location: {showBedStatusModal.department} · {showBedStatusModal.sector} (Floor {showBedStatusModal.floor})
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {(['Available', 'Occupied', 'Cleaning', 'Reserved', 'Maintenance'] as BedStatus[]).map(st => (
                  <button
                    key={st}
                    onClick={() => handleUpdateBed(st)}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center transition-all ${
                      showBedStatusModal.status === st
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: COMPLETE PATIENT MEDICAL PROFILE MODAL */}
      <AnimatePresence>
        {showPatientMedicalProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] overflow-y-auto p-4 relative my-auto"
            >
              <div className="sticky top-0 z-20 flex items-center justify-between bg-slate-50/90 backdrop-blur-md p-2 border-b border-slate-200 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Switch Inpatient Record:</span>
                  <select
                    value={selectedPatient?.id || 'p001'}
                    onChange={(e) => {
                      const found = patients.find(p => p.id === e.target.value);
                      if (found) setSelectedPatient(found);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 outline-none"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.bedNumber} · {p.bloodGroup} · {p.condition})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setShowPatientMedicalProfile(false)}
                  className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-md"
                >
                  <X size={18} />
                </button>
              </div>
              <MedicalProfileModule patientId={selectedPatient?.id || 'p001'} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
