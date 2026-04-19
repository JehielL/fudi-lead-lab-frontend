export type JobStatus = 'running' | 'completed' | 'failed';

export interface CrawlJob {
  id: string;
  jobType: string;
  status: JobStatus;
  sourceType?: string | null;
  startedAt: string;
  finishedAt?: string | null;
  triggeredBy: string;
  processedCount: number;
  createdLeadCount: number;
  updatedLeadCount: number;
  errorCount: number;
  errorMessage?: string | null;
  metadata: Record<string, unknown>;
}

export interface SourceRegistry {
  id: string;
  sourceKey: string;
  sourceType: string;
  name: string;
  isEnabled: boolean;
  priority: number;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SourceRegistryCreate {
  sourceKey: string;
  sourceType: string;
  name: string;
  isEnabled: boolean;
  priority: number;
  config: Record<string, unknown>;
}

export interface OpsSummary {
  jobsLast24h: number;
  successfulJobsLast24h: number;
  failedJobsLast24h: number;
  leadsCreatedLast24h: number;
  leadsUpdatedLast24h: number;
  activeSources: number;
  lastRun?: CrawlJob | null;
  lastError?: CrawlJob | null;
}

export interface JobRunResponse {
  job: CrawlJob;
}

export interface RawDiscoveryItem {
  id: string;
  sourceType: string;
  sourceKey: string;
  externalId?: string | null;
  sourceUrl?: string | null;
  rawPayload: Record<string, unknown>;
  normalizedPayload: Record<string, unknown>;
  processed: boolean;
  processedAt?: string | null;
  createdLeadId?: string | null;
  createdAt: string;
}

export const jobStatusLabels: Record<JobStatus, string> = {
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
};
