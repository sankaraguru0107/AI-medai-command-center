-- ============================================================
-- MedAI Command Center - MySQL Schema
-- Database: medai_db
-- ============================================================

-- Clean up old database if present
DROP DATABASE IF EXISTS genkit_ai;

-- Create and select dedicated MedAI Database
CREATE DATABASE IF NOT EXISTS medai_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medai_db;

-- ------------------------------------------------------------
-- Users Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'doctor', 'nurse', 'operations', 'patient') NOT NULL DEFAULT 'doctor',
  department VARCHAR(100),
  phone VARCHAR(50),
  npi VARCHAR(50),
  license_number VARCHAR(50),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  hashed_password VARCHAR(255),
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Patients Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(36) PRIMARY KEY,
  mrn VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender ENUM('male', 'female', 'other', 'unknown') DEFAULT 'unknown',
  ssn_last4 VARCHAR(4),
  phone VARCHAR(50),
  email VARCHAR(255),
  address JSON,
  emergency_contact JSON,
  blood_type VARCHAR(10),
  allergies JSON,
  conditions JSON,
  medications JSON,
  status ENUM('active', 'discharged', 'deceased', 'inactive') DEFAULT 'active',
  admission_date DATETIME,
  discharge_date DATETIME,
  bed_id VARCHAR(36),
  attending_physician_id VARCHAR(36),
  insurance JSON,
  risk_score INT DEFAULT 0,
  risk_factors JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (attending_physician_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- Medical Records Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medical_records (
  id VARCHAR(36) PRIMARY KEY,
  patient_id VARCHAR(36) NOT NULL,
  author_id VARCHAR(36) NOT NULL,
  record_type ENUM(
    'progress_note', 'soap_note', 'discharge_summary', 'h_and_p',
    'procedure_note', 'consult_note', 'radiology_report', 'lab_result',
    'nursing_note', 'order', 'prescription'
  ) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  structured_data JSON,
  icd10_codes JSON,
  cpt_codes JSON,
  ai_summary TEXT,
  ai_risk_flags JSON,
  ambient_transcript TEXT,
  status ENUM('draft', 'signed', 'amended', 'deleted') DEFAULT 'draft',
  signed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Alerts Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
  id VARCHAR(36) PRIMARY KEY,
  patient_id VARCHAR(36),
  triggered_by VARCHAR(36),
  type ENUM('critical', 'warning', 'info', 'success') NOT NULL,
  category ENUM(
    'vitals', 'medication', 'lab', 'security', 'rcm',
    'operations', 'imaging', 'infection', 'fall_risk', 'system'
  ) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  details JSON,
  source_system VARCHAR(100),
  source_id VARCHAR(100),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by VARCHAR(36),
  resolved_at DATETIME,
  resolution_notes TEXT,
  escalated BOOLEAN DEFAULT FALSE,
  escalated_to VARCHAR(36),
  priority INT DEFAULT 2,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (triggered_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- Claims Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS claims (
  id VARCHAR(36) PRIMARY KEY,
  patient_id VARCHAR(36) NOT NULL,
  created_by VARCHAR(36),
  claim_number VARCHAR(100) UNIQUE NOT NULL,
  payer_name VARCHAR(255) NOT NULL,
  payer_id VARCHAR(100),
  member_id VARCHAR(100),
  group_number VARCHAR(100),
  icd10_primary VARCHAR(50) NOT NULL,
  icd10_secondary JSON,
  cpt_codes JSON NOT NULL,
  drg_code VARCHAR(50),
  billed_amount DECIMAL(12,2) NOT NULL,
  allowed_amount DECIMAL(12,2),
  paid_amount DECIMAL(12,2),
  patient_responsibility DECIMAL(12,2),
  status ENUM('draft', 'submitted', 'pending', 'approved', 'denied', 'appeal', 'paid', 'void') DEFAULT 'draft',
  service_date DATE NOT NULL,
  submission_date DATETIME,
  adjudication_date DATETIME,
  denial_code VARCHAR(50),
  denial_reason TEXT,
  appeal_deadline DATE,
  ai_validation_score INT,
  ai_validation_issues JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- Prior Authorizations Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prior_authorizations (
  id VARCHAR(36) PRIMARY KEY,
  patient_id VARCHAR(36) NOT NULL,
  requesting_provider VARCHAR(36),
  auth_number VARCHAR(100) UNIQUE,
  service_type VARCHAR(255) NOT NULL,
  icd10_code VARCHAR(50) NOT NULL,
  cpt_code VARCHAR(50) NOT NULL,
  payer VARCHAR(255) NOT NULL,
  priority ENUM('urgent', 'routine', 'non_urgent') DEFAULT 'routine',
  status ENUM('draft', 'pending', 'in_review', 'approved', 'denied', 'cancelled', 'expired') DEFAULT 'pending',
  submitted_at DATETIME,
  decision_date DATETIME,
  effective_date DATE,
  expiration_date DATE,
  denial_reason TEXT,
  appeal_notes TEXT,
  ai_approval_likelihood INT,
  ai_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (requesting_provider) REFERENCES users(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- Monitoring Data Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS monitoring_data (
  id VARCHAR(36) PRIMARY KEY,
  patient_id VARCHAR(36) NOT NULL,
  heart_rate INT,
  spo2 DECIMAL(5,2),
  systolic_bp INT,
  diastolic_bp INT,
  respiratory_rate INT,
  temperature DECIMAL(5,2),
  weight_kg DECIMAL(6,2),
  glucose INT,
  pain_score INT,
  gcs_score INT,
  device_id VARCHAR(100),
  source ENUM('manual', 'device', 'ehr', 'wearable') DEFAULT 'manual',
  is_abnormal BOOLEAN DEFAULT FALSE,
  abnormal_flags JSON,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  recorded_by VARCHAR(36),
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- Beds Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS beds (
  id VARCHAR(36) PRIMARY KEY,
  bed_number VARCHAR(50) NOT NULL,
  unit VARCHAR(100) NOT NULL,
  room VARCHAR(50),
  floor VARCHAR(50),
  building VARCHAR(100),
  status ENUM('occupied', 'available', 'cleaning', 'maintenance', 'reserved', 'blocked') DEFAULT 'available',
  patient_id VARCHAR(36),
  admission_date DATETIME,
  is_icu BOOLEAN DEFAULT FALSE,
  is_isolation BOOLEAN DEFAULT FALSE,
  has_telemetry BOOLEAN DEFAULT FALSE,
  has_ventilator BOOLEAN DEFAULT FALSE,
  last_cleaned DATETIME,
  cleaning_requested_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- Security Events Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_events (
  id VARCHAR(36) PRIMARY KEY,
  event_type ENUM(
    'unauthorized_access', 'ransomware', 'data_exfiltration', 
    'phishing', 'device_anomaly', 'policy_violation', 'login_anomaly'
  ) NOT NULL,
  severity ENUM('critical', 'high', 'medium', 'low', 'info') NOT NULL,
  source_ip VARCHAR(50),
  source_user_id VARCHAR(36),
  target_system VARCHAR(100),
  description TEXT NOT NULL,
  raw_log JSON,
  phi_involved BOOLEAN DEFAULT FALSE,
  hipaa_breach BOOLEAN DEFAULT FALSE,
  status ENUM('open', 'investigating', 'resolved', 'false_positive') DEFAULT 'open',
  resolved_by VARCHAR(36),
  resolved_at DATETIME,
  ai_analysis TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- Audit Logs Table
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  details JSON,
  ip_address VARCHAR(50),
  user_agent TEXT,
  phi_accessed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
