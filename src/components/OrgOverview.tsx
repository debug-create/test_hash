// OrgOverview.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Entity, CaseStatus } from '../types';
import { ComparisonStrip } from './ComparisonStrip';
import { StatusBadge } from './StatusBadge';
import { ContextualizedDrawer } from './ContextualizedDrawer';
import { EscalationToast } from './EscalationToast';
import { CaseDetailDrawer } from './CaseDetailDrawer';
import { ThreatMap } from './ThreatMap';
import {
  Bell,
  Shield,
  Layers,
  Search,
  ArrowUpRight,
  Server,
  Database,
  ShieldAlert,
  Code2,
  Boxes,
  Scale,
  Activity,
  CheckCircle2,
  Globe,
  MapPin,
  Flame,
  Lock,
  Zap,
} from 'lucide-react';

interface OrgOverviewProps {
  entities: Entity[];
  onNavigateHome: () => void;
  onUpdateEntityCaseStatus: (entityId: string, status: CaseStatus) => void;
  onNavigateToCase?: (caseId: string) => void;
  initialView?: 'topology' | 'threat-map';
}

// Department metadata with refined iconography and colors
const DEPARTMENT_META: Record<
  string,
  { icon: React.ReactNode; color: string; label: string }
> = {
  'Core Infrastructure': {
    icon: <Server className="w-3.5 h-3.5" />,
    color: '#38BDF8',
    label: 'Core Infrastructure',
  },
  'Data & Analytics': {
    icon: <Database className="w-3.5 h-3.5" />,
    color: '#A78BFA',
    label: 'Data & Analytics',
  },
  'Security Ops': {
    icon: <ShieldAlert className="w-3.5 h-3.5" />,
    color: '#F43F5E',
    label: 'Security Operations',
  },
  Frontend: {
    icon: <Code2 className="w-3.5 h-3.5" />,
    color: '#34D399',
    label: 'Frontend Engineering',
  },
  Product: {
    icon: <Boxes className="w-3.5 h-3.5" />,
    color: '#FBBF24',
    label: 'Product & Design',
  },
  'Finance & Legal': {
    icon: <Scale className="w-3.5 h-3.5" />,
    color: '#94A3B8',
    label: 'Finance & Legal',
  },
};

export function OrgOverview({
  entities,
  onNavigateHome,
  onUpdateEntityCaseStatus,
  onNavigateToCase,
  initialView = 'threat-map',
}: OrgOverviewProps) {
  // View mode switcher: 'threat-map' | 'topology'
  const [activeView, setActiveView] = useState<'topology' | 'threat-map'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      if (viewParam === 'topology') return 'topology';
      if (viewParam === 'threat-map' || viewParam === 'map') return 'threat-map';
    }
    return initialView;
  });

  // Notification system states: exactly 1.2s delay on every mount
  const [toastVisible, setToastVisible] = useState(false);
  const [hasEscalationFired, setHasEscalationFired] = useState(false);
  const [isBellPulsing, setIsBellPulsing] = useState(false);
  const [notificationBellOpen, setNotificationBellOpen] = useState(false);

  // Selected Entity for Right-Side Slide-in Drawer
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Contextualized silent drawer
  const [isContextualizedDrawerOpen, setIsContextualizedDrawerOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Exact 1.2-second demo sequence timer on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setToastVisible(true);
      setHasEscalationFired(true);
      setIsBellPulsing(true);

      // Stop pulse after animation completes
      const pulseTimeout = setTimeout(() => {
        setIsBellPulsing(false);
      }, 1600);

      return () => clearTimeout(pulseTimeout);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Sync URL when switching views
  const handleSwitchView = (view: 'topology' | 'threat-map') => {
    setActiveView(view);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', view);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Check if any entity is currently escalated
  const hasEscalatedEntity = useMemo(() => {
    return entities.some(
      (e) => e.riskLevel === 'escalated' || e.caseStatus === 'Open'
    );
  }, [entities]);

  // Bell badge count: Requirement is EXACTLY 1 after escalation fires
  const notificationCount = hasEscalationFired ? 1 : 0;

  // Currently open entity for the drawer
  const activeDrawerEntity = useMemo(() => {
    if (!selectedEntityId) return null;
    return entities.find((e) => e.id === selectedEntityId) || null;
  }, [entities, selectedEntityId]);

  // Filtered entities for topology view
  const filteredEntities = useMemo(() => {
    return entities.filter((entity) => {
      const matchesSearch =
        entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.location?.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept =
        selectedDepartment === 'all' || entity.department === selectedDepartment;

      return matchesSearch && matchesDept;
    });
  }, [entities, searchQuery, selectedDepartment]);

  // Grouped departments
  const departments = [
    'Core Infrastructure',
    'Data & Analytics',
    'Security Ops',
    'Frontend',
    'Product',
    'Finance & Legal',
  ] as const;

  // Handle clicking on any entity node (cards in comparison strip or topology grid)
  const handleOpenEntityCase = (entityId: string) => {
    if (onNavigateToCase) {
      onNavigateToCase(entityId);
    } else {
      setSelectedEntityId(entityId);
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] text-zinc-100 font-sans selection:bg-[#C6613F]/30 selection:text-white">
      {/* 1. Page Header with View Switcher & Notification Bell */}
      <header className="sticky top-0 z-40 bg-[#060608]/90 border-b border-white/[0.06] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand + Navigation Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 group outline-none cursor-pointer"
              title="Return to FABLE Home"
            >
              <div className="w-7 h-7 rounded-lg bg-[#C6613F]/15 border border-[#C6613F]/30 flex items-center justify-center text-[#C6613F] group-hover:border-[#C6613F] transition-colors">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-wider text-white group-hover:text-[#C6613F] transition-colors">
                FABLE
              </span>
            </button>

            <span className="text-zinc-600 font-mono text-xs">/</span>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-300 font-medium">SOC Console</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
                {entities.length} nodes
              </span>
            </div>
          </div>

          {/* Center: View Switcher (Topology Matrix vs Threat Map) */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-900/90 border border-white/[0.08] text-xs font-mono shadow-inner">
            <button
              onClick={() => handleSwitchView('threat-map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === 'threat-map'
                  ? 'bg-[#C6613F] text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Threat Map</span>
              {hasEscalatedEntity && (
                <span className="w-2 h-2 rounded-full bg-[#E8342A] animate-pulse" />
              )}
            </button>

            <button
              onClick={() => handleSwitchView('topology')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === 'topology'
                  ? 'bg-[#C6613F] text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Org Topology</span>
            </button>
          </div>

          {/* Right: Actions, Contextualized Drawer trigger, Notification Bell */}
          <div className="flex items-center gap-3">
            {/* Contextualized / Under Review Trigger Button */}
            <button
              onClick={() => setIsContextualizedDrawerOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono bg-white/[0.02] border border-amber-500/20 text-amber-300/90 hover:text-amber-200 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all cursor-pointer"
              title="View quiet contextualized anomalies (alert budget thesis)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="hidden sm:inline">Contextualized</span>
              <span className="text-[10px] text-amber-400/80">(3)</span>
            </button>

            {/* Notification Bell with Badge & Reacting Pulse */}
            <div className="relative">
              <button
                id="escalation-notification-bell"
                onClick={() => setNotificationBellOpen(!notificationBellOpen)}
                className={`relative p-2 rounded-lg border transition-all cursor-pointer ${
                  notificationBellOpen
                    ? 'bg-zinc-800/90 border-white/20 text-white'
                    : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-zinc-100 hover:border-white/[0.15]'
                } ${isBellPulsing ? 'animate-bell-pulse border-[#E8342A]/80 text-[#E8342A]' : ''}`}
                aria-label="Escalation alerts"
              >
                <Bell className={`w-4 h-4 ${isBellPulsing ? 'text-[#E8342A]' : ''}`} />
                {notificationCount > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E8342A] text-white text-[10px] font-mono font-bold flex items-center justify-center shadow-md shadow-[#E8342A]/40 ${
                      isBellPulsing ? 'animate-ping' : ''
                    }`}
                  >
                    {notificationCount}
                  </span>
                )}
              </button>

              {/* Bell Dropdown */}
              {notificationBellOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#09090d] border border-white/[0.1] shadow-2xl p-4 z-50 text-xs font-sans animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] mb-3">
                    <span className="font-mono uppercase text-[11px] font-semibold text-zinc-300">
                      System Escalations
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {notificationCount} Active
                    </span>
                  </div>

                  {hasEscalationFired ? (
                    <div
                      onClick={() => {
                        setNotificationBellOpen(false);
                        handleOpenEntityCase('devraj');
                      }}
                      className="p-3 rounded-lg bg-[#140b0b] border border-[#E8342A]/30 hover:border-[#E8342A] hover:bg-[#1a0e0e] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-[#E8342A] mb-1">
                        <span>Case #104 — Escalation</span>
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-[11px] text-zinc-300 leading-snug">
                        <strong>Devraj Malhotra</strong>: Residual risk 84/100. Unexplained sensitive access detected.
                      </p>
                      <div className="mt-2 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                        <span>Bangalore Hub • SSH Bastion bypass</span>
                        <span className="text-[#C6613F] font-medium">Open Case →</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-zinc-400 font-mono text-xs">
                      No active escalations. System calm.
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-white/[0.04] text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                    <span>Alert Budget: Strict</span>
                    <span>Zero blip notifications</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* VIEW 1: GLOBAL THREAT MAP */}
        {activeView === 'threat-map' ? (
          <ThreatMap
            entities={entities}
            onOpenCaseDetail={handleOpenEntityCase}
            onUpdateEntityStatus={onUpdateEntityCaseStatus}
          />
        ) : (
          /* VIEW 2: ORG TOPOLOGY & COMPARISON STRIP */
          <div className="space-y-10">
            {/* Section Header: Typographic refinement without heavy bounding box */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#C6613F] mb-2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C6613F]" />
                  <span>Continuous Intent Graph</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Organization Topology
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  Real-time entity correlation engine. Strict alert budgets ensure baseline noise stays passive while genuine anomalies surface for investigation.
                </p>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center gap-2.5 self-start md:self-auto">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter entity, role, city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900/60 border border-white/[0.08] text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#C6613F]/60 transition-colors w-44 sm:w-60"
                  />
                </div>

                {/* Department filter dropdown */}
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="py-1.5 px-3 rounded-lg bg-zinc-900/60 border border-white/[0.08] text-xs text-zinc-300 focus:outline-none focus:border-[#C6613F]/60 font-mono cursor-pointer transition-colors"
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Symmetric Comparison Strip (Priya, Devraj, Arjun) */}
            <ComparisonStrip
              entities={entities}
              onSelectCase={handleOpenEntityCase}
            />

            {/* Org Topology Network / Grid View */}
            <section aria-label="Organization Topology Matrix" className="space-y-8">
              {/* Header Row without card enclosure */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C6613F]" />
                  <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
                    Entity Matrix Topology ({filteredEntities.length} Total Nodes)
                  </h2>
                </div>

                {/* Clean Legend */}
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-zinc-400" />
                    <span>Calm (Baseline)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Elevated (Passive)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#E8342A] animate-pulse" />
                    <span>Escalated (Action Req)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#C6613F]" />
                    <span>Cleared</span>
                  </div>
                </div>
              </div>

              {/* Grouped Department Grid View */}
              <div className="space-y-8">
                {departments.map((dept) => {
                  const deptEntities = filteredEntities.filter(
                    (e) => e.department === dept
                  );
                  if (deptEntities.length === 0) return null;

                  const meta = DEPARTMENT_META[dept] || {
                    icon: <Layers className="w-3.5 h-3.5" />,
                    color: '#C6613F',
                    label: dept,
                  };

                  return (
                    <div key={dept} className="space-y-3">
                      {/* Department Subheader with subtle hairline divider */}
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-1.5">
                        <div className="flex items-center gap-2 font-medium">
                          <span
                            className="w-5 h-5 rounded flex items-center justify-center border border-white/[0.06] bg-white/[0.02]"
                            style={{ color: meta.color }}
                          >
                            {meta.icon}
                          </span>
                          <span className="text-zinc-300 font-semibold tracking-wide">
                            {dept}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400">
                          {deptEntities.length} monitors
                        </span>
                      </div>

                      {/* Grid of Nodes with Staggered Fade-in Motion */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {deptEntities.map((entity, idx) => {
                          const isEscalated = entity.id === 'devraj';
                          const isSilentBlip = entity.isSilentElevated;
                          const isResolved = entity.riskLevel === 'resolved';
                          const isArjun = entity.id === 'arjun';

                          // Generate initials for avatar badge
                          const initials = entity.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2);

                          return (
                            <div
                              key={entity.id}
                              onClick={() => handleOpenEntityCase(entity.id)}
                              style={{
                                animationDelay: `${idx * 40}ms`,
                              }}
                              className={`group relative p-3.5 rounded-xl border transition-all duration-200 cursor-pointer text-left hover:-translate-y-0.5 animate-in fade-in fill-mode-both ${
                                isEscalated
                                  ? 'bg-[#120808]/90 border-[#E8342A]/40 hover:border-[#E8342A] hover:shadow-lg hover:shadow-[#E8342A]/15'
                                  : isSilentBlip
                                  ? 'bg-[#0e0d0b]/90 border-amber-500/25 hover:border-amber-500/60 hover:shadow-md hover:shadow-amber-500/10'
                                  : isResolved
                                  ? 'bg-[#0d0a09]/90 border-[#C6613F]/30 hover:border-[#C6613F]/70 hover:shadow-md hover:shadow-[#C6613F]/10'
                                  : isArjun
                                  ? 'bg-[#0f0d0b]/90 border-amber-600/35 hover:border-amber-500/70 hover:shadow-md hover:shadow-amber-500/10'
                                  : 'bg-[#09090d]/80 border-white/[0.05] hover:border-white/[0.18] hover:bg-[#0c0c12]'
                              }`}
                            >
                              {/* Top Row: Avatar Initials + Name + Status Badge */}
                              <div className="flex items-start justify-between gap-2.5 mb-2.5">
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold shrink-0 border ${
                                      isEscalated
                                        ? 'bg-[#E8342A]/15 border-[#E8342A]/35 text-[#E8342A]'
                                        : isSilentBlip
                                        ? 'bg-amber-500/15 border-amber-500/35 text-amber-300'
                                        : isResolved
                                        ? 'bg-[#C6613F]/15 border-[#C6613F]/35 text-[#C6613F]'
                                        : 'bg-white/[0.04] border-white/[0.08] text-zinc-300 group-hover:border-white/20'
                                    }`}
                                  >
                                    {initials}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-xs text-zinc-100 group-hover:text-white truncate transition-colors">
                                      {entity.name}
                                    </h3>
                                    <p className="text-[10px] text-zinc-400 truncate">
                                      {entity.role} • {entity.location?.city}
                                    </p>
                                  </div>
                                </div>

                                <StatusBadge
                                  status={entity.caseStatus}
                                  riskLevel={entity.riskLevel}
                                  riskScore={entity.riskScore}
                                  size="sm"
                                />
                              </div>

                              {/* Summary text */}
                              <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mb-3 font-sans">
                                {entity.summary}
                              </p>

                              {/* Special Protective Badges for Arjun and Devraj */}
                              {isArjun && (
                                <div className="mb-3 px-2 py-1 rounded bg-amber-950/40 border border-amber-500/35 flex items-center gap-1.5 text-[10px] font-mono text-amber-300">
                                  <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span className="truncate">finance-archive: Protective hold active</span>
                                </div>
                              )}
                              {isEscalated && entity.id === 'devraj' && (
                                <div className="mb-3 px-2 py-1 rounded bg-[#1c1209] border border-amber-500/40 flex items-center gap-1.5 text-[10px] font-mono text-amber-300">
                                  <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span className="truncate">⚡ Auto-protective hold (Tier 2)</span>
                                </div>
                              )}

                              {/* Footer Info with Arrow prompt */}
                              <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[10px] font-mono text-zinc-400">
                                <span>Active {entity.lastActive}</span>
                                <span className="flex items-center gap-1 group-hover:text-zinc-200 transition-colors">
                                  <span>Case detail</span>
                                  <ArrowUpRight className="w-3 h-3 text-[#C6613F] group-hover:translate-x-0.5 transition-transform" />
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* 3. Timed Escalation Toast (Fires at exactly 1.2s on every mount) */}
      <EscalationToast
        isVisible={toastVisible}
        onReview={() => {
          setToastVisible(false);
          handleOpenEntityCase('devraj');
        }}
        onDismiss={() => setToastVisible(false)}
      />

      {/* 4. Contextualized / Under Review Drawer (Silent Blips Drawer) */}
      <ContextualizedDrawer
        isOpen={isContextualizedDrawerOpen}
        onClose={() => setIsContextualizedDrawerOpen(false)}
        entities={entities}
        onSelectCase={(entityId) => {
          setIsContextualizedDrawerOpen(false);
          handleOpenEntityCase(entityId);
        }}
      />

      {/* 5. Slide-In Case Detail Drawer (Full Forensic Dossier & Action Buttons) */}
      {!onNavigateToCase && activeDrawerEntity && (
        <CaseDetailDrawer
          entity={activeDrawerEntity}
          isOpen={Boolean(activeDrawerEntity)}
          onClose={() => setSelectedEntityId(null)}
          onUpdateStatus={(entityId, newStatus) => {
            onUpdateEntityCaseStatus(entityId, newStatus);
          }}
        />
      )}
    </div>
  );
}
