import type { SimpleUser, SimpleSpace } from "./post";

export type TimeFrame = "24h" | "7d" | "30d" | "";

export interface TrendingPost {
  id: number;
  title: string;
  content: string;
  image: string | null;
  created_at: string;
  updated_at: string;
  updated_by: number;
  created_by: SimpleUser;
  space: SimpleSpace;
  comments: TrendingComment[];
}

export interface TrendingComment {
  id: number;
  post_id: number;
  content: string;
  image: string | null;
  created_by: SimpleUser;
  created_at: string;
  space?: SimpleSpace;
}

export interface TrendingUser {
  id: number;
  name: string;
  last_name: string;
  email: string;
  image: string;
  likes_count: number;
}

export interface TrendingPostsResponse {
  data: TrendingPost[];
  page: number;
  page_size: number;
  total: number;
}

export interface TrendingCommentsResponse {
  data: TrendingComment[];
  page: number;
  page_size: number;
  total: number;
}

export interface TrendingUsersResponse {
  data: TrendingUser[];
  page: number;
  page_size: number;
  total: number;
}
