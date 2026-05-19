import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateLabelRequest, Label } from '../../shared/models/label.model';

@Injectable({ providedIn: 'root' })
export class LabelApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/labels`;

  getLabels(): Observable<Label[]> {
    return this.http.get<Label[]>(this.base);
  }

  createLabel(req: CreateLabelRequest): Observable<Label> {
    return this.http.post<Label>(this.base, req);
  }

  deleteLabel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
