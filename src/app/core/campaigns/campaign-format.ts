import { CampaignStatus, CampaignTargetStatus, MessageDraftStatus, OutboxStatus } from './campaign.models';

export function campaignTone(status: CampaignStatus): 'green' | 'cyan' | 'amber' | 'coral' | 'muted' {
  if (status === 'running' || status === 'completed') {
    return 'green';
  }
  if (status === 'ready') {
    return 'cyan';
  }
  if (status === 'paused' || status === 'draft') {
    return 'amber';
  }
  return 'muted';
}

export function targetTone(status: CampaignTargetStatus): 'green' | 'cyan' | 'amber' | 'coral' | 'muted' {
  if (status === 'approved' || status === 'responded') {
    return 'green';
  }
  if (status === 'drafted' || status === 'sent') {
    return 'cyan';
  }
  if (status === 'failed') {
    return 'coral';
  }
  if (status === 'ignored') {
    return 'muted';
  }
  return 'amber';
}

export function draftTone(status: MessageDraftStatus): 'green' | 'cyan' | 'amber' | 'coral' | 'muted' {
  if (status === 'approved' || status === 'sent') {
    return 'green';
  }
  if (status === 'rejected') {
    return 'coral';
  }
  return 'cyan';
}

export function outboxTone(status: OutboxStatus): 'green' | 'cyan' | 'amber' | 'coral' | 'muted' {
  if (status === 'sent') {
    return 'green';
  }
  if (status === 'sending') {
    return 'cyan';
  }
  if (status === 'failed' || status === 'suppressed') {
    return 'coral';
  }
  if (status === 'cancelled') {
    return 'muted';
  }
  return 'amber';
}
