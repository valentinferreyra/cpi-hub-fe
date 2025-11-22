export interface Event {
  type: string;
  user_id: number;
  target_user_id: number;
  metadata: Record<string, any>;
  timestamp: string;
}

export interface EventMessage {
  type: 'event';
  data: Event;
  timestamp: string;
}

