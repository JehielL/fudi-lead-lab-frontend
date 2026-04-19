import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, forkJoin } from 'rxjs';

import { jobTone } from '../../core/ops/ops-format';
import { CrawlJob, OpsSummary, RawDiscoveryItem, SourceRegistry, jobStatusLabels } from '../../core/ops/ops.models';
import { OpsService } from '../../core/ops/ops.service';
import { GlassCard } from '../../shared/components/glass-card/glass-card';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-ops-page',
  imports: [DatePipe, GlassCard, PageHeader, StatusBadge],
  templateUrl: './ops.page.html',
  styleUrl: './ops.page.css',
})
export class OpsPage implements OnInit {
  private readonly opsService = inject(OpsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly summary = signal<OpsSummary | null>(null);
  readonly jobs = signal<CrawlJob[]>([]);
  readonly sources = signal<SourceRegistry[]>([]);
  readonly rawItems = signal<RawDiscoveryItem[]>([]);
  readonly isLoading = signal(false);
  readonly actionInFlight = signal('');
  readonly errorMessage = signal('');
  readonly actionMessage = signal('');

  readonly failedJobs = computed(() => this.jobs().filter((job) => job.status === 'failed'));
  readonly hasData = computed(() => Boolean(this.summary()) || this.jobs().length || this.sources().length);

  readonly jobStatusLabels = jobStatusLabels;
  readonly jobTone = jobTone;

  ngOnInit(): void {
    this.loadOps();
  }

  loadOps(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      summary: this.opsService.getSummary(),
      jobs: this.opsService.listJobs(20),
      sources: this.opsService.listSources(),
      rawItems: this.opsService.listRawItems(8),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ summary, jobs, sources, rawItems }) => {
          this.summary.set(summary);
          this.jobs.set(jobs);
          this.sources.set(sources);
          this.rawItems.set(rawItems);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('No pudimos cargar Ops. Revisa backend, auth y proxy local.');
          this.isLoading.set(false);
        },
      });
  }

  runDiscovery(): void {
    const seedName = `Ops Manual Seed ${new Date().toISOString().slice(0, 19)}`;
    this.runAction('run-discovery', () => this.opsService.runDiscovery(seedName));
  }

  retryJob(job: CrawlJob): void {
    this.runAction(`retry-${job.id}`, () => this.opsService.retryJob(job.id));
  }

  toggleSource(source: SourceRegistry): void {
    this.runAction(`source-${source.id}`, () => this.opsService.toggleSource(source));
  }

  createSeedSource(): void {
    const stamp = Date.now();
    this.runAction('create-source', () =>
      this.opsService.createSeedSource({
        sourceKey: `ops-seed-${stamp}`,
        sourceType: 'local_seed',
        name: `Ops Seed ${stamp}`,
        isEnabled: true,
        priority: 20,
        config: {
          seedItems: [
            {
              name: `Ops Source Lead ${stamp}`,
              businessType: 'restaurant',
              city: 'Madrid',
              district: 'Salamanca',
              countryCode: 'ES',
              priorityScore: 67,
              fitScore: 63,
              confidence: 59,
            },
          ],
        },
      }),
    );
  }

  private runAction(actionName: string, action: () => Observable<unknown>): void {
    this.actionInFlight.set(actionName);
    this.errorMessage.set('');
    this.actionMessage.set('');

    action()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actionMessage.set('Operation completed.');
          this.actionInFlight.set('');
          this.loadOps();
        },
        error: () => {
          this.errorMessage.set('La operacion no se pudo completar.');
          this.actionInFlight.set('');
        },
      });
  }
}
