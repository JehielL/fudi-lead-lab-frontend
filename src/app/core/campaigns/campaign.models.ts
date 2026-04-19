import { Lead, PipelineStatus } from '../leads/lead.models';

export type CampaignStatus = 'draft' | 'ready' | 'running' | 'paused' | 'completed' | 'archived';
export type CampaignChannel = 'email' | 'manual' | 'phone' | 'dm';
export type CampaignTargetStatus = 'pending' | 'drafted' | 'approved' | 'sent' | 'responded' | 'ignored' | 'failed';
export type MessageDraftStatus = 'generated' | 'approved' | 'rejected' | 'sent';
export type MessageTemplateType = 'outreach' | 'follow_up';
export type OutboxStatus = 'queued' | 'sending' | 'sent' | 'failed' | 'cancelled' | 'suppressed';
export type SuppressionIdentityType = 'email' | 'domain';

export interface CampaignTargetCriteria {
  minPriorityScore?: number | null;
  pipelineStatus?: PipelineStatus | null;
  city?: string | null;
  district?: string | null;
  modelScored?: boolean | null;
  enrichmentAvailable?: boolean | null;
  limit: number;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string | null;
  status: CampaignStatus;
  channel: CampaignChannel;
  targetCriteria: CampaignTargetCriteria;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignCreate {
  name: string;
  description?: string | null;
  status: CampaignStatus;
  channel: CampaignChannel;
  targetCriteria: CampaignTargetCriteria;
}

export type CampaignUpdate = Partial<CampaignCreate>;

export interface CampaignTarget {
  id: string;
  campaignId: string;
  leadId: string;
  snapshotLeadScore: number;
  snapshotPipelineStatus: PipelineStatus;
  targetStatus: CampaignTargetStatus;
  inclusionReason: string[];
  includedAt: string;
  lead?: Lead | null;
}

export interface CampaignTargetSelectionResponse {
  campaignId: string;
  selectedCount: number;
  skippedCount: number;
  targets: CampaignTarget[];
}

export interface MessageTemplateCreate {
  name: string;
  channel: CampaignChannel;
  templateType: MessageTemplateType;
  subjectTemplate?: string | null;
  bodyTemplate: string;
  variables: string[];
  isActive: boolean;
}

export interface MessageTemplate extends MessageTemplateCreate {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageDraft {
  id: string;
  campaignId: string;
  leadId: string;
  templateId: string;
  channel: CampaignChannel;
  subject?: string | null;
  body: string;
  draftStatus: MessageDraftStatus;
  generationReason: string[];
  createdAt: string;
  updatedAt: string;
  lead?: Lead | null;
  template?: MessageTemplate | null;
}

export interface MessageDraftUpdate {
  subject?: string | null;
  body?: string;
  draftStatus?: MessageDraftStatus;
}

export interface CampaignEvent {
  id: string;
  campaignId: string;
  leadId?: string | null;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface OutboxMessage {
  id: string;
  campaignId: string;
  leadId: string;
  draftId: string;
  channel: CampaignChannel;
  to?: string | null;
  subject?: string | null;
  body: string;
  status: OutboxStatus;
  scheduledAt?: string | null;
  sentAt?: string | null;
  lastError?: string | null;
  attemptCount: number;
  createdAt: string;
  updatedAt: string;
  lead?: Lead | null;
}

export interface SendAttempt {
  id: string;
  outboxMessageId: string;
  attemptNumber: number;
  provider: string;
  status: OutboxStatus;
  responseMetadata: Record<string, unknown>;
  errorMessage?: string | null;
  createdAt: string;
}

export interface DeliveryEvent {
  id: string;
  outboxMessageId: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface OutboxDetail {
  message: OutboxMessage;
  attempts: SendAttempt[];
  events: DeliveryEvent[];
}

export interface CampaignSendResponse {
  campaignId: string;
  queuedCount: number;
  sentCount: number;
  failedCount: number;
  suppressedCount: number;
  messages: OutboxMessage[];
}

export interface SuppressionCreate {
  identityType: SuppressionIdentityType;
  identityValue: string;
  reason: string;
}

export interface SuppressionEntry extends SuppressionCreate {
  id: string;
  createdAt: string;
}

export const campaignStatusLabels: Record<CampaignStatus, string> = {
  draft: 'Draft',
  ready: 'Ready',
  running: 'Running',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived',
};

export const campaignChannelLabels: Record<CampaignChannel, string> = {
  email: 'Email',
  manual: 'Manual',
  phone: 'Phone',
  dm: 'DM',
};

export const campaignTargetStatusLabels: Record<CampaignTargetStatus, string> = {
  pending: 'Pending',
  drafted: 'Drafted',
  approved: 'Approved',
  sent: 'Sent',
  responded: 'Responded',
  ignored: 'Ignored',
  failed: 'Failed',
};

export const messageDraftStatusLabels: Record<MessageDraftStatus, string> = {
  generated: 'Generated',
  approved: 'Approved',
  rejected: 'Rejected',
  sent: 'Sent',
};

export const outboxStatusLabels: Record<OutboxStatus, string> = {
  queued: 'Queued',
  sending: 'Sending',
  sent: 'Sent',
  failed: 'Failed',
  cancelled: 'Cancelled',
  suppressed: 'Suppressed',
};
