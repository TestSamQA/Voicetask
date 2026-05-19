import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConfirmVoiceRequest, VoiceCaptureResponse } from '../../shared/models/voice.model';

@Injectable({ providedIn: 'root' })
export class VoiceApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/voice`;

  extract(transcript: string): Observable<VoiceCaptureResponse> {
    return this.http.post<VoiceCaptureResponse>(`${this.base}/extract`, { transcript });
  }

  confirm(req: ConfirmVoiceRequest): Observable<string[]> {
    return this.http.post<string[]>(`${this.base}/confirm`, req);
  }
}
