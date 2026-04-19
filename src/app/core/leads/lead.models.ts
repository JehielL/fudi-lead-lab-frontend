export type PipelineStatus =
  | 'DETECTED'
  | 'REVIEWED'
  | 'QUALIFIED'
  | 'CONTACTED'
  | 'CONVERTED'
  | 'PAUSED'
  | 'DISCARDED';

export type EnrichmentStatus = 'pending' | 'running' | 'completed' | 'failed';

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
  enrichmentStatus: EnrichmentStatus;
  lastEnrichedAt?: string | null;
  lastEnrichmentError?: string | null;
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

export interface PageSnapshot {
  id: string;
  leadId: string;
  url: string;
  snapshotType: string;
  httpStatus?: number | null;
  contentType?: string | null;
  title?: string | null;
  metaDescription?: string | null;
  textExtract?: string | null;
  htmlArtifactPath?: string | null;
  capturedAt: string;
}

export interface FeatureSnapshot {
  id: string;
  leadId: string;
  version: number;
  features: Record<string, unknown>;
  derivedSignals: Record<string, unknown>;
  createdAt: string;
  sourceSnapshotIds: string[];
}

export interface LeadEnrichmentSummary {
  leadId: string;
  status: EnrichmentStatus;
  lastEnrichedAt?: string | null;
  lastError?: string | null;
  latestFeatureSnapshot?: FeatureSnapshot | null;
  latestPageSnapshot?: PageSnapshot | null;
  score?: LeadScoreResponse | null;
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

export const enrichmentStatusLabels: Record<EnrichmentStatus, string> = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Enriched',
  failed: 'Failed',
};
