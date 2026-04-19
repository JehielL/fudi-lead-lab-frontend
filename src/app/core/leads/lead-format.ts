import { PipelineStatus } from './lead.models';

export function statusTone(status: PipelineStatus): 'green' | 'cyan' | 'amber' | 'coral' | 'muted' {
  if (status === 'qualified' || status === 'won') {
    return 'green';
  }
  if (status === 'contacted' || status === 'reviewing') {
    return 'cyan';
  }
  if (status === 'lost' || status === 'discarded') {
    return 'coral';
  }
  if (status === 'new') {
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
