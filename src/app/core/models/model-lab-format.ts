import { TrainingStatus } from './model-lab.models';

export function trainingTone(status: TrainingStatus): 'green' | 'cyan' | 'amber' | 'coral' | 'muted' {
  if (status === 'completed') return 'green';
  if (status === 'running') return 'cyan';
  if (status === 'failed') return 'coral';
  return 'muted';
}

export function metricPercent(value: number | string | null | undefined): string {
  if (typeof value !== 'number') return 'n/a';
  return `${Math.round(value * 100)}%`;
}
