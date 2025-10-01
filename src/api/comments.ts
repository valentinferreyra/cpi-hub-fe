import api from "./client";
import type { Comment } from "../types/comment";

export const addCommentToPost = async (
  created_by: number,
  postId: string,
  content: string
): Promise<Comment> => {
  try {
    const response = await api.post(`/posts/${postId}/comments`, {
      content: content,
      created_by: created_by,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding comment to post:", error);
    throw error;
  }
};

export const getUserComments = async (userId: number, page: number = 1, pageSize: number = 5): Promise<{
  data: Comment[];
  page: number;
  page_size: number;
  total: number;
}> => {
  try {
    const response = await api.get(`/comments?user_id=${userId}&page=${page}&page_size=${pageSize}`);
    return response.data;
  } catch (error) {
    console.error("Error getting user comments:", error);
    return { data: [], page: 1, page_size: 5, total: 0 };
  }
};
