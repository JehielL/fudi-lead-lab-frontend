import { JobStatus } from './ops.models';

export function jobTone(status: JobStatus): 'green' | 'cyan' | 'amber' | 'coral' | 'muted' {
  if (status === 'completed') {
    return 'green';
  }
  if (status === 'running') {
    return 'cyan';
  }
  if (status === 'failed') {
    return 'coral';
  }
  return 'muted';
}
