import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { scoreTone, statusTone } from '../../core/leads/lead-format';
import {
  Lead,
  LeadActivity,
  LeadScoreResponse,
  LeadSource,
  LeadStatusHistory,
  PipelineStatus,
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
  readonly statusTone = statusTone;
  readonly scoreTone = scoreTone;
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
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ lead, sources, activity, statusHistory, score }) => {
          this.lead.set(lead);
          this.sources.set(sources);
          this.activity.set(activity);
          this.statusHistory.set(statusHistory);
          this.score.set(score);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('No pudimos cargar este lead. Puede que no exista o la API no este disponible.');
          this.isLoading.set(false);
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
}
