import type { SimpleUser } from "./post";

export interface Comment {
    id: number;
    post_id: number;
    content: string;
    created_at: string;
    created_by: SimpleUser;
    space: {
        id: number;
        name: string;
    };
}

export interface CommentsResponse {
    data: Comment[];
    page: number;
    page_size: number;
    total: number;
}