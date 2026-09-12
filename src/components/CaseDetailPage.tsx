// CaseDetailPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Entity, CaseStatus, EvidenceEvent, ResourceTarget, BehaviorClassification } from '../types';
import { Sparkline } from './Sparkline';
import { StatusBadge, ClassificationBadge } from './StatusBadge';
import { getOrCreateCaseDetail } from '../caseData';
import { ShiftMapGraph } from './ShiftMapGraph';
import { CounterfactualWaterfall } from './CounterfactualWaterfall';
import { ResourceBadgeChip } from './CaseDetailDrawer';
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Activity,
  FileCheck2,
  FileX2,
  HelpCircle,
  Clock,
  Layers,
  Terminal,
  Lock,
  RotateCcw,
  CheckCircle2,
  UserCheck,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Building2,
  Briefcase,
  GitCommit,
  Zap,
  Shield,
  FileCode2,
  KeyRound,
  Database,
  UploadCloud,
  Network,
  Sliders,
  Check,
  X,
  ArrowRight,
  Info,
  TrendingDown,
  TrendingUp,
  MapPin,
  Calendar,
  AlertOctagon,
  User,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CaseDetailPageProps {
  caseId: string;
  entity: Entity;
  onBack: () => void;
  onUpdateStatus?: (status: CaseStatus) => void;
}

export function CaseDetailPage({
  caseId,
  entity,
  onBack,
  onUpdateStatus,
}: CaseDetailPageProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'shiftmap' | 'events' | 'context' | 'counterfactual'
  >('overview');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [confirmingRevoke, setConfirmingRevoke] = useState(false);
  const [evidenceFilter, setEvidenceFilter] = useState<'all' | 'high' | 'unexplained' | 'system'>('all');
  const [simulatedGrantActive, setSimulatedGrantActive] = useState(false);

  // Compute case detail data
  const rawCaseDetail = useMemo(() => {
    return (
      entity?.details ||
      getOrCreateCaseDetail(
        entity?.id || 'unknown',
        entity?.name || 'Unknown Entity',
        entity?.role || 'Engineer',
        entity?.department || 'Core Infrastructure',
        entity?.riskScore || 50
      )
    );
  }, [entity]);

  // Ensure system action event is prepended if threshold is >= 70
  const caseDetail = useMemo(() => {
    const qualifies = rawCaseDetail.residualRiskScore >= 70;
    if (!qualifies) return rawCaseDetail;

    const hasAlready = rawCaseDetail.timelineEvents.some((ev) => ev.isSystemAction);
    if (hasAlready) return rawCaseDetail;

    const systemActionEvent: EvidenceEvent = {
      id: `sys-auto-prot-${entity?.id || 'unknown'}`,
      timestamp: 'Today, 03:06 UTC',
      source: 'FABLE Autonomous Policy Engine',
      event:
        '⚡ Automatic action — session privilege reduced to read-only, step-up authentication required.',
      vector: 'Autonomous Tier 2 Policy Enforcement',
      severity: 'high',
      isSystemAction: true,
      details:
        `Automated policy rule triggered immediately upon residual risk crossing 70/100 threshold (net score: ${rawCaseDetail.residualRiskScore}/100). Safe, reversible session containment enforced; admin notified.`,
    };

    return {
      ...rawCaseDetail,
      timelineEvents: [systemActionEvent, ...rawCaseDetail.timelineEvents],
    };
  }, [rawCaseDetail, entity]);

  const qualifiesForAutomaticProtectiveAction = caseDetail.residualRiskScore >= 70;
  const isEscalated = entity.riskLevel === 'escalated' || entity.caseStatus === 'Open';
  const isResolved = entity.caseStatus === 'Cleared';
  const isRevoked = entity.caseStatus === 'Access Revoked';
  const isReviewing = entity.caseStatus === 'Reviewing';
  const isReopened = entity.caseStatus === 'Reopened';
  const isIndeterminate =
    entity.classification === 'indeterminate' ||
    caseDetail.classification === 'indeterminate';

  const accentColor = isEscalated
    ? '#E8342A'
    : isResolved
    ? '#C6613F'
    : isReopened
    ? '#ff7e54'
    : '#D97706';

  const handleStatusChange = (newStatus: CaseStatus, notice: string) => {
    if (onUpdateStatus) {
      onUpdateStatus(newStatus);
    }
    setActionNotice(notice);
    setTimeout(() => {
      setActionNotice(null);
    }, 4500);
  };

  // Requirement 2: Case-specific plain language summary line
  const narrativeSummary = useMemo(() => {
    const id = entity.id.toLowerCase();
    const caseNum = (entity.caseId || caseId || '').toLowerCase();

    if (id === 'devraj' || caseNum === '104') {
      return "Over the past week, Devraj's activity shifted from normal engineering work to off-hours database access with no matching approval — that's what triggered this case.";
    }
    if (id === 'priya' || caseNum === '098') {
      return "Priya's high-volume data migration triggered initial alerts, but was fully matched and cleared against approved RFC-4029 with all lakehouse accesses verified.";
    }
    if (id === 'arjun' || caseNum === '102') {
      return "Arjun's model training telemetry and Weights & Biases sync are verified, but unexpected off-hours reads on the restricted finance-archive bucket remain unexplained.";
    }
    if (id === 'elena') {
      return "Elena's administrative role grants were expanded for the Q3 audit, but unusual permission elevation without a peer-reviewed change ticket raised a soft review flag.";
    }
    if (id === 'marcus') {
      return "Marcus accessed customer-facing support queues during off-shift hours; context validation correlated this with the Sev-1 incident coverage rotation.";
    }
    if (id === 'maya') {
      return "Maya's account shows sparse historical telemetry (< 96h on-platform); activity is categorized as indeterminate while baseline behavioral profiling completes.";
    }
    return entity.summary || "Observed telemetry across departmental endpoints evaluated against organizational baseline and contextual authorizations.";
  }, [entity, caseId]);

  // Is this a case with partial explanation that needs the split view? (Arjun)
  const isPartialCase =
    entity.id === 'arjun' ||
    caseDetail.classification === 'partial' ||
    entity.classification === 'partial';

  // Evidence event categorization helper for icons
  const getEvidenceIcon = (ev: EvidenceEvent) => {
    if (ev.isSystemAction) return <Zap className="w-4 h-4 text-amber-400" />;
    const v = (ev.vector || '').toLowerCase();
    const e = (ev.event || '').toLowerCase();

    if (v.includes('auth') || v.includes('identity') || e.includes('sso') || e.includes('login') || e.includes('token')) {
      return <KeyRound className="w-4 h-4 text-zinc-300" />;
    }
    if (v.includes('dump') || v.includes('query') || v.includes('database') || e.includes('sql') || e.includes('database')) {
      return <Database className="w-4 h-4 text-zinc-300" />;
    }
    if (v.includes('tunnel') || v.includes('proxy') || v.includes('vpn') || v.includes('ssh')) {
      return <Terminal className="w-4 h-4 text-zinc-300" />;
    }
    if (v.includes('egress') || v.includes('exfiltration') || v.includes('export') || v.includes('sync')) {
      return <UploadCloud className="w-4 h-4 text-[#E8342A]" />;
    }
    if (v.includes('escalation') || v.includes('bypass') || v.includes('sudo')) {
      return <ShieldAlert className="w-4 h-4 text-amber-400" />;
    }
    return <FileCode2 className="w-4 h-4 text-zinc-300" />;
  };

  // Status tag palette helper
  const getEventStatusBadge = (ev: EvidenceEvent) => {
    if (ev.isSystemAction) {
      return {
        label: 'System Action',
        className: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      };
    }
    const isUnexplained =
      ev.severity === 'critical' ||
      ev.vector?.toLowerCase().includes('exfiltration') ||
      ev.vector?.toLowerCase().includes('shadow') ||
      ev.vector?.toLowerCase().includes('unexplained');

    const isPartial =
      ev.severity === 'high' ||
      ev.vector?.toLowerCase().includes('tunnel') ||
      ev.vector?.toLowerCase().includes('fork');

    if (isUnexplained) {
      return {
        label: 'Unexplained',
        className: 'bg-[#E8342A]/20 text-[#E8342A] border-[#E8342A]/40',
      };
    }
    if (isPartial) {
      return {
        label: 'Partial',
        className: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      };
    }
    return {
      label: 'Explained',
      className: 'bg-[#C6613F]/20 text-[#C6613F] border-[#C6613F]/40',
    };
  };

  // Filtered evidence events
  const filteredEvents = useMemo(() => {
    return caseDetail.timelineEvents.filter((ev) => {
      if (evidenceFilter === 'high') {
        return ev.severity === 'critical' || ev.severity === 'high';
      }
      if (evidenceFilter === 'unexplained') {
        return (
          ev.severity === 'critical' ||
          ev.vector?.toLowerCase().includes('exfiltration') ||
          ev.vector?.toLowerCase().includes('shadow') ||
          ev.vector?.toLowerCase().includes('unexplained')
        );
      }
      if (evidenceFilter === 'system') {
        return ev.isSystemAction;
      }
      return true;
    });
  }, [caseDetail.timelineEvents, evidenceFilter]);

  // Coverage trace matrix items for Requirement 5
  const coverageItems = useMemo(() => {
    if (entity.id === 'devraj' || caseId === '104') {
      return [
        {
          event: 'Teleport Bastion Gateway SSO Session',
          timestamp: 'Today, 01:50 UTC',
          grant: 'Staff SRE Database Admin Group',
          isCovered: true,
          reason: 'Valid baseline role entitlement for SRE workstation',
        },
        {
          event: 'Teleport SSH Sudo Jumpbox Bypass',
          timestamp: 'Today, 02:14 UTC',
          grant: 'No matching RFC or PagerDuty ticket',
          isCovered: false,
          reason: 'Missing emergency maintenance window authorization',
        },
        {
          event: 'pg_dump shadow export to /tmp/.d1',
          timestamp: 'Today, 02:27 UTC',
          grant: 'customer-vault restricted scope',
          isCovered: false,
          reason: 'DBA read entitlement explicitly excludes raw customer vault dumps',
        },
        {
          event: 'AWS STS AssumeRole with cold-backup tags',
          timestamp: 'Today, 02:41 UTC',
          grant: 'No matching IAM ticket',
          isCovered: false,
          reason: 'Role tags mismatch active SRE infra rotation playbook',
        },
        {
          event: '1.42 GB egress transfer to Zurich VPS',
          timestamp: 'Today, 03:05 UTC',
          grant: 'Corporate egress CIDR whitelist',
          isCovered: false,
          reason: 'External IP (194.26.29.112) is an unlisted residential proxy',
        },
        {
          event: 'Off-hours residential VPN tunnel connection',
          timestamp: 'Today, 01:45 UTC',
          grant: 'Corporate VPN Security Policy',
          isCovered: false,
          reason: 'Tor/Mullvad exit node flagged by GeoIP behavioral anomaly filter',
        },
      ];
    }

    if (entity.id === 'priya' || caseId === '098') {
      return [
        {
          event: 'Snowflake UNLOAD query to S3',
          timestamp: 'Yesterday, 14:10 UTC',
          grant: 'RFC-4029: Iceberg Lakehouse Partition Rebalance',
          isCovered: true,
          reason: 'Pre-approved by VP Engineering and Data Security Lead',
        },
        {
          event: 'AWS KMS Batch Decrypt (120k ops/min)',
          timestamp: 'Yesterday, 14:35 UTC',
          grant: 'DATA-8891 Planned Table Unload',
          isCovered: true,
          reason: 'Verified quarterly data engineering workload',
        },
        {
          event: 'Internal S3 parquet sync over VPC',
          timestamp: 'Yesterday, 15:00 UTC',
          grant: 'Data Platform Lead Sign-Off',
          isCovered: true,
          reason: 'Destination bucket belongs to internal enterprise account',
        },
      ];
    }

    if (entity.id === 'arjun' || caseId === '102') {
      return [
        {
          event: 'Weights & Biases 70B model checkpoint pull',
          timestamp: 'Today, 06:12 UTC',
          grant: 'ML-204 Quantization Benchmark Study',
          isCovered: true,
          reason: 'Covered under ML benchmark sprint allocation',
        },
        {
          event: 'Private repository fork under academic handle',
          timestamp: 'Today, 06:55 UTC',
          grant: 'ML-810 Run Quantized Benchmark',
          isCovered: true,
          reason: 'Permitted quantization harness fork',
        },
        {
          event: 'Read query against quarterly budget archives',
          timestamp: 'Today, 07:44 UTC',
          grant: 'No matching ML ticket or Jira approval',
          isCovered: false,
          reason: 'Unexpected touch against restricted finance-archive bucket',
        },
      ];
    }

    // Default fallback
    return caseDetail.timelineEvents.slice(0, 4).map((ev, idx) => ({
      event: ev.event,
      timestamp: ev.timestamp,
      grant: idx === 0 ? 'Role Entitlement' : 'Operational Baseline',
      isCovered: idx === 0 || caseDetail.contextCoverageScore > 60,
      reason: ev.details,
    }));
  }, [entity.id, caseId, caseDetail]);

  const coveredCount = coverageItems.filter((i) => i.isCovered).length;
  const totalCount = coverageItems.length;
  const computedPercent = Math.round((coveredCount / Math.max(1, totalCount)) * 100);

  return (
    <div className="min-h-screen bg-[#060608] text-zinc-100 font-sans selection:bg-[#C6613F]/30 selection:text-white">
      {/* 1. TOP NAVIGATION & BREADCRUMB BAR */}
      <header className="sticky top-0 z-40 bg-[#060608]/90 border-b border-white/[0.06] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Back to Org Overview Affordance */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono text-zinc-300 hover:text-white bg-zinc-900 border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer shadow-sm group"
              title="Return to Org Overview console"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C6613F] group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Org Overview</span>
            </button>

            <span className="text-zinc-600 font-mono text-xs">/</span>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-400">Cases</span>
              <span className="text-zinc-600">/</span>
              <span className="text-white font-semibold">
                Case #{entity.caseId || caseId}
              </span>
            </div>
          </div>

          {/* Right: Quick Status Indicators */}
          <div className="flex items-center gap-2 sm:gap-3">
            <StatusBadge
              status={entity.caseStatus}
              riskLevel={entity.riskLevel}
              riskScore={entity.riskScore}
              classification={entity.classification || caseDetail.classification}
              size="sm"
            />

            {(entity.classification || caseDetail.classification) && (
              <ClassificationBadge
                classification={entity.classification || caseDetail.classification!}
                size="sm"
              />
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN FULL-PAGE CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Action Notice Alert Banner */}
        <AnimatePresence>
          {actionNotice && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-3 shadow-lg"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span className="font-medium">{actionNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Human Confirmation Panel for Revoke Access */}
        <AnimatePresence>
          {confirmingRevoke && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="p-6 rounded-2xl bg-[#180d10] border-2 border-[#E8342A] shadow-2xl shadow-red-950/40 space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#E8342A]/20 border border-[#E8342A]/40 flex items-center justify-center text-[#E8342A] shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-mono font-bold text-white tracking-wide">
                    Human Confirmation Required: Emergency Access Revocation
                  </h3>
                  <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed font-sans">
                    You are about to execute an immediate operational revocation for{' '}
                    <strong className="text-white font-mono">{entity.name}</strong> ({entity.role}). This action will immediately terminate active Teleport SSH tunnels, revoke AWS STS/GCP IAM temporary tokens, invalidate Okta SSO session cookies, and notify the Security Operations Director.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.08] font-mono text-xs text-zinc-400 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Actor Target</span>
                  <span className="text-white font-semibold">{entity.id}@corp</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Active Bastion Hops</span>
                  <span className="text-rose-400 font-semibold">2 Active Tunnels (Severed)</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Audit Trace</span>
                  <span className="text-amber-300 font-semibold">Immutable SOC Dispatch #REV-991</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setConfirmingRevoke(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono bg-zinc-900 border border-white/[0.1] text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel Action
                </button>
                <button
                  onClick={() => {
                    setConfirmingRevoke(false);
                    handleStatusChange(
                      'Access Revoked',
                      `Emergency Access Revocation confirmed and executed for ${entity.name}. Teleport and database tokens revoked.`
                    );
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-[#E8342A] text-white hover:bg-[#E8342A]/90 transition-all shadow-lg shadow-[#E8342A]/30 cursor-pointer flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Execute Emergency Revocation</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO SECTION: ENTITY PROFILE + DISPOSITION ACTION BAR */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0b0b10] border border-white/[0.08] shadow-2xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
            {/* Left: Entity Profile Details */}
            <div className="flex items-start gap-4 sm:gap-5">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border text-lg font-bold font-mono shadow-md ${
                  isEscalated
                    ? 'bg-[#E8342A]/15 border-[#E8342A]/40 text-[#E8342A]'
                    : isResolved
                    ? 'bg-[#C6613F]/15 border-[#C6613F]/40 text-[#C6613F]'
                    : isReopened
                    ? 'bg-[#1f120c] border-[#C6613F]/70 text-[#ff7e54]'
                    : isRevoked
                    ? 'bg-[#160d10] border-rose-950/70 text-rose-300'
                    : 'bg-zinc-800/80 border-white/[0.1] text-zinc-300'
                }`}
              >
                {entity.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#C6613F] bg-[#C6613F]/10 px-2 py-0.5 rounded border border-[#C6613F]/20">
                    Case #{entity.caseId || caseId}
                  </span>
                  <span className="text-zinc-600 font-mono text-xs">•</span>
                  <span className="text-xs font-mono text-zinc-400">
                    {entity.department}
                  </span>
                  <span className="text-zinc-600 font-mono text-xs">•</span>
                  <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-zinc-500" />
                    <span>{entity.location?.city || 'Corporate Workstation'}</span>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1.5">
                  {entity.name}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-mono">
                  {entity.role} <span className="text-zinc-600">•</span> Active {entity.lastActive}
                </p>
              </div>
            </div>

            {/* Right: Operational Disposition Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              {/* Investigate Button */}
              <button
                onClick={() =>
                  handleStatusChange(
                    'Reviewing',
                    `Case #${entity.caseId || caseId} moved to Active Investigation.`
                  )
                }
                className={`px-4 py-2.5 rounded-xl text-xs font-mono font-medium border transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
                  isReviewing
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-zinc-900 border-white/[0.08] text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
                title="Move case to active investigation"
              >
                <Activity className="w-4 h-4 text-amber-400" />
                <span>{isReviewing ? 'Investigating' : 'Investigate'}</span>
              </button>

              {/* Clear Case Button */}
              <button
                onClick={() =>
                  handleStatusChange(
                    'Cleared',
                    `Case #${entity.caseId || caseId} marked Cleared. Intent and context verified.`
                  )
                }
                className={`px-4 py-2.5 rounded-xl text-xs font-mono font-medium border transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
                  isResolved
                    ? 'bg-[#C6613F]/20 border-[#C6613F]/40 text-[#C6613F]'
                    : 'bg-zinc-900 border-white/[0.08] text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
                title="Mark case as resolved & verified"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Clear Case</span>
              </button>

              {/* Revoke Access Button (human confirmed) */}
              <button
                onClick={() => {
                  if (isRevoked) {
                    handleStatusChange(
                      'Access Revoked',
                      `Case already in terminal Access Revoked status.`
                    );
                  } else {
                    setConfirmingRevoke(true);
                  }
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
                  isRevoked
                    ? 'bg-rose-950/40 border-rose-800/40 text-rose-300'
                    : 'bg-[#E8342A] border-[#E8342A] text-white hover:bg-[#E8342A]/90 shadow-[#E8342A]/20'
                }`}
                title="Initiate human-confirmed emergency access revocation"
              >
                <Lock className="w-4 h-4" />
                <span>Revoke Access</span>
              </button>
            </div>
          </div>

          {/* REQUIREMENT 2: Plain-language narrative summary line near the top */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#140f0c] via-[#100e14] to-[#0a0a0f] border border-[#C6613F]/30 shadow-inner">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-[#C6613F]/20 border border-[#C6613F]/40 flex items-center justify-center text-[#ff7e54] shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                  Forensic Incident Narrative
                </span>
                <p className="text-sm sm:text-base text-zinc-100 mt-1 font-sans leading-relaxed font-medium">
                  "{narrativeSummary}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. TAB NAVIGATION STRIP (Full Width Canvas) */}
        <div className="border-b border-white/[0.08] flex items-center gap-8 text-xs sm:text-sm font-mono overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 relative cursor-pointer font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'text-white font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Overview</span>
            {activeTab === 'overview' && (
              <motion.span
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C6613F]"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('shiftmap')}
            className={`py-3.5 relative cursor-pointer font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'shiftmap'
                ? 'text-white font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <GitCommit className="w-4 h-4 text-[#C6613F]" />
            <span>Shift Map</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.06] text-zinc-400">
              Forensic Visualizer
            </span>
            {activeTab === 'shiftmap' && (
              <motion.span
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C6613F]"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`py-3.5 relative cursor-pointer font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'events'
                ? 'text-white font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Evidence</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.06] text-zinc-400">
              {caseDetail.timelineEvents.length}
            </span>
            {activeTab === 'events' && (
              <motion.span
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C6613F]"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('context')}
            className={`py-3.5 relative cursor-pointer font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'context'
                ? 'text-white font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Context Ledger</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.06] text-zinc-400">
              {caseDetail.contextLedger.length}
            </span>
            {activeTab === 'context' && (
              <motion.span
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C6613F]"
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab('counterfactual')}
            className={`py-3.5 relative cursor-pointer font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'counterfactual'
                ? 'text-white font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Counterfactuals</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.06] text-zinc-400">
              {caseDetail.counterfactualWaterfall?.deltas.length || caseDetail.counterfactuals.length}
            </span>
            {activeTab === 'counterfactual' && (
              <motion.span
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C6613F]"
              />
            )}
          </button>
        </div>

        {/* 4. TAB PANELS */}
        <div className="space-y-8">
          {/* TAB 1: OVERVIEW (Connected narrative sequence) */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* STAGE 01: OPERATIONAL POSTURE & POLICY BANNER */}
              {isReopened ? (
                <div className="p-5 rounded-2xl bg-[#1d120a] border border-[#C6613F]/60 text-amber-200 text-xs shadow-lg shadow-[#C6613F]/10 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-[#C6613F]/20 border border-[#C6613F]/40 flex items-center justify-center text-[#ff7e54] shrink-0 mt-0.5">
                    <RotateCcw className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#ff7e54]">
                        Stage 01: Autonomous System Reopen Triggered
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 bg-black/50 px-2.5 py-1 rounded border border-white/[0.08]">
                        {caseDetail.reopenMetadata?.date || 'Today, 05:22 UTC'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-200 mt-1.5 leading-relaxed font-mono">
                      {entity.reopenNotice ||
                        caseDetail.reopenMetadata?.message ||
                        'Reopened — new activity on Today, 05:22 UTC falls outside the scope of the Quarterly Maintenance RFC-388 that previously explained this case.'}
                    </p>
                  </div>
                </div>
              ) : isIndeterminate ? (
                <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-700/70 text-zinc-300 text-xs shadow-sm flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-600 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                    <HelpCircle className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-200">
                        Stage 01: Risk Classification: Indeterminate
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 bg-black/50 px-2.5 py-1 rounded border border-white/[0.08]">
                        Sparse Telemetry (&lt; 96h)
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                      This entity has genuinely insufficient historical telemetry to classify confidently (e.g. employee tenure &lt; 7 days). This indicates <em>"we do not have enough baseline data yet,"</em> not <em>"this behavior is confirmed anomalous."</em>
                    </p>
                  </div>
                </div>
              ) : qualifiesForAutomaticProtectiveAction ? (
                <div className="p-5 rounded-2xl bg-[#1c1209]/90 border border-amber-500/40 text-amber-200 text-xs shadow-lg shadow-amber-950/30 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 animate-bounce" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                        Stage 01: ⚡ Automatic Action Enforced — Session Privilege Reduced
                      </span>
                      <span className="text-[10px] font-mono text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        Tier 2 Enforced (0.3s after detection)
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      Session privilege reduced to read-only, step-up authentication required. Reversible containment enforced automatically upon crossing residual risk threshold ≥ 70 (score: {caseDetail.residualRiskScore}/100).
                    </p>
                  </div>
                </div>
              ) : isResolved ? (
                <div className="p-5 rounded-2xl bg-[#121612]/90 border border-emerald-500/30 text-emerald-200 text-xs shadow-sm flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-300 block">
                      Stage 01: Case Cleared & Validated
                    </span>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      All anomalous telemetry was matched 1:1 against pre-approved RFC records. No protective holds or account restrictions are active.
                    </p>
                  </div>
                </div>
              ) : null}

              {/* STAGE 02: RISK CALCULUS FORMULA BOXES (Spacious on full page) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Stage 02: FABLE Risk Calculus Formula Decomposition
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    Residual Risk = Raw Deviation - Contextual Attenuation
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {/* Box 1: Raw Deviation */}
                  <div className="p-5 rounded-2xl bg-[#0c0c12] border border-white/[0.08] hover:border-white/[0.15] transition-all space-y-2 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                        Raw Deviation
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded">
                        Step 1
                      </span>
                    </div>
                    <div className="text-3xl font-bold font-mono text-zinc-100">
                      {caseDetail.rawDeviationScore}
                      <span className="text-sm font-normal text-zinc-500">/100</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      Gross behavioral drift across identity, device telemetry, and access volumes.
                    </p>
                  </div>

                  {/* Box 2: Context Coverage */}
                  <div className="p-5 rounded-2xl bg-[#0c0c12] border border-white/[0.08] hover:border-white/[0.15] transition-all space-y-2 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                        Context Coverage
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Step 2: Attenuation
                      </span>
                    </div>
                    <div className="text-3xl font-bold font-mono text-emerald-400">
                      {caseDetail.contextCoverageScore}%
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      Percentage of observed anomalous actions covered by approved RFCs, tickets, or on-call roles.
                    </p>
                  </div>

                  {/* Box 3: Residual Risk */}
                  <div className="p-5 rounded-2xl bg-[#0c0c12] border border-white/[0.08] hover:border-white/[0.15] transition-all space-y-2 shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                        Residual Risk
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isEscalated
                            ? 'bg-[#E8342A]/20 text-[#E8342A]'
                            : isResolved
                            ? 'bg-[#C6613F]/20 text-[#C6613F]'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        Net Alert Score
                      </span>
                    </div>
                    <div
                      className={`text-3xl font-bold font-mono ${
                        isEscalated
                          ? 'text-[#E8342A]'
                          : isResolved
                          ? 'text-[#C6613F]'
                          : isReopened
                          ? 'text-[#ff7e54]'
                          : 'text-amber-400'
                      }`}
                    >
                      {caseDetail.residualRiskScore}
                      <span className="text-sm font-normal text-zinc-500">/100</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      Actionable incident score determining protective actions and SOC escalation tier.
                    </p>
                  </div>
                </div>
              </div>

              {/* REQUIREMENT 2 (PARTIAL EXPLANATION SPLIT FOR ARJUN OR PARTIAL CASES) */}
              {isPartialCase && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Stage 03: Explained vs. Unexplained Activity Split (Visual Dichotomy)</span>
                    </span>
                    <span className="text-xs font-mono text-zinc-500">
                      RFC-204 Authorized vs Unauthorized Touch
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Explained Activity */}
                    <div className="p-5 rounded-2xl bg-[#0e140f] border border-emerald-500/30 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Explained Activity (RFC-204 Authorized)</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                          Cleared
                        </span>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04]">
                          <span className="font-mono text-white font-semibold block">
                            Weights & Biases 70B Checkpoint Export
                          </span>
                          <span className="text-zinc-400 text-[11px] block mt-1">
                            Model artifact sync required for quantization study; covered under active sprint ticket ML-810.
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04]">
                          <span className="font-mono text-white font-semibold block">
                            Private Fork of migration-repo
                          </span>
                          <span className="text-zinc-400 text-[11px] block mt-1">
                            Created under authorized academic handle for internal GPU cluster benchmarking.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Unexplained Activity */}
                    <div className="p-5 rounded-2xl bg-[#160d0d] border border-[#E8342A]/40 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between pb-3 border-b border-[#E8342A]/20">
                        <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase">
                          <AlertOctagon className="w-4 h-4" />
                          <span>Unexplained Divergence (Unauthorized Access)</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E8342A]/20 text-[#E8342A] font-bold">
                          Hold Active
                        </span>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div className="p-3.5 rounded-xl bg-black/50 border border-amber-500/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-white font-bold block">
                              Restricted finance-archive Touch
                            </span>
                            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                              07:44 UTC
                            </span>
                          </div>
                          <span className="text-zinc-300 text-[11px] block leading-relaxed">
                            Unexpected read touch against finance quarterly cold storage. Outside ML modeling scope. Zero matching Jira tickets found.
                          </span>
                          <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 text-[10px] font-mono text-amber-300">
                            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>🔒 Protective hold active — export blocked immediately, pending review</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 03/04: INCIDENT HYPOTHESIS & 7-DAY RESIDUAL VELOCITY (Side-by-side on wide screens) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hypothesis Box */}
                <div className="p-6 rounded-2xl bg-[#0c0c12] border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                      Incident Hypothesis & Primary Vector
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      Bayesian Evaluation
                    </span>
                  </div>

                  <p className="text-sm text-zinc-200 leading-relaxed font-sans">
                    {entity.summary}
                  </p>

                  {entity.accessVector && (
                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center gap-3 text-xs font-mono text-zinc-300">
                      <Terminal className="w-4 h-4 text-[#C6613F] shrink-0" />
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase block">Primary Access Vector</span>
                        <span className="text-white font-semibold">{entity.accessVector}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 7-Day Residual Velocity Chart */}
                <div className="p-6 rounded-2xl bg-[#0c0c12] border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                        7-Day Residual Risk Velocity
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        Trajectory leading to current disposition
                      </span>
                    </div>
                    <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-lg border border-white/[0.06]">
                      Last active {entity.lastActive}
                    </span>
                  </div>

                  <div className="py-2">
                    <Sparkline
                      data={entity.timelineSparkline}
                      color={accentColor}
                      height={90}
                    />
                  </div>
                </div>
              </div>

              {/* HIGH-WATER EVIDENCE SIGNALS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    High-Water Evidence Signals (Top Telemetry Points)
                  </span>
                  <button
                    onClick={() => setActiveTab('events')}
                    className="text-xs font-mono text-[#C6613F] hover:text-[#ff7e54] cursor-pointer flex items-center gap-1.5 transition-colors font-medium"
                  >
                    <span>Inspect full forensic evidence tab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {caseDetail.timelineEvents.slice(0, 3).map((ev) => {
                    const isSystemAction = ev.isSystemAction;

                    return (
                      <div
                        key={ev.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-colors ${
                          isSystemAction
                            ? 'bg-[#181109]/90 border-amber-500/40 shadow-sm'
                            : 'bg-[#0c0c12] border-white/[0.06] hover:border-white/[0.12]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                                isSystemAction
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : ev.severity === 'critical'
                                  ? 'bg-[#E8342A]/20 text-[#E8342A]'
                                  : 'bg-zinc-800 text-zinc-300'
                              }`}
                            >
                              {ev.severity.toUpperCase()}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">
                              {ev.timestamp}
                            </span>
                          </div>

                          <h4 className="text-xs font-mono font-semibold text-white leading-snug">
                            {ev.event}
                          </h4>
                          <p className="text-[11px] text-zinc-400 mt-1.5 line-clamp-3 leading-relaxed font-sans">
                            {ev.details}
                          </p>
                        </div>

                        {ev.resource && (
                          <div className="pt-2 border-t border-white/[0.06]">
                            <ResourceBadgeChip resource={ev.resource} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHIFT MAP (Centerpiece Visualizer) */}
          {activeTab === 'shiftmap' && (
            <ShiftMapGraph
              data={
                caseDetail.shiftMap || {
                  nodes: [
                    { id: `${entity.id}-ident`, label: `${entity.id}@corp`, type: 'identity' },
                    { id: `${entity.id}-res`, label: 'Corporate Workstation', type: 'resource' },
                  ],
                  edges: [
                    {
                      from: `${entity.id}-ident`,
                      to: `${entity.id}-res`,
                      status: entity.classification || 'explained',
                      timestamp: 'Today, 02:00 UTC',
                    },
                  ],
                  change_point_timestamp: 'Today, 02:00 UTC',
                }
              }
              actorName={entity.name}
            />
          )}

          {/* TAB 3: EVIDENCE EVENTS (Distinct, Legible Cards with Type Icons) */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              {/* Evidence Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-900/90 border border-white/[0.08] text-xs font-mono">
                  <button
                    onClick={() => setEvidenceFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      evidenceFilter === 'all'
                        ? 'bg-zinc-800 text-white font-medium'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    All Evidence ({caseDetail.timelineEvents.length})
                  </button>
                  <button
                    onClick={() => setEvidenceFilter('high')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      evidenceFilter === 'high'
                        ? 'bg-zinc-800 text-white font-medium'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    High / Critical Severity
                  </button>
                  <button
                    onClick={() => setEvidenceFilter('unexplained')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      evidenceFilter === 'unexplained'
                        ? 'bg-[#E8342A]/20 text-[#E8342A] font-medium'
                        : 'text-zinc-400 hover:text-[#E8342A]'
                    }`}
                  >
                    Unexplained Only
                  </button>
                  <button
                    onClick={() => setEvidenceFilter('system')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      evidenceFilter === 'system'
                        ? 'bg-amber-500/20 text-amber-300 font-medium'
                        : 'text-zinc-400 hover:text-amber-300'
                    }`}
                  >
                    System Actions
                  </button>
                </div>

                <span className="text-xs font-mono text-zinc-500">
                  Showing {filteredEvents.length} of {caseDetail.timelineEvents.length} items
                </span>
              </div>

              {/* Distinct Evidence Cards */}
              <div className="grid grid-cols-1 gap-3.5">
                {filteredEvents.map((ev, index) => {
                  const isSystemAction = ev.isSystemAction;
                  const statusBadge = getEventStatusBadge(ev);

                  return (
                    <div
                      key={ev.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isSystemAction
                          ? 'bg-[#181109]/95 border-amber-500/50 shadow-md shadow-amber-950/20'
                          : 'bg-[#0c0c12] border-white/[0.08] hover:border-white/[0.16]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                              isSystemAction
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                : 'bg-zinc-900 border-white/[0.08] text-zinc-300'
                            }`}
                          >
                            {getEvidenceIcon(ev)}
                          </div>

                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                              Telemetry Source: {ev.source}
                            </span>
                            <h3
                              className={`text-sm font-mono font-bold ${
                                isSystemAction ? 'text-amber-300' : 'text-white'
                              }`}
                            >
                              {ev.event}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border ${statusBadge.className}`}
                          >
                            {statusBadge.label}
                          </span>

                          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-white/[0.06]">
                            {ev.severity}
                          </span>

                          <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 ml-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{ev.timestamp}</span>
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 space-y-3">
                        <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                          {ev.details}
                        </p>

                        {/* Resource chip with protective hold */}
                        {ev.resource && (
                          <div className="pt-2 border-t border-white/[0.04]">
                            <ResourceBadgeChip resource={ev.resource} />
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1">
                          <div className="flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5 text-[#C6613F]" />
                            <span>Vector: {ev.vector}</span>
                          </div>
                          <span className="text-zinc-500">ID: {ev.id}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CONTEXT LEDGER (Coverage Decomposition Matrix) */}
          {activeTab === 'context' && (
            <div className="space-y-8">
              {/* REQUIREMENT 5: Direct Visualization of WHY Context Coverage is 16% */}
              <div className="p-6 rounded-2xl bg-[#0c0c12] border border-white/[0.08] shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                        Context Coverage Decomposition
                      </span>
                    </div>
                    <h3 className="text-base font-mono font-bold text-white mt-1">
                      Evidence-to-Grant Correlation Matrix
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 font-sans leading-relaxed">
                      Explains the mathematical derivation of the <strong>{caseDetail.contextCoverageScore}%</strong> context coverage score by evaluating each observed telemetry action against valid organizational grants.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/50 border border-white/[0.08] font-mono text-right shrink-0">
                    <span className="text-[10px] text-zinc-500 uppercase block">Calculated Coverage</span>
                    <span className="text-2xl font-bold text-emerald-400">
                      {caseDetail.contextCoverageScore}%
                    </span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">
                      {coveredCount} of {totalCount} actions covered
                    </span>
                  </div>
                </div>

                {/* Visual Math Decomposition Bar */}
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-zinc-950 rounded-full overflow-hidden flex border border-white/[0.08]">
                    <div
                      style={{ width: `${caseDetail.contextCoverageScore}%` }}
                      className="h-full bg-emerald-500"
                      title={`Covered Actions: ${caseDetail.contextCoverageScore}%`}
                    />
                    <div
                      style={{ width: `${100 - caseDetail.contextCoverageScore}%` }}
                      className="h-full bg-rose-500/30"
                      title={`Uncovered Divergence: ${100 - caseDetail.contextCoverageScore}%`}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                    <span className="text-emerald-400 font-medium">
                      Covered: {coveredCount} action ({caseDetail.contextCoverageScore}%)
                    </span>
                    <span className="text-rose-400 font-medium">
                      Uncovered: {totalCount - coveredCount} actions ({100 - caseDetail.contextCoverageScore}%)
                    </span>
                  </div>
                </div>

                {/* Mapped Action Rows */}
                <div className="space-y-2 pt-2">
                  {coverageItems.map((item, idx) => (
                    <div
                      key={`cov-${idx}`}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono transition-colors ${
                        item.isCovered
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-zinc-200'
                          : 'bg-rose-950/20 border-rose-500/30 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                            item.isCovered
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {item.isCovered ? (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          ) : (
                            <X className="w-3.5 h-3.5 stroke-[3]" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <span className="font-semibold text-white block truncate">
                            {item.event}
                          </span>
                          <span className="text-[10px] text-zinc-400 block mt-0.5">
                            {item.reason}
                          </span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            item.isCovered
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {item.isCovered ? 'Covered' : 'Not Covered'}
                        </span>
                        <span className="text-[10px] text-zinc-400 block mt-1">
                          Grant: {item.grant}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched Context Grants Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span className="uppercase tracking-wider font-semibold">
                    Organizational Context Grants ({caseDetail.contextLedger.length})
                  </span>
                  <span>Validity & Scope Checks</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {caseDetail.contextLedger.map((item) => {
                    const isValid = item.status === 'valid';

                    return (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl bg-[#0c0c12] border border-white/[0.08] space-y-3.5 shadow-md"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                            {item.type}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              isValid
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}
                          >
                            {isValid ? <FileCheck2 className="w-3.5 h-3.5" /> : <FileX2 className="w-3.5 h-3.5" />}
                            <span>{item.status}</span>
                          </span>
                        </div>

                        <h4 className="text-sm font-mono font-bold text-white">
                          {item.title}
                        </h4>

                        <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                          {item.note}
                        </p>

                        {/* Validity Timeline Bar */}
                        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04] space-y-1.5 font-mono text-xs">
                          <div className="flex items-center justify-between text-[10px] text-zinc-400">
                            <span>Valid: 2026-09-01 00:00 UTC</span>
                            <span>Expires: 2026-09-30 23:59 UTC</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#C6613F] h-full w-[45%]" />
                          </div>
                          <span className="text-[10px] text-zinc-500 block text-right">
                            45% elapsed • 16 days remaining
                          </span>
                        </div>

                        {/* Resource badge chip on context ledger item */}
                        {item.resource && (
                          <div className="pt-2 border-t border-white/[0.04]">
                            <ResourceBadgeChip resource={item.resource} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COUNTERFACTUALS (Stepped Waterfall & What-If Sandbox) */}
          {activeTab === 'counterfactual' && (
            <CounterfactualWaterfall
              counterfactual={
                caseDetail.counterfactualWaterfall || {
                  current_risk: caseDetail.residualRiskScore,
                  deltas: [
                    {
                      label: 'Without Anomalous Access Factor',
                      risk_without: Math.round(caseDetail.residualRiskScore * 0.5),
                      factor_type: 'Baseline Shift',
                      impact_description: 'Removes anomalous telemetry volume outside baseline window',
                    },
                  ],
                }
              }
              scenarios={caseDetail.counterfactuals}
            />
          )}
        </div>
      </main>
    </div>
  );
}
