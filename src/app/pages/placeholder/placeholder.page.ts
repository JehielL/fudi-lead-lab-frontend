import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GlassCard } from '../../shared/components/glass-card/glass-card';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';

interface PlaceholderData {
  eyebrow: string;
  title: string;
  description: string;
  badge: string;
}

@Component({
  selector: 'app-placeholder-page',
  imports: [GlassCard, PageHeader, StatusBadge],
  templateUrl: './placeholder.page.html',
  styleUrl: './placeholder.page.css',
})
export class PlaceholderPage {
  private readonly route = inject(ActivatedRoute);

  readonly data = computed<PlaceholderData>(() => ({
    eyebrow: this.route.snapshot.data['eyebrow'] as string,
    title: this.route.snapshot.data['title'] as string,
    description: this.route.snapshot.data['description'] as string,
    badge: this.route.snapshot.data['badge'] as string,
  }));
}
