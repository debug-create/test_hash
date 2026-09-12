// caseData.ts
import {
  EntityCaseDetail,
  Case,
  Counterfactual,
  ShiftMapData,
  BehaviorClassification,
} from './types';

// ============================================================================
// 1. Devraj Malhotra - Case #104: Escalated Unexplained Sensitive Access
// ============================================================================
export const DEVRAJ_CASE_DETAIL: EntityCaseDetail = {
  rawDeviationScore: 94,
  contextCoverageScore: 16,
  residualRiskScore: 84,
  classification: 'unexplained',
  initialDriftPattern: 'Late-night Bastion session jumping into isolated payments DB replica',
  timelineEvents: [
    // ADDITION 2a: Instant residual_risk crosses 70+, before admin click, small system action log line at top
    {
      id: 'devraj-ev-sys',
      timestamp: 'Today, 03:06 UTC',
      source: 'FABLE Policy Engine',
      event: '⚡ Automatic action — session privilege reduced to read-only, step-up authentication required.',
      vector: 'Autonomous Tier 2 Policy Engine',
      severity: 'high',
      details: 'Automated policy rule triggered immediately upon residual risk reaching 84/100 (threshold ≥ 70). Reversible session containment enforced; admin notified.',
      isSystemAction: true,
    },
    {
      id: 'devraj-ev-1',
      timestamp: 'Today, 02:14 UTC',
      source: 'Teleport Bastion',
      event: 'Direct SSH to prod-db-replica-04 bypassing jumpbox approval',
      vector: 'Privileged Tunnel',
      severity: 'critical',
      details: 'Session initiated from non-corporate residential VPN endpoint; elevated sudo without Jira reference.',
      resource: {
        id: 'res-bastion',
        name: 'teleport-bastion-gateway',
        critical: false,
      },
    },
    {
      id: 'devraj-ev-2',
      timestamp: 'Today, 02:27 UTC',
      source: 'Postgres pg_audit',
      event: 'pg_dump pg_default:customer_billing_vault streamed to /tmp/.d1',
      vector: 'Shadow Export',
      severity: 'critical',
      details: 'Over 48,000 sensitive records piped directly through gzip into hidden staging directory.',
      // ADDITION 2b: Protective hold on critical resource
      resource: {
        id: 'res-vault',
        name: 'customer-vault',
        critical: true,
        protectiveHold: true,
      },
    },
    {
      id: 'devraj-ev-3',
      timestamp: 'Today, 02:41 UTC',
      source: 'AWS CloudTrail',
      event: 'Ephemeral STS token minted with sts:AssumeRole for cold backup bucket',
      vector: 'IAM Token Minting',
      severity: 'high',
      details: 'AssumeRole called with 12h max expiration; mismatched tags with standard infra rotation playbooks.',
      resource: {
        id: 'res-iam',
        name: 'aws-sts:cold-backup-role',
        critical: false,
      },
    },
    {
      id: 'devraj-ev-4',
      timestamp: 'Today, 03:05 UTC',
      source: 'Network Flow Logs',
      event: '1.42 GB egress transfer initiated towards encrypted object store target',
      vector: 'Outbound Exfil Attempt',
      severity: 'critical',
      details: 'Destination IP resolved to unfamiliar external VPS in Zurich not cataloged in egress whitelist.',
      resource: {
        id: 'res-vault-data',
        name: 'customer-vault:egress',
        critical: true,
        protectiveHold: true,
      },
    },
  ],
  contextLedger: [
    {
      id: 'ctx-1',
      type: 'On-Call Schedule',
      title: 'PagerDuty SRE Primary Shift',
      status: 'missing',
      note: 'Not scheduled for on-call rotation during active window. Shift belongs to M. Vance.',
    },
    {
      id: 'ctx-2',
      type: 'Ticket Link',
      title: 'Jira RFC / Change Request',
      status: 'missing',
      note: 'No authorized incident ticket or emergency maintenance ticket logged in Jira/ServiceNow.',
      resource: {
        id: 'res-vault',
        name: 'customer-vault',
        critical: true,
        protectiveHold: true,
      },
    },
    {
      id: 'ctx-3',
      type: 'Manager Attestation',
      title: 'Emergency Override Attestation',
      status: 'unmatched',
      note: 'Engineering manager confirmed no verbal or Slack authorization for payments DB replica dump.',
    },
    {
      id: 'ctx-4',
      type: 'Role Entitlement',
      title: 'Staff SRE Database Admin Group',
      status: 'valid',
      note: 'Account holds baseline infrastructure entitlements, but lacks legitimate business scope for raw customer billing dumps.',
      resource: {
        id: 'res-vault',
        name: 'customer-vault',
        critical: true,
        protectiveHold: true,
      },
    },
  ],
  counterfactuals: [
    {
      id: 'cf-1',
      hypothesis: 'Legitimate off-hours database corruption triage',
      probability: 12,
      verdict: 'Refuted',
      reasoning: 'No active PagerDuty incidents, zero customer-facing error spikes in Datadog, and database health metrics were 100% green.',
    },
    {
      id: 'cf-2',
      hypothesis: 'Malicious data exfiltration of customer PII via staging directory',
      probability: 88,
      verdict: 'Supported',
      reasoning: 'Systematic piping to hidden dotfiles, bypass of standard audit logs, and recent resignation signal from LinkedIn profile scraper.',
    },
  ],
  counterfactualWaterfall: {
    current_risk: 84,
    deltas: [
      {
        label: 'Without Residential VPN Tunnel (185.220.101.5)',
        risk_without: 61,
        factor_type: 'Network Vector',
        impact_description: 'Eliminates untrusted residential proxy ingress jump',
      },
      {
        label: 'Without pg_dump Shadow Export to /tmp/.d1',
        risk_without: 38,
        factor_type: 'Data Access',
        impact_description: 'Removes unauthorized billing vault bulk read',
      },
      {
        label: 'With Approved Emergency Maintenance RFC',
        risk_without: 19,
        factor_type: 'Context Attestation',
        impact_description: 'Explains database replica maintenance window',
      },
    ],
  },
  shiftMap: {
    change_point_timestamp: 'Today, 02:27 UTC',
    change_point_description: '⚡ Detected Change-Point: Unauthorized pg_dump execution without active RFC',
    nodes: [
      { id: 'devraj-ident', label: 'devraj.malhotra@corp', type: 'identity' },
      { id: 'devraj-dev', label: 'MacBook-Pro-M3 (Residential IP)', type: 'device' },
      { id: 'devraj-bastion', label: 'teleport-bastion-gateway', type: 'resource', critical: false },
      { id: 'devraj-db', label: 'prod-db-replica-04', type: 'resource', critical: true, protectiveHold: true },
      { id: 'devraj-vault', label: 'customer-vault', type: 'resource', critical: true, protectiveHold: true },
      { id: 'devraj-dest', label: 'Zurich VPS (194.26.29.112)', type: 'destination' },
    ],
    edges: [
      { from: 'devraj-ident', to: 'devraj-dev', status: 'explained', timestamp: 'Today, 01:50 UTC', label: 'Okta SSO session' },
      { from: 'devraj-dev', to: 'devraj-bastion', status: 'partial', timestamp: 'Today, 02:14 UTC', label: 'Teleport SSH tunnel' },
      { from: 'devraj-bastion', to: 'devraj-db', status: 'unexplained', timestamp: 'Today, 02:27 UTC', label: 'Direct jumpbox bypass', isChangePoint: true },
      {
        from: 'devraj-db',
        to: 'devraj-vault',
        status: 'unexplained',
        timestamp: 'Today, 02:41 UTC',
        label: 'pg_dump billing vault',
        resource: { id: 'devraj-vault', name: 'customer-vault', critical: true, protectiveHold: true },
      },
      { from: 'devraj-vault', to: 'devraj-dest', status: 'unexplained', timestamp: 'Today, 03:05 UTC', label: '1.42 GB egress transfer' },
    ],
  },
};

// ============================================================================
// 2. Priya Raman - Case #098: Resolved & Cleared
// ============================================================================
export const PRIYA_CASE_DETAIL: EntityCaseDetail = {
  rawDeviationScore: 88,
  contextCoverageScore: 92,
  residualRiskScore: 24,
  classification: 'explained',
  initialDriftPattern: 'Bulk lakehouse extraction of 4.2TB historical warehouse partitions',
  timelineEvents: [
    {
      id: 'priya-ev-1',
      timestamp: 'Yesterday, 14:10 UTC',
      source: 'Snowflake Query Audit',
      event: 'SELECT * FROM analytics_prod.warehouse_facts UNLOAD TO S3',
      vector: 'Bulk Extract',
      severity: 'medium',
      details: 'High-volume egress triggered volume anomaly filter (+340% above baseline).',
      resource: {
        id: 'res-lakehouse',
        name: 'analytics-lakehouse',
        critical: false,
      },
    },
    {
      id: 'priya-ev-2',
      timestamp: 'Yesterday, 14:35 UTC',
      source: 'AWS KMS Logs',
      event: 'KMS Decrypt volume reached 120,000 ops/min in us-east-1',
      vector: 'Key Decryption',
      severity: 'low',
      details: 'Expected cryptographic activity during analytics table migration to Iceberg format.',
      resource: {
        id: 'res-kms',
        name: 'analytics-kms-key',
        critical: false,
      },
    },
  ],
  contextLedger: [
    {
      id: 'p-ctx-1',
      type: 'Approved RFC',
      title: 'RFC-4029: Iceberg Lakehouse Partition Rebalance',
      status: 'valid',
      note: 'Architecture approved by VP Engineering and Data Security Lead on Sept 04.',
      resource: {
        id: 'res-lakehouse',
        name: 'analytics-lakehouse',
        critical: false,
      },
    },
    {
      id: 'p-ctx-2',
      type: 'Ticket Link',
      title: 'DATA-8891 Planned Table Unload',
      status: 'valid',
      note: 'Task was linked directly to approved migration sprint and verified by deployment bot.',
    },
    {
      id: 'p-ctx-3',
      type: 'Manager Attestation',
      title: 'Data Platform Lead Sign-Off',
      status: 'valid',
      note: 'Supervisor signed off on pre-warming target S3 bucket with temporary transfer role.',
    },
  ],
  counterfactuals: [
    {
      id: 'p-cf-1',
      hypothesis: 'Authorized data warehouse format migration',
      probability: 98,
      verdict: 'Supported',
      reasoning: 'Destination bucket belongs to internal enterprise account; cryptographic checksums match RFC plan.',
    },
    {
      id: 'p-cf-2',
      hypothesis: 'Unauthorized enterprise IP exfiltration',
      probability: 4,
      verdict: 'Refuted',
      reasoning: 'All egress routed strictly over VPC endpoints with zero external internet routing.',
    },
  ],
  counterfactualWaterfall: {
    current_risk: 24,
    deltas: [
      {
        label: 'Without RFC-4029 Pre-Authorization',
        risk_without: 79,
        factor_type: 'RFC Validation',
        impact_description: 'Without approved ticket, partition shift mirrors exfiltration',
      },
      {
        label: 'With Current Iceberg Rebalance Ledger',
        risk_without: 24,
        factor_type: 'Baseline Routine',
        impact_description: 'Verified quarterly data engineering workload',
      },
    ],
  },
  shiftMap: {
    change_point_timestamp: 'Yesterday, 14:10 UTC',
    change_point_description: '⚡ Scheduled Execution Window: RFC-4029 Partition Unload',
    nodes: [
      { id: 'priya-ident', label: 'priya.raman@corp', type: 'identity' },
      { id: 'priya-dev', label: 'ThinkPad-P1 (Corporate Office)', type: 'device' },
      { id: 'priya-lakehouse', label: 'analytics-lakehouse', type: 'resource', critical: false },
      { id: 'priya-kms', label: 'analytics-kms-key', type: 'resource', critical: false },
      { id: 'priya-s3', label: 's3://internal-warehouse-iceberg', type: 'destination' },
    ],
    edges: [
      { from: 'priya-ident', to: 'priya-dev', status: 'explained', timestamp: 'Yesterday, 13:45 UTC', label: 'YubiKey MFA auth' },
      { from: 'priya-dev', to: 'priya-lakehouse', status: 'explained', timestamp: 'Yesterday, 14:10 UTC', label: 'SELECT UNLOAD query', isChangePoint: true },
      { from: 'priya-lakehouse', to: 'priya-kms', status: 'explained', timestamp: 'Yesterday, 14:35 UTC', label: 'Batch KMS decrypt' },
      { from: 'priya-lakehouse', to: 'priya-s3', status: 'explained', timestamp: 'Yesterday, 15:00 UTC', label: 'Internal S3 parquet sync' },
    ],
  },
};

// ============================================================================
// 3. Arjun Chen - Case #102: Reviewing / Contextualized Drift
// ============================================================================
export const ARJUN_CASE_DETAIL: EntityCaseDetail = {
  rawDeviationScore: 78,
  contextCoverageScore: 54,
  residualRiskScore: 61,
  classification: 'partial',
  initialDriftPattern: 'Multiple high-bandwidth artifact syncs to external ML evaluation endpoint',
  timelineEvents: [
    {
      id: 'arjun-ev-1',
      timestamp: 'Today, 06:12 UTC',
      source: 'Weights & Biases Enterprise',
      event: 'Model weights export to custom Docker container registry',
      vector: 'Model Artifact Pull',
      severity: 'high',
      details: 'Foundation model checkpoint weights (70B) exported to ephemeral node outside VPC.',
      resource: {
        id: 'res-weights',
        name: 'ml-weights-registry',
        critical: false,
      },
    },
    {
      id: 'arjun-ev-2',
      timestamp: 'Today, 06:55 UTC',
      source: 'GitHub Enterprise Audit',
      event: 'Private repository fork created under personal academic handle',
      vector: 'Source Code Fork',
      severity: 'medium',
      details: 'Fork contains training quantization harnesses; flagged by branch-protection heuristic.',
      resource: {
        id: 'res-repo',
        name: 'migration-repo',
        critical: false, // Normal/unlocked - access explained by RFC-204
      },
    },
    {
      id: 'arjun-ev-3',
      timestamp: 'Today, 07:44 UTC',
      source: 'S3 Data Lake Audit',
      event: 'Read and export query directed at quarterly budget archives',
      vector: 'Unexplained Resource Access',
      severity: 'high',
      details: 'Unexpected read touch against finance cold storage outside ML modeling scope. No associated Jira sprint ticket.',
      // ADDITION 2b: Protective hold on critical resource
      resource: {
        id: 'res-finance-archive',
        name: 'finance-archive',
        critical: true,
        protectiveHold: true, // Export blocked immediately pending review
      },
    },
  ],
  contextLedger: [
    {
      id: 'a-ctx-1',
      type: 'Approved RFC',
      title: 'ML-204 Quantization Benchmark Study',
      status: 'valid',
      note: 'Covers benchmark runs on internal GPU cluster and migration-repo fork. Does not cover finance-archive.',
      resource: {
        id: 'res-migration-repo',
        name: 'migration-repo',
        critical: false,
      },
    },
    {
      id: 'a-ctx-2',
      type: 'Ticket Link',
      title: 'ML-810 Run Quantized Benchmark on H100s',
      status: 'valid',
      note: 'Active sprint ticket exists; waiting for clarification on cloud benchmark instance provider.',
    },
    {
      id: 'a-ctx-3',
      type: 'Manager Attestation',
      title: 'ML Director Written Approval',
      status: 'unmatched',
      note: 'Pending response from ML Research Director regarding off-cluster GPU allocation and finance archive probe.',
      resource: {
        id: 'res-finance-archive',
        name: 'finance-archive',
        critical: true,
        protectiveHold: true,
      },
    },
  ],
  counterfactuals: [
    {
      id: 'a-cf-1',
      hypothesis: 'Academic research benchmark with accredited partner university',
      probability: 62,
      verdict: 'Supported',
      reasoning: 'Destination IP addresses correlate with Lambda Labs GPU instances previously leased for paper deadline.',
    },
    {
      id: 'a-cf-2',
      hypothesis: 'Proprietary weights theft prior to startup founding',
      probability: 38,
      verdict: 'Inconclusive',
      reasoning: 'Weights copied were quantized checkpoints rather than master FP16 weights, but external collaborator invites warrant confirmation.',
    },
  ],
  counterfactualWaterfall: {
    current_risk: 61,
    deltas: [
      {
        label: 'Without Unexpected finance-archive Query',
        risk_without: 32,
        factor_type: 'Resource Egress',
        impact_description: 'Removes unauthorized finance vault scan',
      },
      {
        label: 'With ML Director Attestation on GPU Benchmarks',
        risk_without: 18,
        factor_type: 'Manager Sign-off',
        impact_description: 'Contextualizes off-cluster experiment',
      },
    ],
  },
  shiftMap: {
    change_point_timestamp: 'Today, 07:44 UTC',
    change_point_description: '⚡ Anomaly Change-Point: Out-of-scope query to finance-archive',
    nodes: [
      { id: 'arjun-ident', label: 'arjun.chen@corp', type: 'identity' },
      { id: 'arjun-dev', label: 'MacBook-Pro-M2 (Workstation)', type: 'device' },
      { id: 'arjun-repo', label: 'migration-repo', type: 'resource', critical: false },
      { id: 'arjun-weights', label: 'ml-weights-registry', type: 'resource', critical: false },
      { id: 'arjun-fin', label: 'finance-archive', type: 'resource', critical: true, protectiveHold: true },
      { id: 'arjun-dest', label: 'Lambda Labs GPU (External)', type: 'destination' },
    ],
    edges: [
      { from: 'arjun-ident', to: 'arjun-dev', status: 'explained', timestamp: 'Today, 05:40 UTC', label: 'FIDO2 Auth' },
      { from: 'arjun-dev', to: 'arjun-repo', status: 'explained', timestamp: 'Today, 06:12 UTC', label: 'git clone (RFC-204)' },
      { from: 'arjun-dev', to: 'arjun-weights', status: 'partial', timestamp: 'Today, 06:55 UTC', label: 'Artifact export' },
      {
        from: 'arjun-dev',
        to: 'arjun-fin',
        status: 'unexplained',
        timestamp: 'Today, 07:44 UTC',
        label: 'Unexpected archive read',
        isChangePoint: true,
        resource: { id: 'arjun-fin', name: 'finance-archive', critical: true, protectiveHold: true },
      },
      { from: 'arjun-weights', to: 'arjun-dest', status: 'partial', timestamp: 'Today, 08:05 UTC', label: 'Weights benchmark stream' },
    ],
  },
};

// ============================================================================
// 4. Marcus Vance - Case #109: ADDITION 3 Reopened (Autonomous System Detection)
// ============================================================================
export const MARCUS_CASE_DETAIL: EntityCaseDetail = {
  rawDeviationScore: 72,
  contextCoverageScore: 42,
  residualRiskScore: 68,
  classification: 'partial',
  reopenMetadata: {
    date: 'Today, 05:22 UTC',
    contextReason: 'Quarterly Maintenance RFC-388',
    message:
      'Reopened — new activity on Today, 05:22 UTC falls outside the scope of the Quarterly Maintenance RFC-388 that previously explained this case.',
  },
  initialDriftPattern: 'Post-clearance KMS key egress and token minting after approved maintenance window closed',
  timelineEvents: [
    {
      id: 'marcus-ev-sys-reopen',
      timestamp: 'Today, 05:22 UTC',
      source: 'FABLE Continuous Intent Graph',
      event: '⚡ Autonomous Reopen: Post-window KMS egress outside RFC-388 temporal scope',
      vector: 'Out-of-Window Key Read',
      severity: 'high',
      details: 'Automated policy engine reopened Case #109 after S3 KMS key decryption was detected 1 hour and 22 minutes after the 4-hour RFC-388 maintenance window had elapsed.',
      isSystemAction: true,
    },
    {
      id: 'marcus-ev-1',
      timestamp: 'Yesterday, 22:00 UTC',
      source: 'Teleport Bastion',
      event: 'Scheduled root CLI session on infra-vault-01 (Covered by RFC-388)',
      vector: 'CLI Root Access',
      severity: 'medium',
      details: 'Quarterly TLS certificate rotation across edge Kubernetes nodes. Validated and previously cleared.',
      resource: {
        id: 'res-infra-vault',
        name: 'infra-vault-01',
        critical: false,
      },
    },
    {
      id: 'marcus-ev-2',
      timestamp: 'Today, 05:22 UTC',
      source: 'AWS KMS CloudTrail',
      event: 'Decrypt ops on core-production-kms-master outside maintenance window',
      vector: 'Master Key Touch',
      severity: 'high',
      details: 'Key decryption call occurred outside the approved 22:00-04:00 UTC window specified in RFC-388.',
      resource: {
        id: 'res-kms-master',
        name: 'core-production-kms-master',
        critical: true,
        protectiveHold: true,
      },
    },
  ],
  contextLedger: [
    {
      id: 'm-ctx-1',
      type: 'Approved RFC',
      title: 'RFC-388: Edge TLS Certificate Rotation',
      status: 'expired',
      note: 'Maintenance window strictly bounded between 22:00-04:00 UTC. Activity at 05:22 UTC is expired.',
      resource: {
        id: 'res-kms-master',
        name: 'core-production-kms-master',
        critical: true,
        protectiveHold: true,
      },
    },
    {
      id: 'm-ctx-2',
      type: 'Role Entitlement',
      title: 'DevOps Lead Master Key Entitlement',
      status: 'valid',
      note: 'Entitlements permit emergency rotation, but require active Jira maintenance ticket for off-schedule touches.',
    },
  ],
  counterfactuals: [
    {
      id: 'm-cf-1',
      hypothesis: 'Trailing certificate replication retry queue',
      probability: 74,
      verdict: 'Supported',
      reasoning: 'Secondary edge clusters in us-west-2 may have suffered network latency during initial certificate propagation.',
    },
    {
      id: 'm-cf-2',
      hypothesis: 'Off-window credential scraping before departure',
      probability: 26,
      verdict: 'Inconclusive',
      reasoning: 'Decrypted credentials were not written to disk, but off-window access requires operational sign-off.',
    },
  ],
  counterfactualWaterfall: {
    current_risk: 68,
    deltas: [
      {
        label: 'Without Post-Maintenance Egress Activity',
        risk_without: 22,
        factor_type: 'Scope Deviation',
        impact_description: 'Removes activity occurring after RFC-388 maintenance window closed',
      },
      {
        label: 'With Supplementary Maintenance Extension RFC',
        risk_without: 17,
        factor_type: 'Administrative Approval',
        impact_description: 'Validates off-window certificate re-sync',
      },
    ],
  },
  shiftMap: {
    change_point_timestamp: 'Today, 05:22 UTC',
    change_point_description: '⚡ Auto-Reopen Change-Point: Post-window decrypt operation on master KMS key',
    nodes: [
      { id: 'marcus-ident', label: 'marcus.vance@corp', type: 'identity' },
      { id: 'marcus-dev', label: 'DevOps-Bastion-Host (London)', type: 'device' },
      { id: 'marcus-vault', label: 'infra-vault-01', type: 'resource', critical: false },
      { id: 'marcus-kms', label: 'core-production-kms-master', type: 'resource', critical: true, protectiveHold: true },
    ],
    edges: [
      { from: 'marcus-ident', to: 'marcus-dev', status: 'explained', timestamp: 'Yesterday, 21:55 UTC', label: 'Bastion login' },
      { from: 'marcus-dev', to: 'marcus-vault', status: 'explained', timestamp: 'Yesterday, 22:00 UTC', label: 'RFC-388 Cert Sync' },
      {
        from: 'marcus-dev',
        to: 'marcus-kms',
        status: 'partial',
        timestamp: 'Today, 05:22 UTC',
        label: 'Post-window Decrypt touch',
        isChangePoint: true,
        resource: { id: 'marcus-kms', name: 'core-production-kms-master', critical: true, protectiveHold: true },
      },
    ],
  },
};

// ============================================================================
// 5. Kenji Sato - Case #112: ADDITION 1 Indeterminate (Sparse Baseline Telemetry)
// ============================================================================
export const KENJI_CASE_DETAIL: EntityCaseDetail = {
  rawDeviationScore: 38,
  contextCoverageScore: 12,
  residualRiskScore: 34,
  classification: 'indeterminate',
  initialDriftPattern: 'Unestablished behavioral baseline (brand new hire Day 4; insufficient telemetry)',
  timelineEvents: [
    {
      id: 'kenji-ev-1',
      timestamp: 'Today, 04:15 UTC',
      source: 'GitHub Enterprise Audit',
      event: 'Initial repository clone: core-infra-configs and internal SDKs',
      vector: 'Developer Git Clone',
      severity: 'low',
      details: 'New engineer onboarding cloning standard infrastructure repositories from home workstation subnet.',
      resource: {
        id: 'res-core-infra',
        name: 'core-infra-configs',
        critical: false,
      },
    },
    {
      id: 'kenji-ev-2',
      timestamp: 'Today, 04:50 UTC',
      source: 'Vault PKI Engine',
      event: 'New developer SSH key certificate requested via Teleport',
      vector: 'PKI Certificate Minting',
      severity: 'low',
      details: 'Standard developer onboarding credential generation. Telemetry profile contains < 96 hours of observed signals.',
      resource: {
        id: 'res-pki',
        name: 'teleport-dev-ca',
        critical: false,
      },
    },
  ],
  contextLedger: [
    {
      id: 'k-ctx-1',
      type: 'Ticket Link',
      title: 'HR-ONBOARD-904: Kenji Sato Onboarding Checklist',
      status: 'valid',
      note: 'Active onboarding ticket verified. Manager assigned: Marcus Vance.',
    },
    {
      id: 'k-ctx-2',
      type: 'Role Entitlement',
      title: 'Historical 90-Day Telemetry Baseline',
      status: 'missing',
      note: 'INSUFFICIENT DATA: Employee tenure < 7 days. FABLE cannot calculate intent covariance without historical baseline.',
    },
  ],
  counterfactuals: [
    {
      id: 'k-cf-1',
      hypothesis: 'Standard junior developer onboarding workflow',
      probability: 70,
      verdict: 'Inconclusive',
      reasoning: 'Behavior appears consistent with peer onboarding playbooks, but historical telemetry window is too narrow for statistical certainty.',
    },
    {
      id: 'k-cf-2',
      hypothesis: 'Pre-credentialed reconnaissance touch',
      probability: 30,
      verdict: 'Inconclusive',
      reasoning: 'Zero indicators of malice, but lack of baseline requires supervised classification.',
    },
  ],
  counterfactualWaterfall: {
    current_risk: 34,
    deltas: [
      {
        label: 'With 30-Day Historical Peer Baseline Telemetry',
        risk_without: 14,
        factor_type: 'Baseline Telemetry',
        impact_description: 'Establishes standard junior dev activity envelope',
      },
      {
        label: 'With Manager Onboarding Attestation Sign-off',
        risk_without: 11,
        factor_type: 'Onboarding Attestation',
        impact_description: 'Confirms authorized repository cloning & home network setup',
      },
    ],
  },
  shiftMap: {
    change_point_timestamp: 'Today, 04:15 UTC',
    change_point_description: '⚡ Telemetry Initialization: First observable access from new identity',
    nodes: [
      { id: 'kenji-ident', label: 'kenji.sato@corp', type: 'identity' },
      { id: 'kenji-dev', label: 'MacBook-Air-M3 (Home Tokyo IP)', type: 'device' },
      { id: 'kenji-infra', label: 'core-infra-configs', type: 'resource', critical: false },
      { id: 'kenji-ca', label: 'teleport-dev-ca', type: 'resource', critical: false },
    ],
    edges: [
      { from: 'kenji-ident', to: 'kenji-dev', status: 'indeterminate', timestamp: 'Today, 03:50 UTC', label: 'First SSO login' },
      { from: 'kenji-dev', to: 'kenji-infra', status: 'indeterminate', timestamp: 'Today, 04:15 UTC', label: 'git clone', isChangePoint: true },
      { from: 'kenji-dev', to: 'kenji-ca', status: 'indeterminate', timestamp: 'Today, 04:50 UTC', label: 'SSH cert mint' },
    ],
  },
};

// ============================================================================
// Service-Layer Data Registry (Pre-shaped for real backend integration)
// ============================================================================
export const MOCK_CASES: Record<string, Case> = {
  '104': {
    id: '104',
    actor_id: 'devraj',
    created_at: '2026-09-12T02:14:00Z',
    status: 'unexplained',
    case_status: 'Open',
    raw_deviation: 94,
    context_coverage: 16,
    residual_risk: 84,
    confidence: 91,
    data_quality: 'high',
    primary_cause: 'Residential VPN Bypass & Direct Postgres Shadow Dump to Hidden Dotfile',
    evidence: [
      'Teleport Bastion SSH session from residential IP 185.220.101.5',
      'pg_dump customer_billing_vault streamed to /tmp/.d1',
      '1.42 GB outbound egress transfer to Zurich VPS 194.26.29.112',
    ],
    matched_context_ids: ['ctx-4'],
    unmatched_behavior: [
      'Unscheduled off-hours database access',
      'Bulk customer PII export',
      'Non-whitelisted external VPS egress target',
    ],
  },
  '098': {
    id: '098',
    actor_id: 'priya',
    created_at: '2026-09-11T14:10:00Z',
    status: 'explained',
    case_status: 'Cleared',
    raw_deviation: 88,
    context_coverage: 92,
    residual_risk: 24,
    confidence: 96,
    data_quality: 'high',
    primary_cause: 'Bulk lakehouse extraction validated by approved RFC-4029',
    evidence: [
      'SELECT UNLOAD query on analytics_prod.warehouse_facts',
      'AWS KMS batch decryption burst within expected envelope',
    ],
    matched_context_ids: ['p-ctx-1', 'p-ctx-2', 'p-ctx-3'],
    unmatched_behavior: [],
  },
  '102': {
    id: '102',
    actor_id: 'arjun',
    created_at: '2026-09-12T06:12:00Z',
    status: 'partial',
    case_status: 'Reviewing',
    raw_deviation: 78,
    context_coverage: 54,
    residual_risk: 61,
    confidence: 76,
    data_quality: 'medium',
    primary_cause: 'Model weights export correlated with research benchmark; finance archive probe unexplained',
    evidence: [
      'Weights & Biases 70B model checkpoint export',
      'Private repository fork under personal academic handle',
      'Unexpected read probe to finance-archive cold storage',
    ],
    matched_context_ids: ['a-ctx-1', 'a-ctx-2'],
    unmatched_behavior: ['finance-archive probe outside ML research scope'],
  },
  '109': {
    id: '109',
    actor_id: 'marcus-vance',
    created_at: '2026-09-12T05:22:00Z',
    status: 'partial',
    case_status: 'Reopened',
    raw_deviation: 72,
    context_coverage: 42,
    residual_risk: 68,
    confidence: 84,
    data_quality: 'high',
    primary_cause: 'Post-clearance S3 KMS key egress outside RFC-388 approved maintenance window',
    evidence: [
      'Autonomous system reopen alert at 05:22 UTC',
      'core-production-kms-master decryption touch 82 mins after RFC-388 window close',
    ],
    matched_context_ids: ['m-ctx-2'],
    unmatched_behavior: ['Off-window cryptographic key touch without supplementary ticket'],
    reopen_reason:
      'Reopened — new activity on Today, 05:22 UTC falls outside the scope of the Quarterly Maintenance RFC-388 that previously explained this case.',
    reopen_date: 'Today, 05:22 UTC',
    previous_explanation: 'Quarterly Maintenance RFC-388',
  },
  '112': {
    id: '112',
    actor_id: 'kenji-sato',
    created_at: '2026-09-12T04:15:00Z',
    status: 'indeterminate',
    case_status: 'Reviewing',
    raw_deviation: 38,
    context_coverage: 12,
    residual_risk: 34,
    confidence: 31,
    data_quality: 'insufficient',
    primary_cause: 'Sparse Telemetry Window (< 96 hours on-record for new hire)',
    evidence: [
      'Initial git clone of infrastructure configurations from home subnet',
      'Teleport developer SSH certificate minting',
    ],
    matched_context_ids: ['k-ctx-1'],
    unmatched_behavior: ['Telemetry historical baseline absent (insufficient sample size)'],
  },
};

export const MOCK_COUNTERFACTUALS: Record<string, Counterfactual> = {
  devraj: DEVRAJ_CASE_DETAIL.counterfactualWaterfall!,
  '104': DEVRAJ_CASE_DETAIL.counterfactualWaterfall!,
  priya: PRIYA_CASE_DETAIL.counterfactualWaterfall!,
  '098': PRIYA_CASE_DETAIL.counterfactualWaterfall!,
  arjun: ARJUN_CASE_DETAIL.counterfactualWaterfall!,
  '102': ARJUN_CASE_DETAIL.counterfactualWaterfall!,
  'marcus-vance': MARCUS_CASE_DETAIL.counterfactualWaterfall!,
  '109': MARCUS_CASE_DETAIL.counterfactualWaterfall!,
  'kenji-sato': KENJI_CASE_DETAIL.counterfactualWaterfall!,
  '112': KENJI_CASE_DETAIL.counterfactualWaterfall!,
};

export const MOCK_SHIFTMAPS: Record<string, ShiftMapData> = {
  devraj: DEVRAJ_CASE_DETAIL.shiftMap!,
  '104': DEVRAJ_CASE_DETAIL.shiftMap!,
  priya: PRIYA_CASE_DETAIL.shiftMap!,
  '098': PRIYA_CASE_DETAIL.shiftMap!,
  arjun: ARJUN_CASE_DETAIL.shiftMap!,
  '102': ARJUN_CASE_DETAIL.shiftMap!,
  'marcus-vance': MARCUS_CASE_DETAIL.shiftMap!,
  '109': MARCUS_CASE_DETAIL.shiftMap!,
  'kenji-sato': KENJI_CASE_DETAIL.shiftMap!,
  '112': KENJI_CASE_DETAIL.shiftMap!,
};

// Generic factory for any entity to have an isolated, realistic case detail
export function getOrCreateCaseDetail(
  entityId: string,
  entityName: string,
  role: string,
  department: string,
  riskScore: number
): EntityCaseDetail {
  if (entityId === 'devraj') return DEVRAJ_CASE_DETAIL;
  if (entityId === 'priya') return PRIYA_CASE_DETAIL;
  if (entityId === 'arjun') return ARJUN_CASE_DETAIL;
  if (entityId === 'marcus-vance') return MARCUS_CASE_DETAIL;
  if (entityId === 'kenji-sato') return KENJI_CASE_DETAIL;

  const rawDeviation = Math.min(98, Math.max(15, Math.round(riskScore * 1.15 + (entityId.length % 5))));
  const contextCoverage = Math.min(95, Math.max(10, Math.round(100 - riskScore + (entityId.length % 7))));
  const residualRisk = riskScore;
  const classification: BehaviorClassification =
    riskScore >= 70 ? 'unexplained' : riskScore >= 45 ? 'partial' : 'explained';

  return {
    rawDeviationScore: rawDeviation,
    contextCoverageScore: contextCoverage,
    residualRiskScore: residualRisk,
    classification,
    initialDriftPattern: `Telemetry delta across ${department} service cluster and identity tokens`,
    timelineEvents: [
      ...(residualRisk >= 70
        ? [
            {
              id: `${entityId}-ev-sys`,
              timestamp: 'Within last 15 mins',
              source: 'FABLE Policy Engine',
              event: '⚡ Automatic action — session privilege reduced to read-only, step-up authentication required.',
              vector: 'Autonomous Tier 2 Policy Engine',
              severity: 'high' as const,
              details: `Policy rule triggered immediately upon residual risk reaching ${residualRisk}/100 (threshold ≥ 70). Read-only restriction enforced.`,
              isSystemAction: true,
            },
          ]
        : []),
      {
        id: `${entityId}-ev-1`,
        timestamp: 'Within last 4 hours',
        source: 'IAM & SSO Identity Engine',
        event: `Session token renewed with standard privileges for ${role}`,
        vector: 'Identity Session',
        severity: riskScore > 50 ? 'medium' : 'low',
        details: `Telemetry recorded normal activity profile for ${entityName}. Multi-factor verification passed.`,
      },
      {
        id: `${entityId}-ev-2`,
        timestamp: 'Within last 24 hours',
        source: 'Application Log Auditing',
        event: 'Service interaction within expected departmental baseline',
        vector: 'Internal Routing',
        severity: 'low',
        details: `Standard query execution across ${department} service endpoints. No unexplained anomalies detected.`,
      },
    ],
    contextLedger: [
      {
        id: `${entityId}-ctx-1`,
        type: 'Role Entitlement',
        title: `Designated ${role} Entitlements`,
        status: 'valid',
        note: `Permissions align directly with designated responsibilities in ${department}.`,
      },
      {
        id: `${entityId}-ctx-2`,
        type: 'On-Call Schedule',
        title: 'Department Operational Rotation',
        status: 'valid',
        note: 'Normal working schedule verified with no anomalous out-of-band access.',
      },
    ],
    counterfactuals: [
      {
        id: `${entityId}-cf-1`,
        hypothesis: 'Baseline operational workflow consistent with role',
        probability: Math.max(65, 100 - riskScore),
        verdict: 'Supported',
        reasoning: 'Activity signatures correlate 1:1 with historical 90-day activity profile for this team.',
      },
    ],
    counterfactualWaterfall: {
      current_risk: residualRisk,
      deltas: [
        {
          label: `Without ${department} Service Drift`,
          risk_without: Math.max(10, Math.round(residualRisk * 0.6)),
          factor_type: 'Department Baseline',
          impact_description: 'Removes anomalous telemetry volume outside baseline window',
        },
        {
          label: 'With Verified Team Lead Attestation',
          risk_without: Math.max(8, Math.round(residualRisk * 0.3)),
          factor_type: 'Management Attestation',
          impact_description: 'Attests operational validity of routine task',
        },
      ],
    },
    shiftMap: {
      change_point_timestamp: 'Within last 4 hours',
      change_point_description: 'Activity timestamp across departmental services',
      nodes: [
        { id: `${entityId}-ident`, label: `${entityId}@corp`, type: 'identity' },
        { id: `${entityId}-dev`, label: 'Corporate Workstation', type: 'device' },
        { id: `${entityId}-svc`, label: `${department} Service`, type: 'resource', critical: false },
      ],
      edges: [
        {
          from: `${entityId}-ident`,
          to: `${entityId}-dev`,
          status: classification,
          timestamp: 'Within last 4 hours',
          label: 'SSO Auth',
        },
        {
          from: `${entityId}-dev`,
          to: `${entityId}-svc`,
          status: classification,
          timestamp: 'Within last 2 hours',
          label: 'Service Query',
          isChangePoint: true,
        },
      ],
    },
  };
}
