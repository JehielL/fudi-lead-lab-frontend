import { Lead } from '../leads/lead.models';

export type DedupStatus = 'open' | 'merged' | 'ignored' | 'distinct';

export interface DedupCandidate {
  id: string;
  leadIds: string[];
  clusterId?: string | null;
  score: number;
  reasons: string[];
  matchedFields: string[];
  status: DedupStatus;
  createdAt: string;
  updatedAt: string;
  leads: Lead[];
}

export interface DedupCluster {
  id: string;
  leadIds: string[];
  candidateIds: string[];
  score: number;
  status: DedupStatus;
  createdAt: string;
  updatedAt: string;
  mergedIntoLeadId?: string | null;
  leads: Lead[];
}

export interface DedupRecomputeResponse {
  candidateCount: number;
  clusterCount: number;
}

export interface MergeEvent {
  id: string;
  clusterId: string;
  primaryLeadId: string;
  mergedLeadIds: string[];
  mergedFields: Record<string, unknown>;
  performedBy: string;
  reason?: string | null;
  createdAt: string;
}

export interface DedupMergeResponse {
  cluster: DedupCluster;
  event: MergeEvent;
}

export const dedupStatusLabels: Record<DedupStatus, string> = {
  open: 'Open',
  merged: 'Merged',
  ignored: 'Ignored',
  distinct: 'Distinct',
};
