// StatusBadge.tsx
import React from 'react';
import { CaseStatus, RiskLevel, BehaviorClassification } from '../types';
import { Check, Clock, Lock, AlertCircle, RotateCcw, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status?: CaseStatus;
  riskLevel: RiskLevel;
  riskScore: number;
  classification?: BehaviorClassification;
  size?: 'sm' | 'md';
}

export function StatusBadge({
  status,
  riskLevel,
  riskScore,
  classification,
  size = 'sm',
}: StatusBadgeProps) {
  // ADDITION 1: Indeterminate classification (neutral/grey treatment, not red or amber)
  if (classification === 'indeterminate') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono font-medium rounded border ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } bg-zinc-800/90 border-zinc-600/60 text-zinc-300 shadow-sm`}
        title="Indeterminate: Insufficient historical evidence or context telemetry to classify"
      >
        <HelpCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>Indeterminate ({riskScore})</span>
      </span>
    );
  }

  // FIX 3: 1. Cleared (checkmark, calm desaturated terracotta - NOT green)
  if (status === 'Cleared' || riskLevel === 'resolved') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono font-medium rounded border ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } bg-[#C6613F]/10 border-[#C6613F]/30 text-[#C6613F]`}
      >
        <Check className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>Cleared</span>
      </span>
    );
  }

  // FIX 3: 2. Access Revoked (locked icon, desaturated red-adjacent, distinct from active Escalated red)
  if (status === 'Access Revoked') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono font-medium rounded border ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } bg-[#160d10] border-rose-950/70 text-rose-300/80 shadow-sm`}
      >
        <Lock className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>Access Revoked</span>
      </span>
    );
  }

  // FIX 3 / ADDITION 3: 3. Reopened (system-triggered auto-reopen)
  if (status === 'Reopened') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono font-medium rounded border ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } bg-[#1f120c] border-[#C6613F]/70 text-[#ff7e54] shadow-sm`}
        title="Autonomous System Reopen: Post-clearance anomalous drift detected"
      >
        <RotateCcw className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>Reopened (System)</span>
      </span>
    );
  }

  // FIX 3: 4. Escalated (Open) -> red
  if (riskLevel === 'escalated' || status === 'Open') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono font-medium rounded border ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } bg-[#E8342A]/10 border-[#E8342A]/30 text-[#E8342A] animate-pulse`}
      >
        <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>Escalated ({riskScore})</span>
      </span>
    );
  }

  // FIX 3: 5. Reviewing / Elevated -> amber/in-progress
  if (riskLevel === 'elevated' || status === 'Reviewing') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono font-medium rounded border ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        } bg-amber-950/40 border-amber-800/40 text-amber-400`}
      >
        <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>Reviewing</span>
      </span>
    );
  }

  // 6. Calm (Standard quiet state)
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-medium rounded border ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } bg-zinc-900/60 border-white/[0.06] text-zinc-400`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
      <span>Calm ({riskScore})</span>
    </span>
  );
}

// Standalone Risk Classification Badge
export function ClassificationBadge({
  classification,
  size = 'sm',
}: {
  classification: BehaviorClassification;
  size?: 'sm' | 'md';
}) {
  switch (classification) {
    case 'indeterminate':
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-medium rounded border ${
            size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          } bg-zinc-800/80 border-zinc-600/50 text-zinc-300`}
        >
          <HelpCircle className="w-3 h-3 text-zinc-400" />
          <span>Indeterminate</span>
        </span>
      );
    case 'explained':
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-medium rounded border ${
            size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          } bg-[#C6613F]/10 border-[#C6613F]/30 text-[#C6613F]`}
        >
          <Check className="w-3 h-3 text-[#C6613F]" />
          <span>Explained</span>
        </span>
      );
    case 'partial':
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-medium rounded border ${
            size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          } bg-amber-950/40 border-amber-800/40 text-amber-400`}
        >
          <Clock className="w-3 h-3 text-amber-400" />
          <span>Partially Explained</span>
        </span>
      );
    case 'unexplained':
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono font-medium rounded border ${
            size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
          } bg-[#E8342A]/10 border-[#E8342A]/30 text-[#E8342A]`}
        >
          <AlertCircle className="w-3 h-3 text-[#E8342A]" />
          <span>Unexplained Deviation</span>
        </span>
      );
  }
}
