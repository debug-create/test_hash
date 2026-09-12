// ComparisonStrip.tsx
import React from 'react';
import { Entity } from '../types';
import { Sparkline } from './Sparkline';
import { ArrowRight, CheckCircle2, ShieldAlert, Clock, Lock, Sparkles, RotateCcw, HelpCircle } from 'lucide-react';

interface ComparisonStripProps {
  entities: Entity[];
  onSelectCase: (entityId: string) => void;
}

export function ComparisonStrip({ entities, onSelectCase }: ComparisonStripProps) {
  const priya = entities.find((e) => e.id === 'priya');
  const devraj = entities.find((e) => e.id === 'devraj');
  const arjun = entities.find((e) => e.id === 'arjun');

  const trio = [priya, devraj, arjun].filter(Boolean) as Entity[];

  return (
    <section className="mb-10" aria-label="Symmetric Comparison Strip">
      {/* Crisp, clean header without bounding card boxes */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-3 mb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C6613F]" />
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
            Symmetric Comparison Strip
          </h2>
        </div>
        <p className="text-[11px] font-mono text-zinc-400">
          Similar initial drift • 3 distinct contextual trajectories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trio.map((entity, index) => {
          const isEscalated = entity.id === 'devraj';
          const isResolved = entity.id === 'priya';
          const isReviewing = entity.id === 'arjun';

          // Color tokens
          const strokeColor = isEscalated
            ? '#E8342A'
            : isResolved
            ? '#C6613F'
            : '#D97706';

          const badgeConfig = (() => {
            if (entity.caseStatus === 'Reopened') {
              return {
                label: 'Reopened (System)',
                bg: 'bg-[#1f120c] border-[#C6613F]/70 text-[#ff7e54]',
                icon: <RotateCcw className="w-3.5 h-3.5" />,
              };
            }
            if (entity.classification === 'indeterminate') {
              return {
                label: 'Indeterminate',
                bg: 'bg-zinc-800 border-zinc-600 text-zinc-300',
                icon: <HelpCircle className="w-3.5 h-3.5" />,
              };
            }
            if (entity.caseStatus === 'Cleared') {
              return {
                label: 'Resolved / Cleared',
                bg: 'bg-[#C6613F]/10 border-[#C6613F]/30 text-[#C6613F]',
                icon: <CheckCircle2 className="w-3.5 h-3.5" />,
              };
            }
            if (entity.caseStatus === 'Access Revoked') {
              return {
                label: 'Access Revoked',
                bg: 'bg-[#160d10] border-rose-950/70 text-rose-300/80',
                icon: <Lock className="w-3.5 h-3.5" />,
              };
            }
            if (isEscalated) {
              return {
                label: 'Escalated • Action Req.',
                bg: 'bg-[#E8342A]/10 border-[#E8342A]/30 text-[#E8342A]',
                icon: <ShieldAlert className="w-3.5 h-3.5" />,
              };
            }
            return {
              label: 'Partially Explained',
              bg: 'bg-amber-950/30 border-amber-800/40 text-amber-400',
              icon: <Clock className="w-3.5 h-3.5" />,
            };
          })();

          // Initials for avatar
          const initials = entity.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2);

          return (
            <div
              key={entity.id}
              onClick={() => onSelectCase(entity.id)}
              className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer hover:-translate-y-0.5 ${
                isEscalated
                  ? 'bg-[#0f0909]/90 border-[#E8342A]/30 hover:border-[#E8342A] hover:shadow-lg hover:shadow-[#E8342A]/10'
                  : isResolved
                  ? 'bg-[#0a0c0e]/90 border-white/[0.08] hover:border-[#C6613F]/70 hover:shadow-lg hover:shadow-[#C6613F]/10'
                  : 'bg-[#0b0a0c]/90 border-white/[0.08] hover:border-amber-500/70 hover:shadow-lg hover:shadow-amber-500/10'
              }`}
              style={{
                animationDelay: `${index * 80}ms`,
              }}
            >
              {/* Top Row: Avatar + Name + Trajectory Badge */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 border ${
                      isEscalated
                        ? 'bg-[#E8342A]/15 border-[#E8342A]/40 text-[#E8342A]'
                        : isResolved
                        ? 'bg-[#C6613F]/15 border-[#C6613F]/40 text-[#C6613F]'
                        : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                    }`}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-zinc-100 group-hover:text-white transition-colors truncate">
                        {entity.name}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        #{entity.caseId}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">
                      {entity.role}
                    </div>
                  </div>
                </div>

                <div
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium border shrink-0 ${badgeConfig.bg}`}
                >
                  {badgeConfig.icon}
                  <span>{badgeConfig.label}</span>
                </div>
              </div>

              {/* Middle Sparkline */}
              <div className="py-2 px-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
                  <span className="text-zinc-400">7-Day Risk Velocity</span>
                  <span
                    className={`font-semibold ${
                      isEscalated
                        ? 'text-[#E8342A]'
                        : isResolved
                        ? 'text-[#C6613F]'
                        : 'text-amber-400'
                    }`}
                  >
                    Residual {entity.riskScore}/100
                  </span>
                </div>
                <Sparkline data={entity.timelineSparkline} color={strokeColor} height={42} />
              </div>

              {/* Bottom Summary & Prompt */}
              <div className="mt-2.5 pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-[11px]">
                <p className="text-zinc-400 truncate max-w-[82%] font-sans">
                  {entity.summary}
                </p>
                <div className="flex items-center gap-1 text-xs font-mono text-zinc-400 group-hover:text-zinc-100 transition-colors">
                  <span className="text-[10px]">Open case</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
