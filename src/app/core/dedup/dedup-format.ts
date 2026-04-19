import { DedupStatus } from './dedup.models';

export function dedupTone(status: DedupStatus): 'green' | 'cyan' | 'amber' | 'coral' | 'muted' {
  if (status === 'merged') return 'green';
  if (status === 'distinct') return 'cyan';
  if (status === 'ignored') return 'muted';
  if (status === 'open') return 'amber';
  return 'muted';
}
