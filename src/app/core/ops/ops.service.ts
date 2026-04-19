import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CrawlJob,
  JobRunResponse,
  OpsSummary,
  RawDiscoveryItem,
  SourceRegistry,
  SourceRegistryCreate,
} from './ops.models';

@Injectable({ providedIn: 'root' })
export class OpsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getSummary(): Observable<OpsSummary> {
    return this.http.get<OpsSummary>(`${this.baseUrl}/ops/summary`);
  }

  listJobs(limit = 20): Observable<CrawlJob[]> {
    return this.http.get<CrawlJob[]>(`${this.baseUrl}/jobs`, {
      params: new HttpParams().set('limit', limit),
    });
  }

  runDiscovery(seedName: string): Observable<JobRunResponse> {
    return this.http.post<JobRunResponse>(`${this.baseUrl}/jobs/discovery/run`, {
      seedItems: [
        {
          name: seedName,
          businessType: 'restaurant',
          city: 'Madrid',
          district: 'Centro',
          countryCode: 'ES',
          priorityScore: 64,
          fitScore: 61,
          confidence: 58,
        },
      ],
      metadata: {
        triggeredFrom: 'ops-monitor',
      },
    });
  }

  retryJob(jobId: string): Observable<JobRunResponse> {
    return this.http.post<JobRunResponse>(`${this.baseUrl}/jobs/${jobId}/retry`, {});
  }

  listSources(): Observable<SourceRegistry[]> {
    return this.http.get<SourceRegistry[]>(`${this.baseUrl}/sources`);
  }

  createSeedSource(payload: SourceRegistryCreate): Observable<SourceRegistry> {
    return this.http.post<SourceRegistry>(`${this.baseUrl}/sources`, payload);
  }

  toggleSource(source: SourceRegistry): Observable<SourceRegistry> {
    return this.http.patch<SourceRegistry>(`${this.baseUrl}/sources/${source.id}`, {
      isEnabled: !source.isEnabled,
    });
  }

  listRawItems(limit = 8): Observable<RawDiscoveryItem[]> {
    return this.http.get<RawDiscoveryItem[]>(`${this.baseUrl}/discovery/raw-items`, {
      params: new HttpParams().set('limit', limit),
    });
  }
}
