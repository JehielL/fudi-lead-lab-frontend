import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  FeatureSnapshot,
  Lead,
  LeadActivity,
  LeadEnrichmentSummary,
  LeadFilters,
  LeadListResponse,
  LeadScoreResponse,
  LeadSource,
  LeadStatusHistory,
  PageSnapshot,
  PipelineStatus,
} from './lead.models';
import { BatchPredictionResponse, LeadPredictionResponse, PredictionRun } from '../models/model-lab.models';

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

  runPrediction(id: string): Observable<LeadPredictionResponse> {
    return this.http.post<LeadPredictionResponse>(`${this.baseUrl}/${id}/predict`, {});
  }

  runBatchPrediction(leadIds: string[]): Observable<BatchPredictionResponse> {
    return this.http.post<BatchPredictionResponse>(`${this.baseUrl}/predict/batch`, {
      leadIds,
      limit: leadIds.length || 50,
    });
  }

  getPredictions(id: string): Observable<PredictionRun[]> {
    return this.http.get<PredictionRun[]>(`${this.baseUrl}/${id}/predictions`);
  }

  runEnrichment(id: string): Observable<LeadEnrichmentSummary> {
    return this.http.post<LeadEnrichmentSummary>(`${this.baseUrl}/${id}/enrich`, {});
  }

  getEnrichment(id: string): Observable<LeadEnrichmentSummary> {
    return this.http.get<LeadEnrichmentSummary>(`${this.baseUrl}/${id}/enrichment`);
  }

  getFeatureSnapshots(id: string): Observable<FeatureSnapshot[]> {
    return this.http.get<FeatureSnapshot[]>(`${this.baseUrl}/${id}/feature-snapshots`);
  }

  getPageSnapshots(id: string): Observable<PageSnapshot[]> {
    return this.http.get<PageSnapshot[]>(`${this.baseUrl}/${id}/page-snapshots`);
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
