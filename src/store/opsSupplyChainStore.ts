import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  FacilityNode, DistrictAggregate, StateAggregate, InventoryItem, MedicineItem,
  OxygenUnit, EquipmentItem, ConsumableItem, BloodSupplyItem, ShipmentItem,
  SupplierItem, StockOutPrediction, ResourceTransfer, DoctorRecord, NurseRecord,
  StaffingRiskRecord, ActiveIncident, OperationalFeedEvent, AlertIncident,
  DemandForecastPoint, AIOperationalInsight, TransferStatus, FacilityStatus, ResourceRisk
} from '../types/opsSupplyChain';

interface OpsSupplyChainState {
  // Facilities & Aggregates
  facilities: FacilityNode[];
  selectedFacility: FacilityNode | null;
  setSelectedFacility: (facility: FacilityNode | null) => void;
  districts: DistrictAggregate[];
  states: StateAggregate[];

  // Inventory Ledgers
  inventoryItems: InventoryItem[];
  medicines: MedicineItem[];
  oxygenUnits: OxygenUnit[];
  equipmentItems: EquipmentItem[];
  consumables: ConsumableItem[];
  bloodSupplies: BloodSupplyItem[];

  // Logistics
  shipments: ShipmentItem[];
  suppliers: SupplierItem[];

  // Workforce
  doctors: DoctorRecord[];
  nurses: NurseRecord[];
  staffingRisks: StaffingRiskRecord[];

  // Emergency & Alerts
  activeIncidents: ActiveIncident[];
  alerts: AlertIncident[];
  feedEvents: OperationalFeedEvent[];

  // Intelligence & Forecasting
  forecastTimeframe: '24 HOURS' | '7 DAYS' | '30 DAYS';
  setForecastTimeframe: (tf: '24 HOURS' | '7 DAYS' | '30 DAYS') => void;
  forecastData: DemandForecastPoint[];
  stockOutPredictions: StockOutPrediction[];
  transfers: ResourceTransfer[];
  aiInsights: AIOperationalInsight[];

  // Emergency State
  isEmergencyMode: boolean;
  toggleEmergencyMode: () => void;

  // 18-Step Interactive Demo Scenario State
  isDemoScenarioRunning: boolean;
  demoStepIndex: number;
  demoLog: string[];
  runDemoScenario: () => void;
  resetDemoScenario: () => void;

  // Reactive Actions
  acceptTransferRecommendation: (predictionId: string) => void;
  updateTransferStatus: (transferId: string, newStatus: TransferStatus) => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
}

// Multi-Hospital Facility Network Dataset
const initialFacilities: FacilityNode[] = [
  {
    id: 'fac-cbe-021',
    code: 'PHC-CBE-021',
    name: 'PHC Coimbatore-021',
    type: 'Primary Health Center (PHC)',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    lat: 11.0168,
    lng: 76.9558,
    xPercent: 32,
    yPercent: 48,
    status: 'Critical',
    online: true,
    totalBeds: 45,
    occupiedBeds: 42,
    availableBeds: 3,
    icuTotal: 8,
    icuOccupied: 7,
    icuAvailable: 1,
    emergencyTotal: 10,
    emergencyOccupied: 9,
    emergencyWaiting: 4,
    oxygenStockLiters: 180,
    oxygenDaysRemaining: 1.7,
    medicineStockStatus: 'Critical',
    availableDoctors: 3,
    availableNurses: 8,
    patientLoad: 92,
    todayAdmissions: 28,
    todayDischarges: 12,
    emergencyCount: 14,
    aiRiskScore: 88,
    aiRecommendations: [
      '🚨 CRITICAL: Oxygen stock predicted to deplete in 1.7 days due to 23% surge in respiratory admissions.',
      'Request immediate transfer of 20 Oxygen Concentrators from PHC Salem-008 (Surplus: 45 units).',
      'Deploy 2 additional triage nurses to manage emergency intake queue.',
    ],
    lastSync: '12 seconds ago',
  },
  {
    id: 'fac-slm-008',
    code: 'PHC-SLM-008',
    name: 'PHC Salem-008',
    type: 'Primary Health Center (PHC)',
    district: 'Salem',
    state: 'Tamil Nadu',
    lat: 11.6643,
    lng: 78.146,
    xPercent: 54,
    yPercent: 38,
    status: 'Healthy',
    online: true,
    totalBeds: 60,
    occupiedBeds: 32,
    availableBeds: 28,
    icuTotal: 10,
    icuOccupied: 4,
    icuAvailable: 6,
    emergencyTotal: 12,
    emergencyOccupied: 4,
    emergencyWaiting: 0,
    oxygenStockLiters: 920,
    oxygenDaysRemaining: 14.5,
    medicineStockStatus: 'Healthy',
    availableDoctors: 6,
    availableNurses: 14,
    patientLoad: 48,
    todayAdmissions: 8,
    todayDischarges: 14,
    emergencyCount: 3,
    aiRiskScore: 18,
    aiRecommendations: [
      '✓ Surplus oxygen inventory detected (14.5 days operational buffer).',
      'Recommended source facility for emergency transfer to PHC Coimbatore-021 (Distance: 162 km · ETA 2h 15m).',
    ],
    lastSync: '5 seconds ago',
  },
  {
    id: 'fac-mdu-014',
    code: 'PHC-MDU-014',
    name: 'PHC Madurai-014',
    type: 'Primary Health Center (PHC)',
    district: 'Madurai',
    state: 'Tamil Nadu',
    lat: 9.9252,
    lng: 78.1198,
    xPercent: 48,
    yPercent: 68,
    status: 'High Load',
    online: true,
    totalBeds: 50,
    occupiedBeds: 45,
    availableBeds: 5,
    icuTotal: 8,
    icuOccupied: 7,
    icuAvailable: 1,
    emergencyTotal: 10,
    emergencyOccupied: 8,
    emergencyWaiting: 2,
    oxygenStockLiters: 410,
    oxygenDaysRemaining: 3.2,
    medicineStockStatus: 'Low',
    availableDoctors: 4,
    availableNurses: 9,
    patientLoad: 78,
    todayAdmissions: 19,
    todayDischarges: 10,
    emergencyCount: 9,
    aiRiskScore: 68,
    aiRecommendations: [
      '⚠️ Bed occupancy at 90%. Monitor step-down discharges.',
      'Reorder IV Saline solution (3.2 days remaining).',
    ],
    lastSync: '22 seconds ago',
  },
  {
    id: 'fac-stj-chn',
    code: 'HOSP-CHE-001',
    name: 'St. Jude Memorial Health System',
    type: 'Tertiary Hospital',
    district: 'Chennai',
    state: 'Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707,
    xPercent: 82,
    yPercent: 22,
    status: 'Healthy',
    online: true,
    totalBeds: 450,
    occupiedBeds: 372,
    availableBeds: 78,
    icuTotal: 50,
    icuOccupied: 41,
    icuAvailable: 9,
    emergencyTotal: 40,
    emergencyOccupied: 28,
    emergencyWaiting: 3,
    oxygenStockLiters: 5800,
    oxygenDaysRemaining: 18.0,
    medicineStockStatus: 'Healthy',
    availableDoctors: 42,
    availableNurses: 86,
    patientLoad: 318,
    todayAdmissions: 42,
    todayDischarges: 38,
    emergencyCount: 18,
    aiRiskScore: 22,
    aiRecommendations: [
      '✓ Major regional hub operating at optimal resilience.',
      'Surplus blood bank reserves (O- & A+) available for regional dispatch.',
    ],
    lastSync: '1 second ago',
  },
  {
    id: 'fac-apl-chn',
    code: 'HOSP-CHE-002',
    name: 'Apollo Specialty Medical Center',
    type: 'Tertiary Hospital',
    district: 'Chennai',
    state: 'Tamil Nadu',
    lat: 13.06,
    lng: 80.25,
    xPercent: 85,
    yPercent: 26,
    status: 'Healthy',
    online: true,
    totalBeds: 380,
    occupiedBeds: 298,
    availableBeds: 82,
    icuTotal: 40,
    icuOccupied: 30,
    icuAvailable: 10,
    emergencyTotal: 30,
    emergencyOccupied: 18,
    emergencyWaiting: 1,
    oxygenStockLiters: 4900,
    oxygenDaysRemaining: 21.0,
    medicineStockStatus: 'Healthy',
    availableDoctors: 38,
    availableNurses: 74,
    patientLoad: 270,
    todayAdmissions: 31,
    todayDischarges: 29,
    emergencyCount: 12,
    aiRiskScore: 15,
    aiRecommendations: ['✓ Central diagnostic PACS and AI triage online.'],
    lastSync: '3 seconds ago',
  },
];

const initialDistricts: DistrictAggregate[] = [
  { id: 'dist-cbe', name: 'Coimbatore', state: 'Tamil Nadu', facilityCount: 18, totalBeds: 620, occupiedBeds: 540, icuTotal: 65, icuOccupied: 58, oxygenDaysAvg: 4.1, riskStatus: 'High Load', resilienceScore: 74 },
  { id: 'dist-slm', name: 'Salem', state: 'Tamil Nadu', facilityCount: 14, totalBeds: 480, occupiedBeds: 310, icuTotal: 42, icuOccupied: 24, oxygenDaysAvg: 12.8, riskStatus: 'Healthy', resilienceScore: 92 },
  { id: 'dist-mdu', name: 'Madurai', state: 'Tamil Nadu', facilityCount: 16, totalBeds: 540, occupiedBeds: 460, icuTotal: 50, icuOccupied: 43, oxygenDaysAvg: 5.2, riskStatus: 'Warning', resilienceScore: 81 },
  { id: 'dist-che', name: 'Chennai', state: 'Tamil Nadu', facilityCount: 42, totalBeds: 2100, occupiedBeds: 1680, icuTotal: 240, icuOccupied: 192, oxygenDaysAvg: 17.5, riskStatus: 'Healthy', resilienceScore: 94 },
];

const initialStates: StateAggregate[] = [
  { id: 'st-tn', name: 'Tamil Nadu', facilityCount: 94, totalBeds: 4200, occupiedBeds: 3410, icuTotal: 480, icuOccupied: 385, supplyRiskItems: 3, workforceCoveragePercent: 92, resilienceScore: 85 },
  { id: 'st-ka', name: 'Karnataka', facilityCount: 68, totalBeds: 3100, occupiedBeds: 2420, icuTotal: 340, icuOccupied: 260, supplyRiskItems: 1, workforceCoveragePercent: 94, resilienceScore: 90 },
];

const initialInventory: InventoryItem[] = [
  { id: 'inv-1', facilityId: 'fac-cbe-021', facilityName: 'PHC Coimbatore-021', resourceName: 'Medical Oxygen Concentrators (10L)', category: 'Oxygen', currentStock: 18, unit: 'units', dailyConsumption: 10.5, daysRemaining: 1.7, reorderThreshold: 30, incomingQty: 0, supplier: 'Linde Medical Gases South', deliveryStatus: 'Delayed', riskLevel: 'HIGH RISK', lastUpdated: '12 seconds ago' },
  { id: 'inv-2', facilityId: 'fac-cbe-021', facilityName: 'PHC Coimbatore-021', resourceName: 'IV Normal Saline (0.9% 500mL)', category: 'Consumables', currentStock: 140, unit: 'bags', dailyConsumption: 32.5, daysRemaining: 4.3, reorderThreshold: 200, incomingQty: 100, supplier: 'Baxter Healthcare India', deliveryStatus: 'On Schedule', riskLevel: 'WARNING', lastUpdated: '5 mins ago' },
  { id: 'inv-3', facilityId: 'fac-slm-008', facilityName: 'PHC Salem-008', resourceName: 'Medical Oxygen Concentrators (10L)', category: 'Oxygen', currentStock: 65, unit: 'units', dailyConsumption: 4.4, daysRemaining: 14.5, reorderThreshold: 20, incomingQty: 0, supplier: 'Linde Medical Gases South', deliveryStatus: 'On Schedule', riskLevel: 'HEALTHY', lastUpdated: '10 mins ago' },
  { id: 'inv-4', facilityId: 'fac-mdu-014', facilityName: 'PHC Madurai-014', resourceName: 'Paracetamol IV 1000mg/100mL', category: 'Medicines', currentStock: 85, unit: 'vials', dailyConsumption: 26.0, daysRemaining: 3.2, reorderThreshold: 150, incomingQty: 200, supplier: 'Cipla Pharmaceuticals', deliveryStatus: 'Pending Dispatch', riskLevel: 'WARNING', lastUpdated: '15 mins ago' },
];

const initialMedicines: MedicineItem[] = [
  { id: 'med-1', name: 'Paracetamol IV 1000mg/100mL', facilityName: 'PHC Madurai-014', category: 'Analgesics / Antipyretics', stock: 85, unit: 'vials', dailyConsumption: 26, daysRemaining: 3.2, expiryDate: '2027-04-15', supplier: 'Cipla Pharmaceuticals', incomingQty: 200, riskLevel: 'WARNING' },
  { id: 'med-2', name: 'Remdesivir 100mg IV Vial', facilityName: 'St. Jude Memorial', category: 'Antivirals', stock: 320, unit: 'vials', dailyConsumption: 18, daysRemaining: 17.7, expiryDate: '2026-11-20', supplier: 'Hetero Drugs India', incomingQty: 100, riskLevel: 'HEALTHY' },
  { id: 'med-3', name: 'Insulin Human Rapid 100IU/mL', facilityName: 'PHC Coimbatore-021', category: 'Endocrine / Diabetes', stock: 42, unit: 'vials', dailyConsumption: 8.5, daysRemaining: 4.9, expiryDate: '2027-01-10', supplier: 'Novo Nordisk India', incomingQty: 50, riskLevel: 'WARNING' },
];

const initialOxygen: OxygenUnit[] = [
  { id: 'oxy-1', facilityName: 'PHC Coimbatore-021', type: 'Concentrators (10L)', currentStock: 18, capacity: 50, dailyConsumption: 10.5, daysRemaining: 1.7, incomingEta: '48 hours (Delayed)', supplier: 'Linde Medical Gases South', riskLevel: 'HIGH RISK' },
  { id: 'oxy-2', facilityName: 'PHC Salem-008', type: 'Concentrators (10L)', currentStock: 65, capacity: 80, dailyConsumption: 4.4, daysRemaining: 14.5, incomingEta: 'On Schedule', supplier: 'Linde Medical Gases South', riskLevel: 'HEALTHY' },
  { id: 'oxy-3', facilityName: 'St. Jude Memorial', type: 'Liquid Oxygen Tanks (5000L)', currentStock: 5800, capacity: 8000, dailyConsumption: 320, daysRemaining: 18.0, incomingEta: 'Tomorrow 08:00 AM', supplier: 'Inox Air Products', riskLevel: 'HEALTHY' },
];

const initialEquipment: EquipmentItem[] = [
  { id: 'eq-1', equipmentType: 'ICU Ventilator (Adult)', facilityName: 'PHC Coimbatore-021', totalUnits: 8, operationalUnits: 7, maintenanceUnits: 1, utilizationRatePercent: 87.5, status: 'Overused' },
  { id: 'eq-2', equipmentType: 'Multi-Parameter Patient Monitor', facilityName: 'PHC Madurai-014', totalUnits: 14, operationalUnits: 14, maintenanceUnits: 0, utilizationRatePercent: 78.5, status: 'Normal' },
];

const initialConsumables: ConsumableItem[] = [
  { id: 'con-1', name: 'N95 Respirator Masks (Box of 50)', facilityName: 'St. Jude Memorial', category: 'PPE', currentStock: 240, unit: 'boxes', dailyConsumption: 12, daysRemaining: 20.0, riskLevel: 'HEALTHY' },
  { id: 'con-2', name: 'IV Infusion Sets (Sterile)', facilityName: 'PHC Coimbatore-021', category: 'IV Fluids', currentStock: 180, unit: 'sets', dailyConsumption: 42, daysRemaining: 4.2, riskLevel: 'WARNING' },
];

const initialBlood: BloodSupplyItem[] = [
  { id: 'bld-1', facilityName: 'St. Jude Memorial', bloodGroup: 'O-Negative', unitsAvailable: 48, minimumRequired: 15, dailyConsumption: 3.2, daysRemaining: 15.0, status: 'Adequate' },
  { id: 'bld-2', facilityName: 'Apollo Specialty Center', bloodGroup: 'A-Positive', unitsAvailable: 62, minimumRequired: 20, dailyConsumption: 4.1, daysRemaining: 15.1, status: 'Adequate' },
];

const initialShipments: ShipmentItem[] = [
  { id: 'shp-101', shipmentCode: 'SHP-2026-8812', resourceName: 'N95 Respirator Masks (30 Boxes)', supplier: '3M India Healthcare', origin: 'Chennai Distribution Center', destination: 'District Hospital Tiruchirappalli', quantity: 30, unit: 'boxes', dispatchDate: '08:30 AM', eta: '45 mins', status: 'In Transit' },
  { id: 'shp-102', shipmentCode: 'SHP-2026-8815', resourceName: 'IV Normal Saline 500mL (100 Bags)', supplier: 'Baxter Healthcare', origin: 'Bengaluru Depot', destination: 'PHC Coimbatore-021', quantity: 100, unit: 'bags', dispatchDate: 'Pending', eta: 'Tomorrow 10:00 AM', status: 'Pending' },
];

const initialSuppliers: SupplierItem[] = [
  { id: 'sup-1', supplierName: 'Linde Medical Gases South', categoryProvided: 'Oxygen', contactPerson: 'K. Rajasekhar', phone: '+91 98400 11223', activeContracts: 14, reliabilityRating: 98.2, delayedShipmentsCount: 1, riskLevel: 'Low' },
  { id: 'sup-2', supplierName: 'Cipla Pharmaceuticals', categoryProvided: 'Medicines', contactPerson: 'S. Meenakshi', phone: '+91 98410 44556', activeContracts: 22, reliabilityRating: 99.4, delayedShipmentsCount: 0, riskLevel: 'Low' },
];

const initialDoctors: DoctorRecord[] = [
  { id: 'doc-1', name: 'Dr. Anand Ramanathan, MD', specialty: 'Critical Care / Pulmonology', facilityName: 'PHC Coimbatore-021', department: 'ICU', status: 'On Duty', patientsAssigned: 8 },
  { id: 'doc-2', name: 'Dr. Priya Sundaram, MS', specialty: 'General Surgery', facilityName: 'PHC Salem-008', department: 'Surgical Ward', status: 'On Duty', patientsAssigned: 6 },
];

const initialNurses: NurseRecord[] = [
  { id: 'ns-1', name: 'Staff Nurse R. Kalpana, B.Sc RN', qualification: 'Critical Care Certified', facilityName: 'PHC Coimbatore-021', ward: 'Medical ICU', status: 'On Duty', shift: 'Morning (07:00-15:00)' },
  { id: 'ns-2', name: 'Staff Nurse M. Selvi, GNM', qualification: 'Acute Care RN', facilityName: 'PHC Madurai-014', ward: 'Emergency Triage', status: 'On Duty', shift: 'Morning (07:00-15:00)' },
];

const initialStaffingRisks: StaffingRiskRecord[] = [
  { id: 'sfr-1', facilityName: 'PHC Coimbatore-021', department: 'Medical ICU', currentCoveragePercent: 87.5, shiftTime: 'Evening Shift (15:00-23:00)', riskLevel: 'High', recommendedAction: 'Reassign 1 float-pool nurse from PHC Salem-008' },
];

const initialActiveIncidents: ActiveIncident[] = [
  { id: 'inc-1', incidentTitle: 'Respiratory Surge & ICU Occupancy Pressure', facilityName: 'PHC Coimbatore-021', district: 'Coimbatore', severity: 'Critical', patientImpact: '14 emergency intake admissions in past 60m', resourceImpact: 'Oxygen stock depletion days dropped to 1.7 days', capacityImpact: 'ICU bed occupancy at 93.3%', status: 'Active Response', reportedAt: '09:39 AM' },
];

const initialPredictions: StockOutPrediction[] = [
  {
    id: 'pred-1',
    facilityId: 'fac-cbe-021',
    facilityName: 'PHC Coimbatore-021',
    district: 'Coimbatore',
    resourceName: 'Medical Oxygen Concentrators (10L)',
    category: 'Oxygen',
    currentStock: 18,
    unit: 'units',
    estimatedDepletionDays: 1.7,
    riskLevel: 'HIGH RISK',
    aiReason: 'Respiratory emergency admissions spiked 23% over the past 72 hours; local supplier delivery is delayed by 48 hours.',
    recommendedTransferQty: 20,
    suggestedSourceFacilityId: 'fac-slm-008',
    suggestedSourceFacilityName: 'PHC Salem-008',
  },
];

const initialTransfers: ResourceTransfer[] = [
  {
    id: 'tr-101',
    transferCode: 'TR-2026-9041',
    sourceFacilityId: 'fac-stj-chn',
    sourceFacilityName: 'St. Jude Memorial Health System',
    destinationFacilityId: 'fac-trc-003',
    destinationFacilityName: 'District Hospital Tiruchirappalli',
    resourceName: 'N95 Respirator Masks (Box of 50)',
    quantity: 30,
    unit: 'boxes',
    priority: 'NORMAL',
    status: 'IN TRANSIT',
    etaMinutes: 45,
    etaString: '45 mins',
    requestedAt: '08:15 AM',
    approvedAt: '08:30 AM',
    dispatchedAt: '09:00 AM',
    reason: 'Routine stock rebalancing prior to scheduled accreditation audit.',
    operator: 'Logistics Manager R. Sundaram',
  },
];

const initialAlerts: AlertIncident[] = [
  { id: 'alt-1', facilityId: 'fac-cbe-021', facilityName: 'PHC Coimbatore-021', title: '🚨 Critical Oxygen Stock Depletion Warning', category: 'Supply Chain', severity: 'Critical', timestamp: '09:39 AM', status: 'Active', impactSummary: 'Facility oxygen stock down to 1.7 days. Respiratory ICU patients at high risk.' },
  { id: 'alt-2', facilityId: 'fac-cbe-021', facilityName: 'PHC Coimbatore-021', title: '🟠 Bed Occupancy Exceeds 90% Threshold', category: 'Capacity', severity: 'High', timestamp: '09:42 AM', status: 'Active', impactSummary: 'Only 3 general beds and 1 ICU bed remaining for incoming emergency intake.' },
  { id: 'alt-3', facilityId: 'fac-mdu-014', facilityName: 'PHC Madurai-014', title: '🟡 IV Saline Stock Warning (3.2 days left)', category: 'Supply Chain', severity: 'Warning', timestamp: '09:35 AM', status: 'Acknowledged', impactSummary: 'Reorder threshold crossed. Replacement shipment pending dispatch.' },
];

const initialForecastData: DemandForecastPoint[] = [
  { timeLabel: '00:00', currentPatientLoad: 720, predictedPatientLoad: 715, currentBedDemand: 680, predictedBedDemand: 675, currentIcuDemand: 98, predictedIcuDemand: 96, oxygenConsumption: 1200, predictedOxygenConsumption: 1190, medicineConsumption: 410, predictedMedicineConsumption: 405, confidenceScore: 96 },
  { timeLabel: '04:00', currentPatientLoad: 710, predictedPatientLoad: 708, currentBedDemand: 672, predictedBedDemand: 670, currentIcuDemand: 96, predictedIcuDemand: 95, oxygenConsumption: 1180, predictedOxygenConsumption: 1175, medicineConsumption: 390, predictedMedicineConsumption: 388, confidenceScore: 97 },
  { timeLabel: '08:00', currentPatientLoad: 745, predictedPatientLoad: 750, currentBedDemand: 710, predictedBedDemand: 715, currentIcuDemand: 102, predictedIcuDemand: 104, oxygenConsumption: 1310, predictedOxygenConsumption: 1330, medicineConsumption: 460, predictedMedicineConsumption: 470, confidenceScore: 95 },
  { timeLabel: '12:00', currentPatientLoad: 810, predictedPatientLoad: 835, currentBedDemand: 760, predictedBedDemand: 785, currentIcuDemand: 112, predictedIcuDemand: 118, oxygenConsumption: 1490, predictedOxygenConsumption: 1540, medicineConsumption: 540, predictedMedicineConsumption: 570, confidenceScore: 94 },
  { timeLabel: '16:00', currentPatientLoad: 865, predictedPatientLoad: 890, currentBedDemand: 815, predictedBedDemand: 840, currentIcuDemand: 122, predictedIcuDemand: 128, oxygenConsumption: 1620, predictedOxygenConsumption: 1690, medicineConsumption: 610, predictedMedicineConsumption: 640, confidenceScore: 92 },
  { timeLabel: '20:00', currentPatientLoad: 840, predictedPatientLoad: 860, currentBedDemand: 790, predictedBedDemand: 810, currentIcuDemand: 118, predictedIcuDemand: 122, oxygenConsumption: 1540, predictedOxygenConsumption: 1590, medicineConsumption: 570, predictedMedicineConsumption: 590, confidenceScore: 93 },
  { timeLabel: '24:00', currentPatientLoad: 790, predictedPatientLoad: 815, currentBedDemand: 745, predictedBedDemand: 770, currentIcuDemand: 110, predictedIcuDemand: 114, oxygenConsumption: 1410, predictedOxygenConsumption: 1460, medicineConsumption: 510, predictedMedicineConsumption: 530, confidenceScore: 94 },
];

export const useOpsSupplyChainStore = create<OpsSupplyChainState>()(
  devtools(
    (set, get) => ({
      facilities: initialFacilities,
      selectedFacility: initialFacilities[0],
      setSelectedFacility: (fac) => set({ selectedFacility: fac }),
      districts: initialDistricts,
      states: initialStates,

      inventoryItems: initialInventory,
      medicines: initialMedicines,
      oxygenUnits: initialOxygen,
      equipmentItems: initialEquipment,
      consumables: initialConsumables,
      bloodSupplies: initialBlood,

      shipments: initialShipments,
      suppliers: initialSuppliers,

      doctors: initialDoctors,
      nurses: initialNurses,
      staffingRisks: initialStaffingRisks,

      activeIncidents: initialActiveIncidents,
      alerts: initialAlerts,
      feedEvents: [],

      forecastTimeframe: '24 HOURS',
      setForecastTimeframe: (tf) => set({ forecastTimeframe: tf }),
      forecastData: initialForecastData,
      stockOutPredictions: initialPredictions,
      transfers: initialTransfers,
      aiInsights: [],

      isEmergencyMode: false,
      toggleEmergencyMode: () => set(state => ({ isEmergencyMode: !state.isEmergencyMode })),

      // 18-Step Interactive Demo Scenario State
      isDemoScenarioRunning: false,
      demoStepIndex: 0,
      demoLog: [],

      acceptTransferRecommendation: (predictionId) => {
        const pred = get().stockOutPredictions.find(p => p.id === predictionId);
        if (!pred) return;

        const newTransfer: ResourceTransfer = {
          id: `tr-${Date.now()}`,
          transferCode: `TR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          sourceFacilityId: pred.suggestedSourceFacilityId,
          sourceFacilityName: pred.suggestedSourceFacilityName,
          destinationFacilityId: pred.facilityId,
          destinationFacilityName: pred.facilityName,
          resourceName: pred.resourceName,
          quantity: pred.recommendedTransferQty,
          unit: pred.unit,
          priority: 'CRITICAL',
          status: 'APPROVED',
          etaMinutes: 135,
          etaString: '2h 15m',
          requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          approvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reason: `AI Redistribution approved: Prevented predicted stock-out at ${pred.facilityName}`,
          operator: 'AIVerse Resilience Intelligence Engine',
        };

        const updatedFacilities = get().facilities.map(fac => {
          if (fac.id === pred.facilityId) {
            return {
              ...fac,
              status: 'Healthy' as FacilityStatus,
              oxygenDaysRemaining: 8.5,
              oxygenStockLiters: 380,
              aiRiskScore: 24,
              aiRecommendations: [
                '✓ AI Resource Transfer APPROVED: 20 Oxygen Concentrators in transit from PHC Salem-008 (ETA 2h 15m).',
                '✓ Stock-out risk mitigated. Operational buffer restored to 8.5 days.',
              ],
            };
          }
          if (fac.id === pred.suggestedSourceFacilityId) {
            return {
              ...fac,
              oxygenStockLiters: 720,
              oxygenDaysRemaining: 11.2,
            };
          }
          return fac;
        });

        set(state => ({
          transfers: [newTransfer, ...state.transfers],
          stockOutPredictions: state.stockOutPredictions.filter(p => p.id !== predictionId),
          facilities: updatedFacilities,
          alerts: state.alerts.map(a => a.facilityId === pred.facilityId ? { ...a, status: 'Resolved' as const } : a),
          selectedFacility: updatedFacilities.find(f => f.id === pred.facilityId) || state.selectedFacility,
        }));
      },

      updateTransferStatus: (transferId, newStatus) => {
        set(state => ({
          transfers: state.transfers.map(t => t.id === transferId ? { ...t, status: newStatus } : t),
        }));
      },

      acknowledgeAlert: (alertId) => {
        set(state => ({
          alerts: state.alerts.map(a => a.id === alertId ? { ...a, status: 'Acknowledged' } : a),
        }));
      },

      resolveAlert: (alertId) => {
        set(state => ({
          alerts: state.alerts.map(a => a.id === alertId ? { ...a, status: 'Resolved' } : a),
        }));
      },

      runDemoScenario: () => {
        set({ isDemoScenarioRunning: true, demoStepIndex: 1, demoLog: ['🚀 Initializing AIVerse Resilience Demo Scenario...'] });

        setTimeout(() => { set(s => ({ demoStepIndex: 2, demoLog: [...s.demoLog, '📈 Step 1: Hospital A (PHC Coimbatore-021) patient demand increases.'] })); }, 1000);
        setTimeout(() => { set(s => ({ demoStepIndex: 3, demoLog: [...s.demoLog, '🛏️ Step 2: Bed occupancy rises to 93.3% (42/45 beds occupied).'] })); }, 2000);
        setTimeout(() => { set(s => ({ demoStepIndex: 4, demoLog: [...s.demoLog, '⚠️ Step 3: ICU availability falls to 1 bed.'] })); }, 3000);
        setTimeout(() => { set(s => ({ demoStepIndex: 5, demoLog: [...s.demoLog, '💨 Step 4: Oxygen consumption accelerates 23%.'] })); }, 4000);
        setTimeout(() => { set(s => ({ demoStepIndex: 6, demoLog: [...s.demoLog, '🤖 Step 5: AI Engine detects abnormal demand surge.'] })); }, 5000);
        setTimeout(() => { set(s => ({ demoStepIndex: 7, demoLog: [...s.demoLog, '🚨 Step 6: AI predicts oxygen shortage (1.7 days remaining).'] })); }, 6000);
        setTimeout(() => { set(s => ({ demoStepIndex: 8, demoLog: [...s.demoLog, '🔔 Step 7: Risk alert logged in Alert Center.'] })); }, 7000);
        setTimeout(() => { set(s => ({ demoStepIndex: 9, demoLog: [...s.demoLog, '🔍 Step 8: AI scans regional nodes for surplus oxygen stock.'] })); }, 8000);
        setTimeout(() => { set(s => ({ demoStepIndex: 10, demoLog: [...s.demoLog, '🏥 Step 9: Hospital B (PHC Salem-008) identified with 45-unit surplus.'] })); }, 9000);
        setTimeout(() => { set(s => ({ demoStepIndex: 11, demoLog: [...s.demoLog, '💡 Step 10: AI recommends transfer: 20 units (Salem → Coimbatore).'] })); }, 10000);
      },

      resetDemoScenario: () => {
        set({
          isDemoScenarioRunning: false,
          demoStepIndex: 0,
          demoLog: [],
          facilities: initialFacilities,
          stockOutPredictions: initialPredictions,
          alerts: initialAlerts,
        });
      },
    }),
    { name: 'aiverse-resilience-store' }
  )
);
