import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, forkJoin } from 'rxjs';

import { DedupCandidate, DedupCluster, dedupStatusLabels } from '../../core/dedup/dedup.models';
import { DedupService } from '../../core/dedup/dedup.service';
import { dedupTone } from '../../core/dedup/dedup-format';
import { Lead } from '../../core/leads/lead.models';
import { GlassCard } from '../../shared/components/glass-card/glass-card';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';

interface CompareField {
  key: keyof Lead;
  label: string;
}

@Component({
  selector: 'app-duplicates-page',
  imports: [DatePipe, GlassCard, PageHeader, StatusBadge],
  templateUrl: './duplicates.page.html',
  styleUrl: './duplicates.page.css',
})
export class DuplicatesPage implements OnInit {
  private readonly dedupService = inject(DedupService);
  private readonly destroyRef = inject(DestroyRef);

  readonly clusters = signal<DedupCluster[]>([]);
  readonly candidates = signal<DedupCandidate[]>([]);
  readonly selectedCluster = signal<DedupCluster | null>(null);
  readonly primaryLeadId = signal('');
  readonly isLoading = signal(false);
  readonly actionInFlight = signal('');
  readonly errorMessage = signal('');
  readonly actionMessage = signal('');

  readonly selectedLeads = computed(() => this.selectedCluster()?.leads ?? []);
  readonly selectedCandidates = computed(() =>
    this.candidates().filter((candidate) => candidate.clusterId === this.selectedCluster()?.id),
  );
  readonly highConfidenceCount = computed(() => this.clusters().filter((cluster) => cluster.score >= 0.9).length);
  readonly dedupStatusLabels = dedupStatusLabels;
  readonly dedupTone = dedupTone;
  readonly compareFields: CompareField[] = [
    { key: 'name', label: 'Name' },
    { key: 'normalizedName', label: 'Normalized' },
    { key: 'website', label: 'Website' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'district', label: 'District' },
    { key: 'priorityScore', label: 'Priority' },
  ];

  ngOnInit(): void {
    this.loadDuplicates();
  }

  loadDuplicates(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      clusters: this.dedupService.listClusters(),
      candidates: this.dedupService.listCandidates(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ clusters, candidates }) => {
          this.clusters.set(clusters);
          this.candidates.set(candidates);
          const selected = clusters.find((cluster) => cluster.id === this.selectedCluster()?.id) ?? clusters[0] ?? null;
          this.selectCluster(selected);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('No pudimos cargar duplicados. Revisa backend, auth y proxy local.');
          this.isLoading.set(false);
        },
      });
  }

  selectCluster(cluster: DedupCluster | null): void {
    this.selectedCluster.set(cluster);
    this.primaryLeadId.set(cluster?.leads[0]?.id ?? '');
  }

  recompute(): void {
    this.runAction('recompute', () => this.dedupService.recompute(), 'Dedup recomputed.');
  }

  mergeSelected(): void {
    const cluster = this.selectedCluster();
    if (!cluster || !this.primaryLeadId()) {
      return;
    }
    this.runAction(
      'merge',
      () => this.dedupService.mergeCluster(cluster.id, this.primaryLeadId(), 'Merged from duplicate review.'),
      'Cluster merged.',
    );
  }

  ignoreSelected(): void {
    const cluster = this.selectedCluster();
    if (!cluster) {
      return;
    }
    this.runAction('ignore', () => this.dedupService.ignoreCluster(cluster.id, 'Ignored from duplicate review.'), 'Cluster ignored.');
  }

  markDistinct(): void {
    const cluster = this.selectedCluster();
    if (!cluster) {
      return;
    }
    this.runAction(
      'distinct',
      () => this.dedupService.markDistinct(cluster.id, 'Marked as distinct from duplicate review.'),
      'Cluster marked as distinct.',
    );
  }

  fieldValue(lead: Lead, field: keyof Lead): string {
    const value = lead[field];
    if (value === null || value === undefined || value === '') {
      return 'Not captured';
    }
    return String(value);
  }

  scoreLabel(score: number): string {
    return `${Math.round(score * 100)}%`;
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
          this.loadDuplicates();
        },
        error: () => {
          this.errorMessage.set('La accion no se pudo completar.');
          this.actionInFlight.set('');
        },
      });
  }
}
