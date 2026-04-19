import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { scoreTone, statusTone } from '../../core/leads/lead-format';
import {
  PredictionRun,
  modelTypeLabels,
} from '../../core/models/model-lab.models';
import {
  FeatureSnapshot,
  Lead,
  LeadActivity,
  LeadEnrichmentSummary,
  LeadScoreResponse,
  LeadSource,
  LeadStatusHistory,
  PageSnapshot,
  PipelineStatus,
  enrichmentStatusLabels,
  pipelineStatusLabels,
} from '../../core/leads/lead.models';
import { LeadService } from '../../core/leads/lead.service';
import { GlassCard } from '../../shared/components/glass-card/glass-card';
import { LeadProgressTracker } from '../../shared/components/lead-progress-tracker/lead-progress-tracker';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-lead-inspector-page',
  imports: [DatePipe, RouterLink, GlassCard, LeadProgressTracker, PageHeader, StatusBadge],
  templateUrl: './lead-inspector.page.html',
  styleUrl: './lead-inspector.page.css',
})
export class LeadInspectorPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly leadService = inject(LeadService);
  private readonly destroyRef = inject(DestroyRef);

  readonly lead = signal<Lead | null>(null);
  readonly sources = signal<LeadSource[]>([]);
  readonly activity = signal<LeadActivity[]>([]);
  readonly statusHistory = signal<LeadStatusHistory[]>([]);
  readonly score = signal<LeadScoreResponse | null>(null);
  readonly enrichment = signal<LeadEnrichmentSummary | null>(null);
  readonly featureSnapshots = signal<FeatureSnapshot[]>([]);
  readonly pageSnapshots = signal<PageSnapshot[]>([]);
  readonly predictions = signal<PredictionRun[]>([]);
  readonly isLoading = signal(false);
  readonly actionInFlight = signal('');
  readonly errorMessage = signal('');

  readonly pageTitle = computed(() => this.lead()?.name ?? 'Lead Inspector');
  readonly pageDescription = computed(() => {
    const lead = this.lead();
    if (!lead) {
      return 'Detalle operativo de identidad, contacto, ubicacion, scores, fuentes y actividad.';
    }
    return `${lead.businessType || 'Restaurant'} · ${lead.city || 'No city'} · ${lead.district || 'No district'}`;
  });

  readonly pipelineStatusLabels = pipelineStatusLabels;
  readonly enrichmentStatusLabels = enrichmentStatusLabels;
  readonly modelTypeLabels = modelTypeLabels;
  readonly statusTone = statusTone;
  readonly scoreTone = scoreTone;
  readonly latestPredictions = computed(() => this.predictions().slice(0, 4));
  readonly previousPredictions = computed(() => this.predictions().slice(4, 8));
  readonly latestPredictionDate = computed(() => this.latestPredictions()[0]?.createdAt ?? this.lead()?.lastPredictedAt ?? null);
  readonly latestFeatures = computed(() => {
    return this.enrichment()?.latestFeatureSnapshot?.features ?? this.featureSnapshots()[0]?.features ?? {};
  });
  readonly latestDerivedSignals = computed(() => {
    return this.enrichment()?.latestFeatureSnapshot?.derivedSignals ?? this.featureSnapshots()[0]?.derivedSignals ?? {};
  });
  readonly signalCards = computed(() => {
    const features = this.latestFeatures();
    return [
      {
        label: 'Website',
        value: this.booleanLabel(features['hasWebsite']),
        active: Boolean(features['hasWebsite']),
        detail: this.textValue(features['analyzedUrl']) || 'No website evidence',
      },
      {
        label: 'Instagram',
        value: this.booleanLabel(features['hasInstagram']),
        active: Boolean(features['hasInstagram']),
        detail: this.lead()?.instagram || 'No Instagram signal',
      },
      {
        label: 'Booking',
        value: this.booleanLabel(features['hasBookingLink']),
        active: Boolean(features['hasBookingLink']),
        detail: this.textValue(features['bookingProviderHint']) || 'No booking provider',
      },
      {
        label: 'Menu',
        value: this.booleanLabel(features['hasMenuLink']),
        active: Boolean(features['hasMenuLink']),
        detail: 'Menu or carta signal',
      },
      {
        label: 'Phone',
        value: this.booleanLabel(features['hasPhone']),
        active: Boolean(features['hasPhone']),
        detail: this.lead()?.phone || 'No phone signal',
      },
      {
        label: 'Email',
        value: this.booleanLabel(features['hasEmail']),
        active: Boolean(features['hasEmail']),
        detail: this.lead()?.email || 'No email signal',
      },
    ];
  });
  readonly maturitySignals = computed(() => {
    const features = this.latestFeatures();
    const derived = this.latestDerivedSignals();
    return [
      `Digital maturity: ${this.textValue(derived['digitalMaturity']) || 'unknown'}`,
      `Novelty: ${this.textValue(derived['novelty']) || 'unknown'}`,
      `Contactability: ${this.textValue(derived['contactability']) || 'unknown'}`,
      `Low content website: ${this.booleanLabel(features['lowContentWebsite'])}`,
      `Broken website hint: ${this.booleanLabel(features['brokenWebsiteHint'])}`,
      `Social only presence: ${this.booleanLabel(features['socialOnlyPresenceHint'])}`,
      `Opening soon hint: ${this.booleanLabel(features['openingSoonHint'])}`,
      `New opening hint: ${this.booleanLabel(features['newOpeningHint'])}`,
    ];
  });
  readonly nextStatus = computed<PipelineStatus | null>(() => {
    const status = this.lead()?.pipelineStatus;
    if (status === 'DETECTED') return 'REVIEWED';
    if (status === 'REVIEWED') return 'QUALIFIED';
    if (status === 'QUALIFIED') return 'CONTACTED';
    if (status === 'CONTACTED') return 'CONVERTED';
    if (status === 'PAUSED') return 'REVIEWED';
    return null;
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const leadId = params.get('id');
      if (leadId) {
        this.loadLead(leadId);
      }
    });
  }

  loadLead(leadId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      lead: this.leadService.getLead(leadId),
      sources: this.leadService.getSources(leadId),
      activity: this.leadService.getActivity(leadId),
      statusHistory: this.leadService.getStatusHistory(leadId),
      score: this.leadService.getScore(leadId),
      enrichment: this.leadService.getEnrichment(leadId),
      featureSnapshots: this.leadService.getFeatureSnapshots(leadId),
      pageSnapshots: this.leadService.getPageSnapshots(leadId),
      predictions: this.leadService.getPredictions(leadId),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ lead, sources, activity, statusHistory, score, enrichment, featureSnapshots, pageSnapshots, predictions }) => {
          this.lead.set(lead);
          this.sources.set(sources);
          this.activity.set(activity);
          this.statusHistory.set(statusHistory);
          this.score.set(score);
          this.enrichment.set(enrichment);
          this.featureSnapshots.set(featureSnapshots);
          this.pageSnapshots.set(pageSnapshots);
          this.predictions.set(predictions);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('No pudimos cargar este lead. Puede que no exista o la API no este disponible.');
          this.isLoading.set(false);
        },
      });
  }

  runEnrichment(): void {
    const lead = this.lead();
    if (!lead) {
      return;
    }
    this.actionInFlight.set('enrichment');
    this.leadService
      .runEnrichment(lead.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actionInFlight.set('');
          this.loadLead(lead.id);
        },
        error: () => {
          this.errorMessage.set('No pudimos ejecutar el enrichment.');
          this.actionInFlight.set('');
        },
      });
  }

  runPrediction(): void {
    const lead = this.lead();
    if (!lead) {
      return;
    }
    this.actionInFlight.set('prediction');
    this.leadService
      .runPrediction(lead.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actionInFlight.set('');
          this.loadLead(lead.id);
        },
        error: () => {
          this.errorMessage.set('No pudimos ejecutar la prediccion.');
          this.actionInFlight.set('');
        },
      });
  }

  transition(toStatus: PipelineStatus): void {
    const lead = this.lead();
    if (!lead) {
      return;
    }
    this.actionInFlight.set(`status-${toStatus}`);
    this.leadService
      .transitionStatus(lead.id, toStatus, `Changed from Lead Inspector to ${pipelineStatusLabels[toStatus]}.`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actionInFlight.set('');
          this.loadLead(lead.id);
        },
        error: () => {
          this.errorMessage.set('No pudimos cambiar el estado del lead.');
          this.actionInFlight.set('');
        },
      });
  }

  recomputeScore(): void {
    const lead = this.lead();
    if (!lead) {
      return;
    }
    this.actionInFlight.set('score');
    this.leadService
      .recomputeScore(lead.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actionInFlight.set('');
          this.loadLead(lead.id);
        },
        error: () => {
          this.errorMessage.set('No pudimos recalcular el score.');
          this.actionInFlight.set('');
        },
      });
  }

  enrichmentTone(status: string | null | undefined): 'green' | 'amber' | 'coral' | 'cyan' {
    if (status === 'completed') return 'green';
    if (status === 'failed') return 'coral';
    if (status === 'running') return 'cyan';
    return 'amber';
  }

  featureNumber(key: string): number | null {
    const value = this.latestFeatures()[key];
    return typeof value === 'number' ? value : null;
  }

  previousPredictionFor(run: PredictionRun): PredictionRun | null {
    return this.previousPredictions().find((previous) => previous.modelType === run.modelType) ?? null;
  }

  private booleanLabel(value: unknown): string {
    return value ? 'Yes' : 'No';
  }

  private textValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }
}
