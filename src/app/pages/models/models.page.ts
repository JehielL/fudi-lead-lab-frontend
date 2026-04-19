import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, forkJoin } from 'rxjs';

import { metricPercent, trainingTone } from '../../core/models/model-lab-format';
import {
  ActiveModelConfig,
  ModelRegistryEntry,
  PredictionRun,
  TrainingRun,
  modelTypeLabels,
  trainingStatusLabels,
} from '../../core/models/model-lab.models';
import { ModelLabService } from '../../core/models/model-lab.service';
import { GlassCard } from '../../shared/components/glass-card/glass-card';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-models-page',
  imports: [DatePipe, GlassCard, PageHeader, StatusBadge],
  templateUrl: './models.page.html',
  styleUrl: './models.page.css',
})
export class ModelsPage implements OnInit {
  private readonly modelService = inject(ModelLabService);
  private readonly destroyRef = inject(DestroyRef);

  readonly models = signal<ModelRegistryEntry[]>([]);
  readonly runs = signal<TrainingRun[]>([]);
  readonly activeConfigs = signal<ActiveModelConfig[]>([]);
  readonly predictionRuns = signal<PredictionRun[]>([]);
  readonly selectedModel = signal<ModelRegistryEntry | null>(null);
  readonly isLoading = signal(false);
  readonly actionInFlight = signal('');
  readonly errorMessage = signal('');
  readonly actionMessage = signal('');

  readonly activeModels = computed(() => this.models().filter((model) => model.isActive));
  readonly predictionsLastCount = computed(() => this.predictionRuns().length);
  readonly latestRun = computed(() => this.runs()[0] ?? null);
  readonly latestDatasetSize = computed(() => this.latestRun()?.datasetSize ?? 0);
  readonly modelTypeLabels = modelTypeLabels;
  readonly trainingStatusLabels = trainingStatusLabels;
  readonly trainingTone = trainingTone;
  readonly metricPercent = metricPercent;

  ngOnInit(): void {
    this.loadModelLab();
  }

  loadModelLab(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      models: this.modelService.listModels(),
      runs: this.modelService.listRuns(),
      activeConfigs: this.modelService.listActiveModels(),
      predictionRuns: this.modelService.listPredictionRuns(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ models, runs, activeConfigs, predictionRuns }) => {
          this.models.set(models);
          this.runs.set(runs);
          this.activeConfigs.set(activeConfigs);
          this.predictionRuns.set(predictionRuns);
          this.selectedModel.set(models.find((model) => model.id === this.selectedModel()?.id) ?? models[0] ?? null);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('No pudimos cargar Model Lab. Revisa backend, auth y proxy local.');
          this.isLoading.set(false);
        },
      });
  }

  trainModels(): void {
    this.runAction('train', () => this.modelService.train({ activateBest: true }), 'Training completed.');
  }

  activate(model: ModelRegistryEntry): void {
    this.runAction(`activate-${model.id}`, () => this.modelService.setActiveModel(model.modelType, model.id), 'Model activated.');
  }

  selectModel(model: ModelRegistryEntry): void {
    this.selectedModel.set(model);
  }

  metric(model: ModelRegistryEntry, key: string): string {
    return metricPercent(model.metrics[key]);
  }

  activeConfigFor(model: ModelRegistryEntry): ActiveModelConfig | null {
    return this.activeConfigs().find((config) => config.modelType === model.modelType) ?? null;
  }

  private runAction(actionName: string, action: () => Observable<unknown>, successMessage: string): void {
    this.actionInFlight.set(actionName);
    this.errorMessage.set('');
    this.actionMessage.set('');

    action()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actionMessage.set(successMessage);
          this.actionInFlight.set('');
          this.loadModelLab();
        },
        error: () => {
          this.errorMessage.set('La accion no se pudo completar.');
          this.actionInFlight.set('');
        },
      });
  }
}
