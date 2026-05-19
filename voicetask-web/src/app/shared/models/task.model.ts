export enum Priority { Low = 0, Medium = 1, High = 2, Critical = 3 }
export enum TaskStatus { ToDo = 0, InProgress = 1, Done = 2, Cancelled = 3 }

export interface LabelSummary {
  id: string;
  name: string;
  colour: string;
}

export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string;
  isDeleted: boolean;
  assignmentAcknowledgedAt?: string;
  createdById: string;
  createdByUsername: string;
  assigneeId?: string;
  assigneeUsername?: string;
  parentTaskId?: string;
  createdAt: string;
  updatedAt: string;
  labels: LabelSummary[];
  subTaskCount: number;
}

export interface TaskDetailResponse extends TaskResponse {
  subTasks: TaskResponse[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string;
  assigneeId?: string;
  parentTaskId?: string;
  labelIds?: string[];
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string;
  assigneeId?: string;
  labelIds?: string[];
}

export interface PatchTaskRequest {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: string;
  assigneeId?: string;
  labelIds?: string[];
}
