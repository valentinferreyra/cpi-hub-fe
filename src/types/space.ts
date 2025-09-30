import type { SimpleUser } from "./post";

export interface Space {
  id: number;
  name: string;
  description: string;
  users: number;
  posts: number;
  created_at: string;
  created_by: SimpleUser;
  updated_at: string;
  updated_by: SimpleUser;
}
