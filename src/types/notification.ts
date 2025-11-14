export type NotificationType = 'reaction';

export type EntityType = 'post' | 'comment';

export interface Notification {
  id: string;
  type: NotificationType;
  entity_type: EntityType;
  entity_id: number;
  user_id: number;
  read: boolean;
  created_at: string;
  post_id?: number; 
}

export interface NotificationMessage {
  type: 'notification';
  data: Notification;
  timestamp: string;
}

