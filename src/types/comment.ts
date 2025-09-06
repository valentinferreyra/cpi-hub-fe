import type { SimpleUser } from "./post";

export interface Comment {
    id: string;
    content: string;
    created_at: string;
    created_by: SimpleUser;
    updated_at: string;
    updated_by: string;
  }