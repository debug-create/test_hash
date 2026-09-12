// EscalationToast.tsx
import React from 'react';
import { ShieldAlert, ArrowRight, X } from 'lucide-react';

interface EscalationToastProps {
  isVisible: boolean;
  onReview: () => void;
  onDismiss: () => void;
}

export function EscalationToast({ isVisible, onReview, onDismiss }: EscalationToastProps) {
  if (!isVisible) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-xl bg-[#0d0909] border border-[#E8342A]/40 shadow-2xl shadow-[#E8342A]/20 p-4 animate-in slide-in-from-top-4 fade-in duration-300 text-zinc-100"
    >
      <div className="flex items-start gap-3">
        {/* Red Icon Chrome */}
        <div className="w-8 h-8 rounded-lg bg-[#E8342A]/15 border border-[#E8342A]/30 flex items-center justify-center text-[#E8342A] shrink-0 mt-0.5">
          <ShieldAlert className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-mono font-bold text-[#E8342A] tracking-wider uppercase">
              New escalation — Case #104
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              aria-label="Dismiss escalation notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Factual, measured copy */}
          <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
            <strong className="text-white font-medium">Devraj Malhotra</strong> — residual risk{' '}
            <span className="text-[#E8342A] font-semibold font-mono">84/100</span>. Unexplained
            sensitive access detected.
          </p>

          {/* CTA Button */}
          <div className="mt-3 flex items-center justify-end">
            <button
              onClick={onReview}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-[#E8342A] text-white hover:bg-[#E8342A]/90 transition-all shadow-md shadow-[#E8342A]/20 cursor-pointer group"
            >
              <span>Review case</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
