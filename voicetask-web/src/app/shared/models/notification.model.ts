export interface NotificationDto {
  id: string;
  message: string;
  isRead: boolean;
  taskId?: string;
  taskTitle?: string;
  createdAt: string;
}

export interface PagedNotifications {
  items: NotificationDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
