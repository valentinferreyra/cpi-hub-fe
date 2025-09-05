import type { SimpleUser } from "./post";

export interface Space {
  id: string;
  name: string;
  description: string;
  created_at: string; 
  created_by: SimpleUser;
  updated_at: string;
  updated_by: SimpleUser;
}
