import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserRole, UserSummary } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/admin`;

  getUsers(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(`${this.base}/users`);
  }

  updateUser(id: string, role: UserRole): Observable<UserSummary> {
    return this.http.patch<UserSummary>(`${this.base}/users/${id}`, { role });
  }
}
