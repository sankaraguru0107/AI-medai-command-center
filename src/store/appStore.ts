import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'operations' | 'patient';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  patient_id?: string;
  patient_name?: string;
  timestamp: Date;
  resolved: boolean;
  category: string;
}

export interface Notification {
  id: string;
  type: 'alert' | 'message' | 'update' | 'ai';
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeDashboard: string;
  setActiveDashboard: (dashboard: string) => void;
  activeModule: string;
  setActiveModule: (module: string) => void;

  // Alerts
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  resolveAlert: (id: string) => void;
  unreadAlertCount: number;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadNotificationCount: number;

  // AI Assistant
  aiPanelOpen: boolean;
  setAIPanelOpen: (open: boolean) => void;
  aiContext: string;
  setAIContext: (context: string) => void;

  // Demo mode (when no real credentials configured)
  demoMode: boolean;
  setDemoMode: (demo: boolean) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Auth
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),

      // UI
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      activeDashboard: 'overview',
      setActiveDashboard: (dashboard) => set({ activeDashboard: dashboard }),
      activeModule: '',
      setActiveModule: (module) => set({ activeModule: module }),

      // Alerts
      alerts: [],
      setAlerts: (alerts) => set({ alerts, unreadAlertCount: alerts.filter(a => !a.resolved).length }),
      addAlert: (alert) => set(state => ({
        alerts: [alert, ...state.alerts],
        unreadAlertCount: state.unreadAlertCount + (alert.resolved ? 0 : 1),
      })),
      resolveAlert: (id) => set(state => ({
        alerts: state.alerts.map(a => a.id === id ? { ...a, resolved: true } : a),
        unreadAlertCount: Math.max(0, state.unreadAlertCount - 1),
      })),
      unreadAlertCount: 0,

      // Notifications
      notifications: [],
      addNotification: (notification) => set(state => ({
        notifications: [notification, ...state.notifications.slice(0, 49)],
        unreadNotificationCount: state.unreadNotificationCount + (notification.read ? 0 : 1),
      })),
      markNotificationRead: (id) => set(state => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
        unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1),
      })),
      markAllNotificationsRead: () => set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadNotificationCount: 0,
      })),
      unreadNotificationCount: 0,

      // AI
      aiPanelOpen: false,
      setAIPanelOpen: (open) => set({ aiPanelOpen: open }),
      aiContext: 'clinical',
      setAIContext: (context) => set({ aiContext: context }),

      // Demo
      demoMode: true,
      setDemoMode: (demo) => set({ demoMode: demo }),
    }),
    { name: 'medai-store' }
  )
);

// Demo data generator for realistic UI
export const generateDemoAlerts = (): Alert[] => [
  {
    id: '1',
    type: 'critical',
    title: 'Critical Vitals — Bed 4B',
    message: 'SpO2 dropped to 87%. Immediate intervention required.',
    patient_id: 'p001',
    patient_name: 'James Wilson',
    timestamp: new Date(Date.now() - 2 * 60000),
    resolved: false,
    category: 'vitals',
  },
  {
    id: '2',
    type: 'warning',
    title: 'Medication Delay Alert',
    message: 'Insulin dose for Patient Chen overdue by 2 hours.',
    patient_id: 'p002',
    patient_name: 'Sarah Chen',
    timestamp: new Date(Date.now() - 15 * 60000),
    resolved: false,
    category: 'medication',
  },
  {
    id: '3',
    type: 'warning',
    title: 'Prior Auth Expiring',
    message: 'Authorization for MRI — Patient Rivera expires in 24h.',
    patient_id: 'p003',
    patient_name: 'Maria Rivera',
    timestamp: new Date(Date.now() - 30 * 60000),
    resolved: false,
    category: 'rcm',
  },
  {
    id: '4',
    type: 'critical',
    title: 'Drug Interaction Detected',
    message: 'Warfarin + Amoxicillin co-prescription — elevated bleeding risk.',
    patient_id: 'p004',
    patient_name: 'Robert Kim',
    timestamp: new Date(Date.now() - 45 * 60000),
    resolved: false,
    category: 'medication',
  },
  {
    id: '5',
    type: 'info',
    title: 'Security: Unusual Login',
    message: 'Login from unrecognized IP: 203.0.113.42 — EHR access.',
    timestamp: new Date(Date.now() - 60 * 60000),
    resolved: false,
    category: 'security',
  },
  {
    id: '6',
    type: 'warning',
    title: 'Bed Capacity: ICU 92%',
    message: 'ICU approaching capacity. Diversion protocols may activate.',
    timestamp: new Date(Date.now() - 90 * 60000),
    resolved: false,
    category: 'operations',
  },
];

export const generateDemoUser = (role: UserRole): User => {
  const users: Record<UserRole, User> = {
    admin: { id: 'u1', email: 'admin@medai.health', name: 'Admin Singh', role: 'admin', department: 'Hospital Administration' },
    doctor: { id: 'doc-1', email: 'doctor@medai.health', name: 'Dr. Emily Chen, MD', role: 'doctor', department: 'Critical Care (ICU)' },
    nurse: { id: 'nur-1', email: 'nurse@medai.health', name: 'Nurse Sarah Jenkins', role: 'nurse', department: 'Critical Care (ICU)' },
    operations: { id: 'u4', email: 'ops@medai.health', name: 'Mark Thompson', role: 'operations', department: 'Operations' },
    patient: { id: 'p001', email: 'patient@medai.health', name: 'James Wilson', role: 'patient' },
  };
  return users[role];
};
