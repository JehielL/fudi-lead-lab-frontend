import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, forkJoin } from 'rxjs';

import { campaignTone, draftTone, outboxTone, targetTone } from '../../core/campaigns/campaign-format';
import {
  Campaign,
  CampaignChannel,
  CampaignCreate,
  CampaignEvent,
  CampaignTarget,
  CampaignTargetCriteria,
  MessageDraft,
  MessageTemplate,
  OutboxMessage,
  SuppressionEntry,
  campaignChannelLabels,
  campaignStatusLabels,
  campaignTargetStatusLabels,
  messageDraftStatusLabels,
  outboxStatusLabels,
} from '../../core/campaigns/campaign.models';
import { CampaignService } from '../../core/campaigns/campaign.service';
import { PipelineStatus } from '../../core/leads/lead.models';
import { GlassCard } from '../../shared/components/glass-card/glass-card';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-campaigns-page',
  imports: [DatePipe, GlassCard, PageHeader, StatusBadge],
  templateUrl: './campaigns.page.html',
  styleUrl: './campaigns.page.css',
})
export class CampaignsPage implements OnInit {
  private readonly campaignService = inject(CampaignService);
  private readonly destroyRef = inject(DestroyRef);

  readonly campaigns = signal<Campaign[]>([]);
  readonly selectedCampaign = signal<Campaign | null>(null);
  readonly targets = signal<CampaignTarget[]>([]);
  readonly drafts = signal<MessageDraft[]>([]);
  readonly templates = signal<MessageTemplate[]>([]);
  readonly events = signal<CampaignEvent[]>([]);
  readonly outbox = signal<OutboxMessage[]>([]);
  readonly suppressions = signal<SuppressionEntry[]>([]);
  readonly selectedDraft = signal<MessageDraft | null>(null);
  readonly draftSubject = signal('');
  readonly draftBody = signal('');
  readonly suppressionValue = signal('');
  readonly suppressionReason = signal('Manual suppression from Campaign Lab.');
  readonly isLoading = signal(false);
  readonly actionInFlight = signal('');
  readonly errorMessage = signal('');
  readonly actionMessage = signal('');

  readonly campaignName = signal('');
  readonly campaignDescription = signal('');
  readonly campaignChannel = signal<CampaignChannel>('email');
  readonly minPriorityScore = signal(72);
  readonly pipelineStatus = signal<PipelineStatus | ''>('QUALIFIED');
  readonly city = signal('');
  readonly district = signal('');
  readonly modelScored = signal<'any' | 'true' | 'false'>('any');
  readonly enrichmentAvailable = signal<'any' | 'true' | 'false'>('any');

  readonly approvedDrafts = computed(() => this.drafts().filter((draft) => draft.draftStatus === 'approved').length);
  readonly pendingDrafts = computed(() => this.drafts().filter((draft) => draft.draftStatus === 'generated').length);
  readonly approvedTargets = computed(() => this.targets().filter((target) => target.targetStatus === 'approved').length);
  readonly readyCampaigns = computed(() => this.campaigns().filter((campaign) => campaign.status === 'ready').length);
  readonly queuedOutbox = computed(() => this.outbox().filter((message) => message.status === 'queued').length);
  readonly failedOutbox = computed(() => this.outbox().filter((message) => message.status === 'failed').length);
  readonly sentOutbox = computed(() => this.outbox().filter((message) => message.status === 'sent').length);
  readonly hasCampaignData = computed(() => this.campaigns().length || this.selectedCampaign() !== null);

  readonly campaignTone = campaignTone;
  readonly targetTone = targetTone;
  readonly draftTone = draftTone;
  readonly outboxTone = outboxTone;
  readonly campaignStatusLabels = campaignStatusLabels;
  readonly campaignChannelLabels = campaignChannelLabels;
  readonly campaignTargetStatusLabels = campaignTargetStatusLabels;
  readonly messageDraftStatusLabels = messageDraftStatusLabels;
  readonly outboxStatusLabels = outboxStatusLabels;

  ngOnInit(): void {
    this.loadCampaigns();
  }

  loadCampaigns(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      campaigns: this.campaignService.listCampaigns(),
      templates: this.campaignService.listTemplates(),
      suppressions: this.campaignService.listSuppressions(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ campaigns, templates, suppressions }) => {
          this.campaigns.set(campaigns);
          this.templates.set(templates);
          this.suppressions.set(suppressions);
          const selected = campaigns.find((campaign) => campaign.id === this.selectedCampaign()?.id) ?? campaigns[0] ?? null;
          this.selectedCampaign.set(selected);
          this.isLoading.set(false);
          if (selected) {
            this.loadCampaignDetail(selected.id);
          }
        },
        error: () => {
          this.errorMessage.set('No pudimos cargar Campaign Lab. Revisa backend, auth y proxy local.');
          this.isLoading.set(false);
        },
      });
  }

  loadCampaignDetail(campaignId: string): void {
    forkJoin({
      campaign: this.campaignService.getCampaign(campaignId),
      targets: this.campaignService.listTargets(campaignId),
      drafts: this.campaignService.listDrafts(campaignId),
      events: this.campaignService.listEvents(campaignId),
      outbox: this.campaignService.listCampaignOutbox(campaignId),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ campaign, targets, drafts, events, outbox }) => {
          this.selectedCampaign.set(campaign);
          this.targets.set(targets);
          this.drafts.set(drafts);
          this.events.set(events);
          this.outbox.set(outbox);
          const selectedDraft = drafts.find((draft) => draft.id === this.selectedDraft()?.id) ?? drafts[0] ?? null;
          this.selectDraft(selectedDraft);
        },
        error: () => this.errorMessage.set('No pudimos cargar el detalle de la campana.'),
      });
  }

  selectCampaign(campaign: Campaign): void {
    this.selectedCampaign.set(campaign);
    this.loadCampaignDetail(campaign.id);
  }

  createCampaign(): void {
    if (!this.campaignName().trim()) {
      this.errorMessage.set('Ponle un nombre a la campana antes de crearla.');
      return;
    }

    const payload: CampaignCreate = {
      name: this.campaignName().trim(),
      description: this.campaignDescription().trim() || null,
      status: 'draft',
      channel: this.campaignChannel(),
      targetCriteria: this.criteriaPayload(),
    };
    this.runAction('create-campaign', () => this.campaignService.createCampaign(payload), 'Campaign created.');
  }

  selectTargets(): void {
    const campaign = this.selectedCampaign();
    if (!campaign) {
      return;
    }
    this.runAction('select-targets', () => this.campaignService.selectTargets(campaign.id), 'Targets selected.');
  }

  generateDrafts(): void {
    const campaign = this.selectedCampaign();
    if (!campaign) {
      return;
    }
    this.runAction('generate-drafts', () => this.campaignService.generateDrafts(campaign.id), 'Drafts generated.');
  }

  updateCampaignStatus(status: Campaign['status']): void {
    const campaign = this.selectedCampaign();
    if (!campaign) {
      return;
    }
    this.runAction(`status-${status}`, () => this.campaignService.updateCampaign(campaign.id, { status }), 'Campaign updated.');
  }

  selectDraft(draft: MessageDraft | null): void {
    this.selectedDraft.set(draft);
    this.draftSubject.set(draft?.subject ?? '');
    this.draftBody.set(draft?.body ?? '');
  }

  saveDraft(): void {
    const draft = this.selectedDraft();
    if (!draft) {
      return;
    }
    this.runAction(
      `save-${draft.id}`,
      () => this.campaignService.updateDraft(draft.id, { subject: this.draftSubject(), body: this.draftBody() }),
      'Draft updated.',
    );
  }

  approveDraft(draft: MessageDraft): void {
    this.runAction(`approve-${draft.id}`, () => this.campaignService.approveDraft(draft.id), 'Draft approved.');
  }

  rejectDraft(draft: MessageDraft): void {
    this.runAction(`reject-${draft.id}`, () => this.campaignService.rejectDraft(draft.id), 'Draft rejected.');
  }

  queueDraft(draft: MessageDraft): void {
    this.runAction(`queue-${draft.id}`, () => this.campaignService.queueDraft(draft.id), 'Draft queued.');
  }

  sendDraft(draft: MessageDraft): void {
    this.runAction(`send-${draft.id}`, () => this.campaignService.sendDraft(draft.id), 'Draft send attempted.');
  }

  sendApprovedDrafts(): void {
    const campaign = this.selectedCampaign();
    if (!campaign) {
      return;
    }
    this.runAction('send-campaign', () => this.campaignService.sendCampaign(campaign.id), 'Campaign send attempted.');
  }

  scheduleApprovedDrafts(): void {
    const campaign = this.selectedCampaign();
    if (!campaign) {
      return;
    }
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    this.runAction('schedule-campaign', () => this.campaignService.scheduleCampaign(campaign.id, scheduledAt), 'Campaign scheduled.');
  }

  retryMessage(message: OutboxMessage): void {
    this.runAction(`retry-${message.id}`, () => this.campaignService.retryOutbox(message.id), 'Retry attempted.');
  }

  cancelMessage(message: OutboxMessage): void {
    this.runAction(`cancel-${message.id}`, () => this.campaignService.cancelOutbox(message.id), 'Message cancelled.');
  }

  suppressContact(value?: string | null): void {
    const identityValue = (value || this.suppressionValue()).trim();
    if (!identityValue) {
      this.errorMessage.set('Selecciona o escribe un contacto para suprimir.');
      return;
    }
    const identityType = identityValue.includes('@') ? 'email' : 'domain';
    this.runAction(
      `suppress-${identityValue}`,
      () =>
        this.campaignService.createSuppression({
          identityType,
          identityValue,
          reason: this.suppressionReason().trim() || 'Manual suppression from Campaign Lab.',
        }),
      'Contact suppressed.',
    );
  }

  deleteSuppression(suppression: SuppressionEntry): void {
    this.runAction(`delete-suppression-${suppression.id}`, () => this.campaignService.deleteSuppression(suppression.id), 'Suppression removed.');
  }

  targetLeadName(target: CampaignTarget): string {
    return target.lead?.name ?? target.leadId;
  }

  draftLeadName(draft: MessageDraft): string {
    return draft.lead?.name ?? draft.leadId;
  }

  messageLeadName(message: OutboxMessage): string {
    return message.lead?.name ?? message.leadId;
  }

  eventPayload(event: CampaignEvent): string {
    const keys = Object.keys(event.payload ?? {});
    if (!keys.length) {
      return 'No payload';
    }
    return keys
      .slice(0, 3)
      .map((key) => `${key}: ${String(event.payload[key])}`)
      .join(' · ');
  }

  setBoolFilter(kind: 'model' | 'enrichment', value: string): void {
    if (kind === 'model') {
      this.modelScored.set(value as 'any' | 'true' | 'false');
    } else {
      this.enrichmentAvailable.set(value as 'any' | 'true' | 'false');
    }
  }

  private criteriaPayload(): CampaignTargetCriteria {
    return {
      minPriorityScore: this.minPriorityScore(),
      pipelineStatus: this.pipelineStatus() || null,
      city: this.city().trim() || null,
      district: this.district().trim() || null,
      modelScored: this.booleanFilter(this.modelScored()),
      enrichmentAvailable: this.booleanFilter(this.enrichmentAvailable()),
      limit: 80,
    };
  }

  private booleanFilter(value: 'any' | 'true' | 'false'): boolean | null {
    if (value === 'any') {
      return null;
    }
    return value === 'true';
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
          this.loadCampaigns();
        },
        error: () => {
          this.errorMessage.set('La accion no se pudo completar.');
          this.actionInFlight.set('');
        },
      });
  }
}
