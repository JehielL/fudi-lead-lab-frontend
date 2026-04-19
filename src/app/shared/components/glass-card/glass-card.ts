import { Component, input } from '@angular/core';

@Component({
  selector: 'app-glass-card',
  template: `
    <section class="glass-card" [class.glass-card--tight]="tight()">
      <ng-content />
    </section>
  `,
  styleUrl: './glass-card.css',
})
export class GlassCard {
  readonly tight = input(false);
}
