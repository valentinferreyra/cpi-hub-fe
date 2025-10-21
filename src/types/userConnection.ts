export interface UserStatus {
  user_id: number;
  status: 'online' | 'offline';
  timestamp: string;
}

export interface UserConnectionMessage {
  type: 'user_status';
  user_id: number;
  status: 'online' | 'offline';
  timestamp: string;
}

export interface UseUserConnectionProps {
  currentUser: any;
}
