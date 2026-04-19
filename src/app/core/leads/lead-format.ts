import { PipelineStatus } from './lead.models';

export function statusTone(status: PipelineStatus): 'green' | 'cyan' | 'amber' | 'coral' | 'muted' {
  if (status === 'QUALIFIED' || status === 'CONVERTED') {
    return 'green';
  }
  if (status === 'CONTACTED' || status === 'REVIEWED') {
    return 'cyan';
  }
  if (status === 'DISCARDED') {
    return 'coral';
  }
  if (status === 'DETECTED' || status === 'PAUSED') {
    return 'amber';
  }
  return 'muted';
}

export function scoreTone(score: number): string {
  if (score >= 80) {
    return 'score--high';
  }
  if (score >= 50) {
    return 'score--mid';
  }
  return 'score--low';
}
