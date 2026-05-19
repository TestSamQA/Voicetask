import { Priority, TaskStatus } from './task.model';

export interface ParsedTask {
  title: string;
  description?: string;
  priority: string;
  dueDate?: string;
  labels: string[];
  subtasks: ParsedSubTask[];
}

export interface ParsedSubTask {
  title: string;
  description?: string;
  priority: string;
  dueDate?: string;
  labels: string[];
}

export interface VoiceCaptureResponse {
  captureId: string;
  transcript: string;
  tasks: ParsedTask[];
}

export interface ConfirmVoiceRequest {
  captureId: string;
  tasks: ConfirmTask[];
}

export interface ConfirmTask {
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string;
  assigneeId?: string;
  labelIds: string[];
  subTasks: { title: string }[];
}
