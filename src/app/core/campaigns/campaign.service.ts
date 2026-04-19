import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Campaign,
  CampaignCreate,
  CampaignEvent,
  CampaignSendResponse,
  CampaignTarget,
  CampaignTargetSelectionResponse,
  CampaignUpdate,
  MessageDraft,
  MessageDraftUpdate,
  MessageTemplate,
  MessageTemplateCreate,
  OutboxDetail,
  OutboxMessage,
  SuppressionCreate,
  SuppressionEntry,
} from './campaign.models';

@Injectable({ providedIn: 'root' })
export class CampaignService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly baseUrl = `${environment.apiBaseUrl}/campaigns`;

  listCampaigns(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(this.baseUrl);
  }

  createCampaign(payload: CampaignCreate): Observable<Campaign> {
    return this.http.post<Campaign>(this.baseUrl, payload);
  }

  getCampaign(id: string): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.baseUrl}/${id}`);
  }

  updateCampaign(id: string, payload: CampaignUpdate): Observable<Campaign> {
    return this.http.patch<Campaign>(`${this.baseUrl}/${id}`, payload);
  }

  listTargets(id: string): Observable<CampaignTarget[]> {
    return this.http.get<CampaignTarget[]>(`${this.baseUrl}/${id}/targets`);
  }

  selectTargets(id: string): Observable<CampaignTargetSelectionResponse> {
    return this.http.post<CampaignTargetSelectionResponse>(`${this.baseUrl}/${id}/targets/select`, {});
  }

  listDrafts(id: string): Observable<MessageDraft[]> {
    return this.http.get<MessageDraft[]>(`${this.baseUrl}/${id}/drafts`);
  }

  generateDrafts(id: string): Observable<MessageDraft[]> {
    return this.http.post<MessageDraft[]>(`${this.baseUrl}/${id}/drafts/generate`, {});
  }

  listEvents(id: string): Observable<CampaignEvent[]> {
    return this.http.get<CampaignEvent[]>(`${this.baseUrl}/${id}/events`);
  }

  sendCampaign(id: string): Observable<CampaignSendResponse> {
    return this.http.post<CampaignSendResponse>(`${this.baseUrl}/${id}/send`, {});
  }

  scheduleCampaign(id: string, scheduledAt: string | null): Observable<CampaignSendResponse> {
    return this.http.post<CampaignSendResponse>(`${this.baseUrl}/${id}/schedule`, { scheduledAt });
  }

  listCampaignOutbox(id: string): Observable<OutboxMessage[]> {
    return this.http.get<OutboxMessage[]>(`${this.baseUrl}/${id}/outbox`);
  }

  updateDraft(id: string, payload: MessageDraftUpdate): Observable<MessageDraft> {
    return this.http.patch<MessageDraft>(`${this.apiBaseUrl}/drafts/${id}`, payload);
  }

  approveDraft(id: string): Observable<MessageDraft> {
    return this.http.post<MessageDraft>(`${this.apiBaseUrl}/drafts/${id}/approve`, {});
  }

  rejectDraft(id: string): Observable<MessageDraft> {
    return this.http.post<MessageDraft>(`${this.apiBaseUrl}/drafts/${id}/reject`, {});
  }

  queueDraft(id: string): Observable<OutboxMessage> {
    return this.http.post<OutboxMessage>(`${this.apiBaseUrl}/drafts/${id}/queue`, {});
  }

  sendDraft(id: string): Observable<OutboxMessage> {
    return this.http.post<OutboxMessage>(`${this.apiBaseUrl}/drafts/${id}/send`, {});
  }

  listOutbox(status?: string): Observable<OutboxMessage[]> {
    const url = status ? `${this.apiBaseUrl}/outbox?status=${status}` : `${this.apiBaseUrl}/outbox`;
    return this.http.get<OutboxMessage[]>(url);
  }

  getOutbox(id: string): Observable<OutboxDetail> {
    return this.http.get<OutboxDetail>(`${this.apiBaseUrl}/outbox/${id}`);
  }

  retryOutbox(id: string): Observable<OutboxMessage> {
    return this.http.post<OutboxMessage>(`${this.apiBaseUrl}/outbox/${id}/retry`, {});
  }

  cancelOutbox(id: string): Observable<OutboxMessage> {
    return this.http.post<OutboxMessage>(`${this.apiBaseUrl}/outbox/${id}/cancel`, {});
  }

  listTemplates(): Observable<MessageTemplate[]> {
    return this.http.get<MessageTemplate[]>(`${this.apiBaseUrl}/templates`);
  }

  createTemplate(payload: MessageTemplateCreate): Observable<MessageTemplate> {
    return this.http.post<MessageTemplate>(`${this.apiBaseUrl}/templates`, payload);
  }

  listSuppressions(): Observable<SuppressionEntry[]> {
    return this.http.get<SuppressionEntry[]>(`${this.apiBaseUrl}/suppressions`);
  }

  createSuppression(payload: SuppressionCreate): Observable<SuppressionEntry> {
    return this.http.post<SuppressionEntry>(`${this.apiBaseUrl}/suppressions`, payload);
  }

  deleteSuppression(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/suppressions/${id}`);
  }
}
