export interface ChatComment {
  id: string;
  content: string;
  user_id: number;
  username: string;
  space_id: number;
  created_at: string;
  updated_at: string;
}

export interface ChatCommentsResponse {
  data: ChatComment[];
  page: number;
  page_size: number;
  total: number;
}
