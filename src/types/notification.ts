export interface Notification {
  id: string;
  title: string;
  description: string;
  url?: string;
  to: number;
  read: boolean;
  created_at: string;
}

export interface CreateNotificationDTO {
  title: string;
  description: string;
  url?: string;
  to: number;
}

