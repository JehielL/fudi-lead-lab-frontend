import { Component, input } from '@angular/core';

import { StatusBadge } from '../status-badge/status-badge';

@Component({
  selector: 'app-page-header',
  imports: [StatusBadge],
  template: `
    <header class="page-header">
      <div>
        <p class="page-header__eyebrow">{{ eyebrow() }}</p>
        <h1>{{ title() }}</h1>
        <p class="page-header__description">{{ description() }}</p>
      </div>

      @if (badge()) {
        <app-status-badge [label]="badge()" tone="green" />
      }
    </header>
  `,
  styleUrl: './page-header.css',
})
export class PageHeader {
  readonly eyebrow = input('');
  readonly title = input('');
  readonly description = input('');
  readonly badge = input('');
}
