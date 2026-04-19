import { Component, input } from '@angular/core';

type BadgeTone = 'green' | 'cyan' | 'amber' | 'coral' | 'muted';

@Component({
  selector: 'app-status-badge',
  template: `
    <span
      class="status-badge"
      [class.status-badge--green]="tone() === 'green'"
      [class.status-badge--cyan]="tone() === 'cyan'"
      [class.status-badge--amber]="tone() === 'amber'"
      [class.status-badge--coral]="tone() === 'coral'"
      [class.status-badge--muted]="tone() === 'muted'"
    >
      <span class="status-dot"></span>
      {{ label() }}
    </span>
  `,
  styleUrl: './status-badge.css',
})
export class StatusBadge {
  readonly label = input('Active');
  readonly tone = input<BadgeTone>('green');
}
