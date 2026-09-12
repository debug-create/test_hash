// caseHooks.ts
import { useState, useCallback, useMemo } from 'react';
import {
  Entity,
  CaseStatus,
  Case,
  Counterfactual,
  ShiftMapData,
  ContextLedgerItem,
  CounterfactualScenario,
} from './types';
import { INITIAL_ENTITIES } from './data';
import {
  MOCK_CASES,
  MOCK_COUNTERFACTUALS,
  MOCK_SHIFTMAPS,
  getOrCreateCaseDetail,
} from './caseData';

// ----------------------------------------------------------------------------
// 1. useEntities: Master entities directory and status mutation hook
// ----------------------------------------------------------------------------
export function useEntities() {
  const [entities, setEntities] = useState<Entity[]>(INITIAL_ENTITIES);

  const getEntityById = useCallback(
    (id: string) => {
      const query = id.toLowerCase();
      return entities.find(
        (e) => e.id.toLowerCase() === query || e.caseId?.toLowerCase() === query
      );
    },
    [entities]
  );

  const updateEntityCaseStatus = useCallback(
    (id: string, status: CaseStatus) => {
      setEntities((prev) =>
        prev.map((item) => {
          if (item.id.toLowerCase() === id.toLowerCase()) {
            return {
              ...item,
              caseStatus: status,
              riskLevel:
                status === 'Cleared'
                  ? 'resolved'
                  : status === 'Access Revoked'
                  ? 'resolved'
                  : status === 'Reviewing'
                  ? 'elevated'
                  : status === 'Reopened'
                  ? 'elevated'
                  : status === 'Open'
                  ? 'escalated'
                  : item.riskLevel,
            };
          }
          return item;
        })
      );
    },
    []
  );

  // Helper to simulate an autonomous auto-reopen event (ADDITION 3)
  const triggerAutoReopen = useCallback(
    (id: string, customReason?: string) => {
      const nowStr = 'Today, 08:14 UTC';
      const reason =
        customReason ||
        'Reopened — new activity on Today, 08:14 UTC falls outside the scope of the previously approved change record.';
      setEntities((prev) =>
        prev.map((item) => {
          if (item.id.toLowerCase() === id.toLowerCase()) {
            return {
              ...item,
              caseStatus: 'Reopened',
              riskLevel: 'elevated',
              reopenNotice: reason,
              summary: `Autonomous Reopen: ${reason}`,
            };
          }
          return item;
        })
      );
    },
    []
  );

  return {
    entities,
    getEntityById,
    updateEntityCaseStatus,
    triggerAutoReopen,
  };
}

// ----------------------------------------------------------------------------
// 2. useCase: Single case query hook conforming to standard Case contract:
//    { id, actor_id, created_at, status, raw_deviation, context_coverage,
//      residual_risk, confidence, data_quality, primary_cause, evidence: string[],
//      matched_context_ids: string[], unmatched_behavior: string[] }
// ----------------------------------------------------------------------------
export function useCase(caseIdOrActorId: string) {
  const { entities, updateEntityCaseStatus } = useEntities();

  const entity = useMemo(() => {
    return (
      entities.find(
        (e) =>
          e.caseId === caseIdOrActorId ||
          e.id.toLowerCase() === caseIdOrActorId.toLowerCase()
      ) || entities[0]
    );
  }, [entities, caseIdOrActorId]);

  const caseData: Case = useMemo(() => {
    // 1. Direct match in registry
    if (MOCK_CASES[caseIdOrActorId]) {
      const base = MOCK_CASES[caseIdOrActorId];
      return {
        ...base,
        case_status: entity.caseStatus || base.case_status,
      };
    }

    // 2. Match by entity's caseId
    if (entity.caseId && MOCK_CASES[entity.caseId]) {
      const base = MOCK_CASES[entity.caseId];
      return {
        ...base,
        case_status: entity.caseStatus || base.case_status,
      };
    }

    // 3. Fallback synthesis conforming strictly to contract
    const detail = getOrCreateCaseDetail(
      entity.id,
      entity.name,
      entity.role,
      entity.department,
      entity.riskScore
    );

    return {
      id: entity.caseId || '104',
      actor_id: entity.id,
      created_at: '2026-09-12T00:00:00Z',
      status:
        entity.classification ||
        (entity.riskScore >= 70
          ? 'unexplained'
          : entity.riskScore >= 45
          ? 'partial'
          : 'explained'),
      case_status: entity.caseStatus || 'Open',
      raw_deviation: detail.rawDeviationScore,
      context_coverage: detail.contextCoverageScore,
      residual_risk: detail.residualRiskScore,
      confidence: 85,
      data_quality: 'high',
      primary_cause: detail.initialDriftPattern,
      evidence: detail.timelineEvents.map((ev) => ev.event),
      matched_context_ids: detail.contextLedger
        .filter((c) => c.status === 'valid')
        .map((c) => c.id),
      unmatched_behavior: detail.contextLedger
        .filter((c) => c.status === 'unmatched')
        .map((c) => c.title),
    };
  }, [caseIdOrActorId, entity]);

  const updateStatus = useCallback(
    (newStatus: CaseStatus) => {
      updateEntityCaseStatus(entity.id, newStatus);
    },
    [entity.id, updateEntityCaseStatus]
  );

  return {
    caseData,
    entity,
    loading: false,
    error: null,
    updateStatus,
  };
}

// ----------------------------------------------------------------------------
// 3. useCases: List of all active cases
// ----------------------------------------------------------------------------
export function useCases() {
  const cases = useMemo(() => {
    return Object.values(MOCK_CASES);
  }, []);

  return {
    cases,
    loading: false,
    error: null,
  };
}

// ----------------------------------------------------------------------------
// 4. useContextLedger: Attenuation context items & coverage score
// ----------------------------------------------------------------------------
export function useContextLedger(caseIdOrActorId: string) {
  const ledgerData = useMemo(() => {
    const detail = getOrCreateCaseDetail(
      caseIdOrActorId,
      'Target Entity',
      'Engineer',
      'Core Infrastructure',
      50
    );

    return {
      items: detail.contextLedger as ContextLedgerItem[],
      coverageScore: detail.contextCoverageScore,
    };
  }, [caseIdOrActorId]);

  return {
    items: ledgerData.items,
    coverageScore: ledgerData.coverageScore,
    loading: false,
  };
}

// ----------------------------------------------------------------------------
// 5. useCounterfactual: Returns { current_risk, deltas: [{label, risk_without}] }
// ----------------------------------------------------------------------------
export function useCounterfactual(caseIdOrActorId: string) {
  const counterfactual: Counterfactual = useMemo(() => {
    if (MOCK_COUNTERFACTUALS[caseIdOrActorId]) {
      return MOCK_COUNTERFACTUALS[caseIdOrActorId];
    }
    const detail = getOrCreateCaseDetail(
      caseIdOrActorId,
      'Target',
      'Engineer',
      'Core Infrastructure',
      60
    );
    return (
      detail.counterfactualWaterfall || {
        current_risk: detail.residualRiskScore,
        deltas: [
          {
            label: 'Without Anomalous Activity',
            risk_without: Math.round(detail.residualRiskScore * 0.5),
          },
        ],
      }
    );
  }, [caseIdOrActorId]);

  const scenarios: CounterfactualScenario[] = useMemo(() => {
    const detail = getOrCreateCaseDetail(
      caseIdOrActorId,
      'Target',
      'Engineer',
      'Core Infrastructure',
      60
    );
    return detail.counterfactuals;
  }, [caseIdOrActorId]);

  return {
    counterfactual,
    scenarios,
    loading: false,
  };
}

// ----------------------------------------------------------------------------
// 6. useShiftMap: Horizontal time-axis evidence graph data
//    { nodes, edges: [{from, to, status, timestamp}], change_point_timestamp }
// ----------------------------------------------------------------------------
export function useShiftMap(caseIdOrActorId: string) {
  const shiftMapData: ShiftMapData = useMemo(() => {
    if (MOCK_SHIFTMAPS[caseIdOrActorId]) {
      return MOCK_SHIFTMAPS[caseIdOrActorId];
    }
    const detail = getOrCreateCaseDetail(
      caseIdOrActorId,
      'Target',
      'Engineer',
      'Core Infrastructure',
      60
    );
    return (
      detail.shiftMap || {
        nodes: [
          { id: 'ident-1', label: 'Identity', type: 'identity' },
          { id: 'res-1', label: 'Resource Target', type: 'resource' },
        ],
        edges: [
          {
            from: 'ident-1',
            to: 'res-1',
            status: 'explained',
            timestamp: 'Today, 02:00 UTC',
          },
        ],
        change_point_timestamp: 'Today, 02:00 UTC',
      }
    );
  }, [caseIdOrActorId]);

  return {
    shiftMapData,
    loading: false,
  };
}
