import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface HackathonUser {
  email: string;
  name: string;
  role: string;
  organization: string;
  avatar?: string;
}

export interface SimulationStep {
  step: number;
  title: string;
  description: string;
  impactAlert?: string;
  resilienceScore: number;
  activeRiskCount: number;
  highlightedFacilityId?: string;
}

export interface HackathonAlert {
  id: string;
  severity: 'Critical' | 'Warning' | 'Info';
  title: string;
  location: string;
  facilityId: string;
  predictedTimeframe: string;
  confidence: number;
  recommendedAction: string;
  metricLabel: string;
  metricValue: string;
  category: 'Medicine' | 'ICU' | 'Workforce' | 'Oxygen' | 'Supply Chain';
  resolved?: boolean;
}

export interface HackathonRedistributionPlan {
  id: string;
  item: string;
  fromFacility: string;
  toFacility: string;
  quantity: number;
  unit: string;
  distanceKm: number;
  transportEta: string;
  impactPoints: string[];
  status: 'Pending' | 'Approved' | 'In Transit' | 'Rejected';
}

interface HackathonState {
  // Authentication
  isHackathonAuthenticated: boolean;
  hackathonUser: HackathonUser | null;
  loginHackathon: (email?: string, role?: string) => void;
  logoutHackathon: () => void;

  // Active Navigation Tab
  activeRoute: string;
  setActiveRoute: (route: string) => void;

  // Simulation Engine
  isSimulating: boolean;
  simulationStep: number;
  simulationHistory: string[];
  runSimulation: () => void;
  resetSimulation: () => void;
  setSimulationStep: (step: number) => void;

  // Dashboard Data State
  nationalResilienceScore: number;
  facilitiesCount: number;
  bedAvailabilityPercent: number;
  medicineAvailabilityPercent: number;
  staffAvailabilityPercent: number;

  // Interactive Stock-Out Card & Redistribution
  stockOutPrediction: {
    drugName: string;
    facilityCode: string;
    facilityName: string;
    currentStock: number;
    dailyConsumption: number;
    expectedShortage: number;
    daysToShortage: number;
    aiConfidence: number;
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    reasons: string[];
  };

  redistributionPlan: HackathonRedistributionPlan;
  approveRedistribution: () => void;
  rejectRedistribution: () => void;

  // Alerts
  alerts: HackathonAlert[];
  dismissAlert: (id: string) => void;
  
  // Quick Notifications / Toasts
  notifications: { id: string; type: 'info' | 'warning' | 'success' | 'critical'; title: string; message: string; timestamp: Date }[];
  addToastNotification: (title: string, message: string, type?: 'info' | 'warning' | 'success' | 'critical') => void;
  removeToastNotification: (id: string) => void;
}

export const useHackathonStore = create<HackathonState>()(
  devtools(
    persist(
      (set, get) => ({
        // Auth state
        isHackathonAuthenticated: false,
        hackathonUser: null,

        loginHackathon: (email = 'hackathon@medresilience.ai', role = 'Hackathon Evaluator') => {
          set({
            isHackathonAuthenticated: true,
            hackathonUser: {
              email,
              name: 'Hackathon Evaluator',
              role,
              organization: 'National Health Resilience Command Center',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            },
          });
        },

        logoutHackathon: () => {
          set({
            isHackathonAuthenticated: false,
            hackathonUser: null,
          });
        },

        // Navigation
        activeRoute: '/hackathon/dashboard',
        setActiveRoute: (route: string) => set({ activeRoute: route }),

        // Metrics
        nationalResilienceScore: 87,
        facilitiesCount: 2438,
        bedAvailabilityPercent: 72,
        medicineAvailabilityPercent: 84,
        staffAvailabilityPercent: 91,

        // Stock-out details
        stockOutPrediction: {
          drugName: 'Ceftriaxone 1g Injectable',
          facilityCode: 'PHC-024',
          facilityName: 'Primary Health Centre - Valparai (PHC-024)',
          currentStock: 340,
          dailyConsumption: 85,
          expectedShortage: 180,
          daysToShortage: 4,
          aiConfidence: 91,
          riskLevel: 'CRITICAL',
          reasons: [
            'Patient admissions increased 18% in last 48 hours',
            'Antibiotic consumption increased 22%',
            'Regional inventory decreased 12%',
            'Incoming supply shipment delayed by 3 days',
          ],
        },

        // Redistribution
        redistributionPlan: {
          id: 'RED-TN-9921',
          item: '500 units of Ceftriaxone 1g Injectable',
          fromFacility: 'District Hospital Coimbatore B',
          toFacility: 'Primary Health Centre Valparai (PHC-024)',
          quantity: 500,
          unit: 'vials',
          distanceKm: 42,
          transportEta: '1h 15m (EV Medical Fleet)',
          impactPoints: [
            '✓ Prevent predicted 180-unit deficit at PHC-024',
            '✓ Maintain safety buffer of 14 days',
            '✓ Reduce emergency procurement cost by ₹1,45,000',
          ],
          status: 'Pending',
        },

        approveRedistribution: () => {
          const isAlreadyApproved = get().redistributionPlan.status === 'Approved';
          set((state) => ({
            redistributionPlan: { ...state.redistributionPlan, status: 'Approved' },
            nationalResilienceScore: Math.min(100, isAlreadyApproved ? state.nationalResilienceScore : state.nationalResilienceScore + 5),
            medicineAvailabilityPercent: Math.min(100, isAlreadyApproved ? state.medicineAvailabilityPercent : state.medicineAvailabilityPercent + 6),
          }));
          get().addToastNotification(
            isAlreadyApproved ? 'Fleet Re-Dispatched' : 'Transfer Request Approved & Dispatched',
            'EV Medical Fleet dispatched: 500 units Ceftriaxone to PHC-024. ETA 1h 15m (Tracked in real-time).',
            'success'
          );
        },

        rejectRedistribution: () => {
          set((state) => ({
            redistributionPlan: { ...state.redistributionPlan, status: 'Pending' },
          }));
          get().addToastNotification('Transfer Reset to Pending', 'Resource plan reset. AI optimization re-enabled.', 'info');
        },

        // Alerts
        alerts: [
          {
            id: 'alt-1',
            severity: 'Critical',
            title: 'Critical Medicine Shortage',
            location: '17 PHCs in Coimbatore & Tiruppur Districts',
            facilityId: 'PHC-024',
            predictedTimeframe: 'Within 7 days (4 days peak)',
            confidence: 94,
            recommendedAction: 'Execute cross-district redistribution from District Hospital B',
            metricLabel: 'Predicted Deficit',
            metricValue: '-1,420 Vials',
            category: 'Medicine',
          },
          {
            id: 'alt-2',
            severity: 'Warning',
            title: 'ICU Capacity Pressure',
            location: '8 Districts in Western Tamil Nadu & North Kerala',
            facilityId: 'GH-MDU-01',
            predictedTimeframe: 'Next 48 to 72 hours',
            confidence: 89,
            recommendedAction: 'Re-route non-critical ICU transfers to Tertiary Care Hub C',
            metricLabel: 'ICU Occupancy',
            metricValue: '93.4%',
            category: 'ICU',
          },
          {
            id: 'alt-3',
            severity: 'Warning',
            title: 'Workforce Staffing Risk',
            location: '12 Primary Health Centres in Nilgiris Tribal Belt',
            facilityId: 'PHC-NLG-05',
            predictedTimeframe: 'Weekend Shift (48 hours)',
            confidence: 86,
            recommendedAction: 'Deploy 4 rotational medical officers via Tele-ICU support',
            metricLabel: 'Physician Deficit',
            metricValue: '-6 Doctors',
            category: 'Workforce',
          },
        ],

        dismissAlert: (id) =>
          set((state) => ({
            alerts: state.alerts.filter((a) => a.id !== id),
          })),

        // Notifications
        notifications: [],
        addToastNotification: (title, message, type = 'info') => {
          const id = 'toast-' + Date.now() + Math.random().toString(36).substr(2, 4);
          const newNotif = { id, title, message, type, timestamp: new Date() };
          set((state) => ({
            notifications: [newNotif, ...state.notifications],
          }));
          setTimeout(() => {
            get().removeToastNotification(id);
          }, 6000);
        },
        removeToastNotification: (id) =>
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          })),

        // Interactive Simulation
        isSimulating: false,
        simulationStep: 0,
        simulationHistory: [],

        runSimulation: () => {
          set({ isSimulating: true, simulationStep: 1 });
          get().addToastNotification('Simulation Started', 'Initiating step-by-step emergency demand simulation...', 'info');

          // Step 1: Normal Operations
          setTimeout(() => {
            set({ simulationStep: 1, nationalResilienceScore: 87, bedAvailabilityPercent: 72, medicineAvailabilityPercent: 84 });
            get().addToastNotification('Phase 1: Baseline', 'Normal operations across 2,438 facilities.', 'info');
          }, 500);

          // Step 2: Patient Demand Increases
          setTimeout(() => {
            set({ simulationStep: 2, bedAvailabilityPercent: 64, nationalResilienceScore: 81 });
            get().addToastNotification('Phase 2: Surge Warning', 'Monsoon fever surge detected (+35% emergency admissions).', 'warning');
          }, 3000);

          // Step 3: Medicine Consumption Spikes
          setTimeout(() => {
            set({ simulationStep: 3, medicineAvailabilityPercent: 68 });
            get().addToastNotification('Phase 3: Inventory Depletion', 'Ceftriaxone daily consumption spiked from 85 to 160 units.', 'warning');
          }, 6000);

          // Step 4: AI Detects Risk
          setTimeout(() => {
            set({ simulationStep: 4, nationalResilienceScore: 74 });
            get().addToastNotification('Phase 4: AI Early Warning', 'Machine Learning model flagged stock-out risk at 91% confidence.', 'critical');
          }, 9000);

          // Step 5: Shortage Predicted
          setTimeout(() => {
            set({ simulationStep: 5 });
            get().addToastNotification('Phase 5: Shortage Forecast', 'Ceftriaxone shortage predicted at PHC-024 in 4 days.', 'critical');
          }, 12000);

          // Step 6: Critical Alert Issued
          setTimeout(() => {
            set({ simulationStep: 6 });
            get().addToastNotification('Phase 6: Escalation', 'System dispatched critical alert to Regional Command Hub.', 'critical');
          }, 15000);

          // Step 7: AI Generates Redistribution Plan
          setTimeout(() => {
            set({ simulationStep: 7 });
            get().addToastNotification('Phase 7: Optimization Plan', 'AI generated transfer plan: 500 units from District Hospital B.', 'info');
          }, 18000);

          // Step 8: Admin Approves Transfer
          setTimeout(() => {
            set((state) => ({
              simulationStep: 8,
              redistributionPlan: { ...state.redistributionPlan, status: 'Approved' },
            }));
            get().addToastNotification('Phase 8: Action Executed', 'Transfer approved by Command Center Officer.', 'success');
          }, 21000);

          // Step 9: Resilience Score Restored
          setTimeout(() => {
            set({
              simulationStep: 9,
              isSimulating: false,
              nationalResilienceScore: 92,
              medicineAvailabilityPercent: 90,
              bedAvailabilityPercent: 78,
            });
            get().addToastNotification('Phase 9: Resilience Restored', 'Shortage risk mitigated! National Resilience Score improved to 92/100.', 'success');
          }, 24000);
        },

        resetSimulation: () => {
          set({
            isSimulating: false,
            simulationStep: 0,
            nationalResilienceScore: 87,
            bedAvailabilityPercent: 72,
            medicineAvailabilityPercent: 84,
            staffAvailabilityPercent: 91,
            redistributionPlan: {
              id: 'RED-TN-9921',
              item: '500 units of Ceftriaxone 1g Injectable',
              fromFacility: 'District Hospital Coimbatore B',
              toFacility: 'Primary Health Centre Valparai (PHC-024)',
              quantity: 500,
              unit: 'vials',
              distanceKm: 42,
              transportEta: '1h 15m (EV Medical Fleet)',
              impactPoints: [
                '✓ Prevent predicted 180-unit deficit at PHC-024',
                '✓ Maintain safety buffer of 14 days',
                '✓ Reduce emergency procurement cost by ₹1,45,000',
              ],
              status: 'Pending',
            },
          });
          get().addToastNotification('Simulation Reset', 'Metrics and predictions restored to baseline.', 'info');
        },

        setSimulationStep: (step: number) => set({ simulationStep: step }),
      }),
      {
        name: 'medresilience-hackathon-storage',
      }
    )
  )
);
