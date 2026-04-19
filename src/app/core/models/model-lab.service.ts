import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ModelRegistryEntry, ModelTrainRequest, ModelTrainResponse, TrainingRun } from './model-lab.models';

@Injectable({ providedIn: 'root' })
export class ModelLabService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/models`;

  train(payload: ModelTrainRequest = { activateBest: true }): Observable<ModelTrainResponse> {
    return this.http.post<ModelTrainResponse>(`${this.baseUrl}/train`, payload);
  }

  listModels(): Observable<ModelRegistryEntry[]> {
    return this.http.get<ModelRegistryEntry[]>(this.baseUrl);
  }

  getModel(id: string): Observable<ModelRegistryEntry> {
    return this.http.get<ModelRegistryEntry>(`${this.baseUrl}/${id}`);
  }

  activateModel(id: string): Observable<ModelRegistryEntry> {
    return this.http.post<ModelRegistryEntry>(`${this.baseUrl}/${id}/activate`, {});
  }

  listRuns(): Observable<TrainingRun[]> {
    return this.http.get<TrainingRun[]>(`${this.baseUrl}/runs`);
  }
}
