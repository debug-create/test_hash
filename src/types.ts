// types.ts
export type RiskLevel = 'calm' | 'elevated' | 'escalated' | 'resolved';

// FIX 3: 4 terminal-capable states + Reopened (system-triggered)
export type CaseStatus = 'Open' | 'Reviewing' | 'Cleared' | 'Access Revoked' | 'Reopened';

// ADDITION 1: 4 risk classifications including Indeterminate
export type BehaviorClassification = 'explained' | 'partial' | 'unexplained' | 'indeterminate';

export interface ResourceTarget {
  id: string;
  name: string;
  critical: boolean;
  protectiveHold?: boolean;
}

export interface EvidenceEvent {
  id: string;
  timestamp: string;
  source: string;
  event: string;
  vector: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  details: string;
  isSystemAction?: boolean; // Automatic protective action taken by FABLE (e.g. 0.3s after detection)
  resource?: ResourceTarget;
}

export interface ContextLedgerItem {
  id: string;
  type: 'Approved RFC' | 'On-Call Schedule' | 'Role Entitlement' | 'Manager Attestation' | 'Ticket Link';
  title: string;
  status: 'valid' | 'missing' | 'expired' | 'unmatched';
  note: string;
  resource?: ResourceTarget;
}

export interface CounterfactualScenario {
  id: string;
  hypothesis: string;
  probability: number; // 0-100
  verdict: 'Supported' | 'Refuted' | 'Inconclusive';
  reasoning: string;
}

// Service Layer Contract: Counterfactual
export interface CounterfactualDelta {
  label: string;
  risk_without: number;
  factor_type?: string;
  impact_description?: string;
}

export interface Counterfactual {
  current_risk: number;
  deltas: CounterfactualDelta[];
}

// Service Layer Contract: ShiftMapData
export interface ShiftMapNode {
  id: string;
  label: string;
  type: 'identity' | 'resource' | 'device' | 'destination';
  critical?: boolean;
  protectiveHold?: boolean;
}

export interface ShiftMapEdge {
  from: string;
  to: string;
  status: BehaviorClassification; // 'explained' | 'partial' | 'unexplained' | 'indeterminate'
  timestamp: string;
  label?: string;
  isChangePoint?: boolean;
  resource?: ResourceTarget;
}

export interface ShiftMapData {
  nodes: ShiftMapNode[];
  edges: ShiftMapEdge[];
  change_point_timestamp: string;
  change_point_description?: string;
}

// Service Layer Contract: Case
export interface Case {
  id: string;
  actor_id: string;
  created_at: string;
  status: BehaviorClassification; // 'explained' | 'partial' | 'unexplained' | 'indeterminate'
  case_status?: CaseStatus;
  raw_deviation: number;
  context_coverage: number;
  residual_risk: number;
  confidence: number;
  data_quality: 'high' | 'medium' | 'low' | 'insufficient';
  primary_cause: string;
  evidence: string[];
  matched_context_ids: string[];
  unmatched_behavior: string[];
  reopen_reason?: string;
  reopen_date?: string;
  previous_explanation?: string;
}

export interface ReopenMetadata {
  date: string;
  contextReason: string;
  message: string;
}

export interface EntityCaseDetail {
  rawDeviationScore: number;     // e.g. 92
  contextCoverageScore: number;  // e.g. 14 (low context = high residual)
  residualRiskScore: number;     // e.g. 84
  initialDriftPattern: string;
  timelineEvents: EvidenceEvent[];
  contextLedger: ContextLedgerItem[];
  counterfactuals: CounterfactualScenario[];
  counterfactualWaterfall?: Counterfactual;
  shiftMap?: ShiftMapData;
  classification?: BehaviorClassification;
  confidence?: number;
  reopenMetadata?: ReopenMetadata;
}

export interface EntityLocation {
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export interface Entity {
  id: string;
  name: string;
  role: string;
  department: 'Core Infrastructure' | 'Data & Analytics' | 'Security Ops' | 'Frontend' | 'Product' | 'Finance & Legal';
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  caseStatus?: CaseStatus;
  classification?: BehaviorClassification;
  caseId?: string;
  hasActiveCase: boolean;
  isSilentElevated?: boolean; // 2-3 minor blips: no toast, no bell increment
  summary: string;
  timelineSparkline: { time: string; score: number }[];
  accessVector?: string;
  lastActive: string;
  details?: EntityCaseDetail;
  reopenNotice?: string;
  // NOTE: Frontend-only mock field for the Global Threat Map.
  // The real production backend's Entity schema will need to add this location field when deployed.
  location: EntityLocation;
}

export interface NotificationItem {
  id: string;
  caseId: string;
  targetId: string;
  targetName: string;
  riskScore: number;
  message: string;
  timestamp: string;
  read: boolean;
}
