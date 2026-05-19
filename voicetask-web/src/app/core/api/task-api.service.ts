import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateTaskRequest, PagedResult, PatchTaskRequest, TaskDetailResponse, TaskResponse, UpdateTaskRequest } from '../../shared/models/task.model';

export interface TaskQueryParams {
  status?: number;
  priority?: number;
  assigneeId?: string;
  labelId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBase}/tasks`;

  getTasks(params: TaskQueryParams = {}): Observable<PagedResult<TaskResponse>> {
    let p = new HttpParams();
    Object.entries(params).forEach(([k, v]) => { if (v != null) p = p.set(k, String(v)); });
    return this.http.get<PagedResult<TaskResponse>>(this.base, { params: p });
  }

  getTask(id: string): Observable<TaskDetailResponse> {
    return this.http.get<TaskDetailResponse>(`${this.base}/${id}`);
  }

  createTask(req: CreateTaskRequest): Observable<TaskResponse> {
    return this.http.post<TaskResponse>(this.base, req);
  }

  updateTask(id: string, req: UpdateTaskRequest): Observable<TaskResponse> {
    return this.http.put<TaskResponse>(`${this.base}/${id}`, req);
  }

  patchTask(id: string, req: PatchTaskRequest): Observable<TaskResponse> {
    return this.http.patch<TaskResponse>(`${this.base}/${id}`, req);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getUnacknowledged(): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(`${this.base}/unacknowledged`);
  }

  acknowledgeTask(id: string): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/acknowledge`, {});
  }

  getSubtasks(id: string): Observable<TaskResponse[]> {
    return this.http.get<TaskResponse[]>(`${this.base}/${id}/subtasks`);
  }
}
