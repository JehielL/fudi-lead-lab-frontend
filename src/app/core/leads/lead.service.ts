import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Lead,
  LeadActivity,
  LeadFilters,
  LeadListResponse,
  LeadScoreResponse,
  LeadSource,
  LeadStatusHistory,
  PipelineStatus,
} from './lead.models';

@Injectable({ providedIn: 'root' })
export class LeadService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/leads`;

  listLeads(filters: LeadFilters = {}): Observable<LeadListResponse> {
    return this.http.get<LeadListResponse>(this.baseUrl, {
      params: this.toParams(filters),
    });
  }

  getLead(id: string): Observable<Lead> {
    return this.http.get<Lead>(`${this.baseUrl}/${id}`);
  }

  getSources(id: string): Observable<LeadSource[]> {
    return this.http.get<LeadSource[]>(`${this.baseUrl}/${id}/sources`);
  }

  getActivity(id: string): Observable<LeadActivity[]> {
    return this.http.get<LeadActivity[]>(`${this.baseUrl}/${id}/activity`);
  }

  getStatusHistory(id: string): Observable<LeadStatusHistory[]> {
    return this.http.get<LeadStatusHistory[]>(`${this.baseUrl}/${id}/status-history`);
  }

  transitionStatus(id: string, toStatus: PipelineStatus, reason: string): Observable<Lead> {
    return this.http.post<Lead>(`${this.baseUrl}/${id}/status-transition`, {
      toStatus,
      reason,
    });
  }

  getScore(id: string): Observable<LeadScoreResponse> {
    return this.http.get<LeadScoreResponse>(`${this.baseUrl}/${id}/score`);
  }

  recomputeScore(id: string): Observable<LeadScoreResponse> {
    return this.http.post<LeadScoreResponse>(`${this.baseUrl}/${id}/score/recompute`, {});
  }

  private toParams(filters: LeadFilters): HttpParams {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }
      params = params.set(key, String(value));
    });
    return params;
  }
}
