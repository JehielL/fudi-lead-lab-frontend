import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { scoreTone, statusTone } from '../../core/leads/lead-format';
import { Lead, LeadListResponse, PipelineStatus, pipelineStatusLabels } from '../../core/leads/lead.models';
import { LeadService } from '../../core/leads/lead.service';
import { GlassCard } from '../../shared/components/glass-card/glass-card';
import { LeadProgressTracker } from '../../shared/components/lead-progress-tracker/lead-progress-tracker';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-discovery-page',
  imports: [DatePipe, FormsModule, GlassCard, LeadProgressTracker, PageHeader, StatusBadge],
  templateUrl: './discovery.page.html',
  styleUrl: './discovery.page.css',
})
export class DiscoveryPage implements OnInit {
  private readonly leadService = inject(LeadService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly q = signal('');
  readonly pipelineStatus = signal<PipelineStatus | ''>('');
  readonly city = signal('');
  readonly district = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(12);
  readonly sortBy = signal('updatedAt');
  readonly sortDirection = signal<'asc' | 'desc'>('desc');

  readonly response = signal<LeadListResponse | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly leads = computed(() => this.response()?.items ?? []);
  readonly total = computed(() => this.response()?.total ?? 0);
  readonly totalPages = computed(() => this.response()?.totalPages ?? 1);

  readonly statusOptions: Array<{ value: PipelineStatus | ''; label: string }> = [
    { value: '', label: 'All statuses' },
    ...Object.entries(pipelineStatusLabels).map(([value, label]) => ({
      value: value as PipelineStatus,
      label,
    })),
  ];

  readonly pipelineStatusLabels = pipelineStatusLabels;
  readonly statusTone = statusTone;
  readonly scoreTone = scoreTone;

  ngOnInit(): void {
    this.loadLeads();
  }

  loadLeads(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.leadService
      .listLeads({
        q: this.q().trim(),
        pipelineStatus: this.pipelineStatus(),
        city: this.city().trim(),
        district: this.district().trim(),
        page: this.page(),
        pageSize: this.pageSize(),
        sortBy: this.sortBy(),
        sortDirection: this.sortDirection(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.response.set(response);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('No pudimos cargar la cola de leads. Revisa la API e intentalo de nuevo.');
          this.isLoading.set(false);
        },
      });
  }

  applyFilters(): void {
    this.page.set(1);
    this.loadLeads();
  }

  clearFilters(): void {
    this.q.set('');
    this.pipelineStatus.set('');
    this.city.set('');
    this.district.set('');
    this.page.set(1);
    this.loadLeads();
  }

  nextPage(): void {
    if (this.page() >= this.totalPages()) {
      return;
    }
    this.page.update((page) => page + 1);
    this.loadLeads();
  }

  previousPage(): void {
    if (this.page() <= 1) {
      return;
    }
    this.page.update((page) => page - 1);
    this.loadLeads();
  }

  openLead(lead: Lead): void {
    void this.router.navigate(['/lead-inspector', lead.id]);
  }
}
