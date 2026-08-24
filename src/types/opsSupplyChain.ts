export type FacilityType = 'Tertiary Hospital' | 'District Hospital' | 'Primary Health Center (PHC)' | 'Community Health Center (CHC)';
export type FacilityStatus = 'Healthy' | 'Warning' | 'High Load' | 'Critical' | 'Offline';
export type ResourceCategory = 'Medicines' | 'Oxygen' | 'PPE' | 'Blood Supplies' | 'Consumables' | 'Medical Equipment';
export type ResourceRisk = 'HEALTHY' | 'WARNING' | 'HIGH RISK' | 'CRITICAL';
export type TransferPriority = 'CRITICAL' | 'HIGH' | 'NORMAL';
export type TransferStatus = 'REQUESTED' | 'APPROVED' | 'DISPATCHED' | 'IN TRANSIT' | 'DELIVERED' | 'CANCELLED';
export type AlertSeverity = 'Critical' | 'High' | 'Warning' | 'Information';

export interface FacilityNode {
  id: string;
  code: string; // e.g. PHC-CBE-021
  name: string;
  type: FacilityType;
  district: string;
  state: string;
  lat: number;
  lng: number;
  xPercent: number; // For map placement
  yPercent: number;
  status: FacilityStatus;
  online: boolean;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  icuTotal: number;
  icuOccupied: number;
  icuAvailable: number;
  emergencyTotal: number;
  emergencyOccupied: number;
  emergencyWaiting: number;
  oxygenStockLiters: number;
  oxygenDaysRemaining: number;
  medicineStockStatus: 'Healthy' | 'Low' | 'Critical';
  availableDoctors: number;
  availableNurses: number;
  patientLoad: number;
  todayAdmissions: number;
  todayDischarges: number;
  emergencyCount: number;
  aiRiskScore: number; // 0 - 100
  aiRecommendations: string[];
  lastSync: string;
}

export interface DistrictAggregate {
  id: string;
  name: string;
  state: string;
  facilityCount: number;
  totalBeds: number;
  occupiedBeds: number;
  icuTotal: number;
  icuOccupied: number;
  oxygenDaysAvg: number;
  riskStatus: FacilityStatus;
  resilienceScore: number;
}

export interface StateAggregate {
  id: string;
  name: string;
  facilityCount: number;
  totalBeds: number;
  occupiedBeds: number;
  icuTotal: number;
  icuOccupied: number;
  supplyRiskItems: number;
  workforceCoveragePercent: number;
  resilienceScore: number;
}

export interface InventoryItem {
  id: string;
  facilityId: string;
  facilityName: string;
  resourceName: string;
  category: ResourceCategory;
  currentStock: number;
  unit: string;
  dailyConsumption: number;
  daysRemaining: number;
  reorderThreshold: number;
  incomingQty: number;
  supplier: string;
  deliveryStatus: 'On Schedule' | 'Delayed' | 'Pending Dispatch' | 'Delivered';
  riskLevel: ResourceRisk;
  lastUpdated: string;
}

export interface MedicineItem {
  id: string;
  name: string;
  facilityName: string;
  category: string;
  stock: number;
  unit: string;
  dailyConsumption: number;
  daysRemaining: number;
  expiryDate: string;
  supplier: string;
  incomingQty: number;
  riskLevel: ResourceRisk;
}

export interface OxygenUnit {
  id: string;
  facilityName: string;
  type: 'Concentrators (10L)' | 'Liquid Oxygen Tanks (5000L)' | 'High-Pressure Cylinders (47L)';
  currentStock: number;
  capacity: number;
  dailyConsumption: number;
  daysRemaining: number;
  incomingEta: string;
  supplier: string;
  riskLevel: ResourceRisk;
}

export interface EquipmentItem {
  id: string;
  equipmentType: string;
  facilityName: string;
  totalUnits: number;
  operationalUnits: number;
  maintenanceUnits: number;
  utilizationRatePercent: number;
  status: 'Normal' | 'Overused' | 'Maintenance Alert';
}

export interface ConsumableItem {
  id: string;
  name: string;
  facilityName: string;
  category: 'PPE' | 'Gloves' | 'Masks' | 'Syringes' | 'IV Fluids';
  currentStock: number;
  unit: string;
  dailyConsumption: number;
  daysRemaining: number;
  riskLevel: ResourceRisk;
}

export interface BloodSupplyItem {
  id: string;
  facilityName: string;
  bloodGroup: 'O-Negative' | 'O-Positive' | 'A-Positive' | 'B-Positive' | 'AB-Positive';
  unitsAvailable: number;
  minimumRequired: number;
  dailyConsumption: number;
  daysRemaining: number;
  status: 'Adequate' | 'Low Reserve' | 'Critical Shortage';
}

export interface ShipmentItem {
  id: string;
  shipmentCode: string;
  resourceName: string;
  supplier: string;
  origin: string;
  destination: string;
  quantity: number;
  unit: string;
  dispatchDate: string;
  eta: string;
  status: 'Pending' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Delayed' | 'Cancelled';
}

export interface SupplierItem {
  id: string;
  supplierName: string;
  categoryProvided: ResourceCategory;
  contactPerson: string;
  phone: string;
  activeContracts: number;
  reliabilityRating: number; // e.g. 98.4%
  delayedShipmentsCount: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
}

export interface StockOutPrediction {
  id: string;
  facilityId: string;
  facilityName: string;
  district: string;
  resourceName: string;
  category: ResourceCategory;
  currentStock: number;
  unit: string;
  estimatedDepletionDays: number;
  riskLevel: ResourceRisk;
  aiReason: string;
  recommendedTransferQty: number;
  suggestedSourceFacilityId: string;
  suggestedSourceFacilityName: string;
}

export interface ResourceTransfer {
  id: string;
  transferCode: string;
  sourceFacilityId: string;
  sourceFacilityName: string;
  destinationFacilityId: string;
  destinationFacilityName: string;
  resourceName: string;
  quantity: number;
  unit: string;
  priority: TransferPriority;
  status: TransferStatus;
  etaMinutes: number;
  etaString: string;
  requestedAt: string;
  approvedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  reason: string;
  operator: string;
}

export interface DoctorRecord {
  id: string;
  name: string;
  specialty: string;
  facilityName: string;
  department: string;
  status: 'On Duty' | 'On Call' | 'Off Shift';
  patientsAssigned: number;
}

export interface NurseRecord {
  id: string;
  name: string;
  qualification: string;
  facilityName: string;
  ward: string;
  status: 'On Duty' | 'Off Shift';
  shift: 'Morning (07:00-15:00)' | 'Evening (15:00-23:00)' | 'Night (23:00-07:00)';
}

export interface StaffingRiskRecord {
  id: string;
  facilityName: string;
  department: string;
  currentCoveragePercent: number;
  shiftTime: string;
  riskLevel: 'High' | 'Moderate' | 'Low';
  recommendedAction: string;
}

export interface ActiveIncident {
  id: string;
  incidentTitle: string;
  facilityName: string;
  district: string;
  severity: AlertSeverity;
  patientImpact: string;
  resourceImpact: string;
  capacityImpact: string;
  status: 'Active Response' | 'Investigating' | 'Resolved';
  reportedAt: string;
}

export interface OperationalFeedEvent {
  id: string;
  timestamp: string;
  facilityName: string;
  category: string;
  severity: AlertSeverity;
  eventMessage: string;
  status: 'Unresolved' | 'Acknowledged' | 'Action Taken';
}

export interface AlertIncident {
  id: string;
  facilityId: string;
  facilityName: string;
  title: string;
  category: 'Capacity' | 'Supply Chain' | 'Workforce' | 'Facility' | 'Patient Demand';
  severity: AlertSeverity;
  timestamp: string;
  status: 'Active' | 'Acknowledged' | 'Assigned' | 'Resolved';
  assignedTo?: string;
  impactSummary: string;
}

export interface DemandForecastPoint {
  timeLabel: string;
  currentPatientLoad: number;
  predictedPatientLoad: number;
  currentBedDemand: number;
  predictedBedDemand: number;
  currentIcuDemand: number;
  predictedIcuDemand: number;
  oxygenConsumption: number;
  predictedOxygenConsumption: number;
  medicineConsumption: number;
  predictedMedicineConsumption: number;
  confidenceScore: number;
}

export interface AIOperationalInsight {
  id: string;
  title: string;
  category: string;
  whatHappened: string;
  whyItMatters: string;
  evidenceData: string;
  recommendedAction: string;
  confidence: number;
  facilityId?: string;
  facilityName?: string;
}
