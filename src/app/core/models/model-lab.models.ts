export type ModelType = 'newness' | 'digital_gap' | 'fit' | 'contactability';
export type ModelAlgorithm = 'LogisticRegression' | 'RandomForest' | 'HistGradientBoosting' | 'Baseline';
export type TrainingStatus = 'running' | 'completed' | 'failed';

export interface ModelRegistryEntry {
  id: string;
  modelType: ModelType;
  algorithm: ModelAlgorithm;
  version: string;
  isActive: boolean;
  status: TrainingStatus;
  featureNames: string[];
  sampleCount: number;
  positiveCount: number;
  negativeCount: number;
  metrics: Record<string, number | string | null>;
  trainingRunId: string;
  trainedAt: string;
  activatedAt?: string | null;
}

export interface TrainingRun {
  id: string;
  status: TrainingStatus;
  startedAt: string;
  finishedAt?: string | null;
  triggeredBy: string;
  datasetSize: number;
  featureNames: string[];
  modelIds: string[];
  errorMessage?: string | null;
  metadata: Record<string, unknown>;
}

export interface ModelTrainRequest {
  activateBest: boolean;
  algorithms?: ModelAlgorithm[];
}

export interface ModelTrainResponse {
  run: TrainingRun;
  models: ModelRegistryEntry[];
}

export const modelTypeLabels: Record<ModelType, string> = {
  newness: 'Newness',
  digital_gap: 'Digital gap',
  fit: 'FÜDI fit',
  contactability: 'Contactability',
};

export const trainingStatusLabels: Record<TrainingStatus, string> = {
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
};
