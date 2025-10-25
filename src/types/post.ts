import type { Comment } from "./comment";

export interface Post {
  id: string;
  title: string;
  content: string;
  image?: string; 
  created_at: string;
  created_by: SimpleUser;
  updated_at: string;
  updated_by: SimpleUser;
  space: SimpleSpace;
  comments: Comment[];
}

export interface SimpleUser {
  id: number;
  name: string;
  last_name: string;
  image: string;
}

export interface SimpleSpace {
  id: string;
  name: string;
}
