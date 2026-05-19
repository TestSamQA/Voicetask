import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationDto, PagedNotifications } from '../../shared/models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/notifications`;

  getNotifications(isRead?: boolean, page = 1, pageSize = 20): Observable<PagedNotifications> {
    let p = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (isRead != null) p = p.set('isRead', isRead);
    return this.http.get<PagedNotifications>(this.base, { params: p });
  }

  markRead(id: string): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/read`, {});
  }

  markAllRead(): Observable<void> {
    return this.http.post<void>(`${this.base}/read-all`, {});
  }
}
