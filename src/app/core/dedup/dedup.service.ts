import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  DedupCandidate,
  DedupCluster,
  DedupMergeResponse,
  DedupRecomputeResponse,
} from './dedup.models';

@Injectable({ providedIn: 'root' })
export class DedupService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/dedup`;

  listCandidates(): Observable<DedupCandidate[]> {
    return this.http.get<DedupCandidate[]>(`${this.baseUrl}/candidates`);
  }

  listClusters(): Observable<DedupCluster[]> {
    return this.http.get<DedupCluster[]>(`${this.baseUrl}/clusters`);
  }

  getCluster(id: string): Observable<DedupCluster> {
    return this.http.get<DedupCluster>(`${this.baseUrl}/clusters/${id}`);
  }

  mergeCluster(id: string, primaryLeadId: string, reason: string): Observable<DedupMergeResponse> {
    return this.http.post<DedupMergeResponse>(`${this.baseUrl}/clusters/${id}/merge`, {
      primaryLeadId,
      reason,
    });
  }

  ignoreCluster(id: string, reason: string): Observable<DedupCluster> {
    return this.http.post<DedupCluster>(`${this.baseUrl}/clusters/${id}/ignore`, { reason });
  }

  markDistinct(id: string, reason: string): Observable<DedupCluster> {
    return this.http.post<DedupCluster>(`${this.baseUrl}/clusters/${id}/distinct`, { reason });
  }

  recompute(): Observable<DedupRecomputeResponse> {
    return this.http.post<DedupRecomputeResponse>(`${this.baseUrl}/recompute`, {});
  }
}
