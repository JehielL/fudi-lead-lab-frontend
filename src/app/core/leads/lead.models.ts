export type PipelineStatus =
  | 'new'
  | 'reviewing'
  | 'qualified'
  | 'contacted'
  | 'won'
  | 'lost'
  | 'discarded';

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
  priorityScore: number;
  fitScore: number;
  confidence: number;
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

export const pipelineStatusLabels: Record<PipelineStatus, string> = {
  new: 'New',
  reviewing: 'Reviewing',
  qualified: 'Qualified',
  contacted: 'Contacted',
  won: 'Won',
  lost: 'Lost',
  discarded: 'Discarded',
};
