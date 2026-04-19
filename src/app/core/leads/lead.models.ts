export type PipelineStatus =
  | 'DETECTED'
  | 'REVIEWED'
  | 'QUALIFIED'
  | 'CONTACTED'
  | 'CONVERTED'
  | 'PAUSED'
  | 'DISCARDED';

export interface ScoreBreakdown {
  newnessScore: number;
  digitalGapScore: number;
  fitScore: number;
  contactabilityScore: number;
  priorityScore: number;
  explanation: string[];
}

export interface Lead {
  id: string;
  schemaVersion: number;
  name: string;
  normalizedName: string;
  businessType: string;
  website?: string | null;
  instagram?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  countryCode: string;
  pipelineStatus: PipelineStatus;
  statusStageIndex: number;
  statusLabel: string;
  statusUpdatedAt: string;
  priorityScore: number;
  fitScore: number;
  confidence: number;
  scoreBreakdown: ScoreBreakdown;
  isActive: boolean;
  isDiscarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeadListResponse {
  items: Lead[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface LeadFilters {
  q?: string;
  pipelineStatus?: PipelineStatus | '';
  city?: string;
  district?: string;
  minPriorityScore?: number | null;
  maxPriorityScore?: number | null;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface LeadSource {
  id: string;
  leadId: string;
  sourceType: string;
  externalId?: string | null;
  sourceUrl?: string | null;
  capturedAt: string;
  rawMetadata: Record<string, unknown>;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  activityType: string;
  channel?: string | null;
  description: string;
  performedBy: string;
  createdAt: string;
}

export interface LeadStatusHistory {
  id: string;
  leadId: string;
  fromStatus?: PipelineStatus | null;
  toStatus: PipelineStatus;
  reason?: string | null;
  changedBy: string;
  createdAt: string;
}

export interface LeadScoreResponse {
  leadId: string;
  scoreBreakdown: ScoreBreakdown;
  priorityScore: number;
  fitScore: number;
  confidence: number;
}

export const pipelineStatusLabels: Record<PipelineStatus, string> = {
  DETECTED: 'Detected',
  REVIEWED: 'Reviewed',
  QUALIFIED: 'Qualified',
  CONTACTED: 'Contacted',
  CONVERTED: 'Converted',
  PAUSED: 'Paused',
  DISCARDED: 'Discarded',
};
