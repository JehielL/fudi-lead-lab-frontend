import { Component, computed, input } from '@angular/core';

import { PipelineStatus, pipelineStatusLabels } from '../../../core/leads/lead.models';

type TrackerVariant = 'full' | 'compact';
type StepState = 'complete' | 'active' | 'pending' | 'blocked' | 'paused';

const FLOW_STEPS: PipelineStatus[] = ['DETECTED', 'REVIEWED', 'QUALIFIED', 'CONTACTED', 'CONVERTED'];

@Component({
  selector: 'app-lead-progress-tracker',
  template: `
    <div
      class="tracker"
      [class.tracker--compact]="variant() === 'compact'"
      [class.tracker--paused]="isPaused()"
      [class.tracker--discarded]="isDiscarded()"
      [attr.aria-label]="'Lead status: ' + currentLabel()"
    >
      @for (step of steps(); track step.status) {
        <div class="tracker-step" [class]="'tracker-step--' + step.state">
          <span class="tracker-node">
            @if (step.state === 'complete') {
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="m9.2 16.6-4-4 1.4-1.4 2.6 2.6 8.2-8.2L18.8 7l-9.6 9.6Z"></path>
              </svg>
            }
          </span>
          @if (variant() === 'full') {
            <span class="tracker-label">{{ step.label }}</span>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './lead-progress-tracker.css',
})
export class LeadProgressTracker {
  readonly currentStatus = input<PipelineStatus>('DETECTED');
  readonly variant = input<TrackerVariant>('full');
  readonly isDiscarded = input(false);
  readonly isPaused = input(false);

  readonly currentIndex = computed(() => FLOW_STEPS.indexOf(this.currentStatus()));
  readonly currentLabel = computed(() => pipelineStatusLabels[this.currentStatus()] ?? this.currentStatus());
  readonly steps = computed(() =>
    FLOW_STEPS.map((status, index) => ({
      status,
      label: pipelineStatusLabels[status],
      state: this.stateFor(index),
    })),
  );

  private stateFor(index: number): StepState {
    if (this.isDiscarded()) {
      return 'blocked';
    }
    if (this.isPaused()) {
      return index <= Math.max(this.currentIndex(), 0) ? 'paused' : 'pending';
    }
    if (this.currentIndex() < 0) {
      return 'pending';
    }
    if (index < this.currentIndex()) {
      return 'complete';
    }
    if (index === this.currentIndex()) {
      return 'active';
    }
    return 'pending';
  }
}
