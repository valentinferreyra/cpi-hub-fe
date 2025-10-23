import api from "./client";
import type { Post } from "../types/post";

export const getPostsBySpaceIds = async (
  spaceIds: string[]
): Promise<Post[]> => {
  try {
    console.warn("getPostsBySpaceIds not implemented yet", spaceIds);
    return [];
  } catch (error) {
    console.error("Error getting posts by space ids:", error);
    throw error;
  }
};

export const getPostsByUserId = async (
  userId: number,
  page: number
): Promise<{
  data: Post[];
  page: number;
  page_size: number;
  total: number;
}> => {
  try {
    const response = await api.get(
      `/users/${userId}/interested-posts?page=${page}&page_size=20`
    );

    return response.data;
  } catch (error) {
    console.error("Error getting posts by user id:", error);
    return { data: [], page: 1, page_size: 20, total: 0 };
  }
};

export const getPostById = async (postId: string): Promise<Post | null> => {
  try {
    const response = await api.get(`/posts/${postId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error getting post by id:", error);
    return null;
  }
};

export const getPostsBySpaceId = async (spaceId: number): Promise<Post[]> => {
  try {
    const response = await api.get(`/posts?space_id=${spaceId}`);

    if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data)
    ) {
      return response.data.data;
    }

    console.warn(
      "Unexpected API response structure for space posts:",
      response.data
    );
    return [];
  } catch (error) {
    console.error("Error getting posts by space id:", error);
    return [];
  }
};

export const createPost = async (
  title: string,
  content: string,
  created_by: number,
  spaceId: number
): Promise<Post> => {
  try {
    const response = await api.post(`/posts`, {
      title: title,
      content: content,
      created_by: created_by,
      space_id: spaceId,
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const searchPosts = async (query: string): Promise<Post[]> => {
  try {
    const response = await api.get(`/posts?q=${encodeURIComponent(query)}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error searching posts:", error);
    return [];
  }
};

export const getUserPosts = async (
  userId: number,
  page: number = 1,
  pageSize: number = 5
): Promise<{
  data: Post[];
  page: number;
  page_size: number;
  total: number;
}> => {
  try {
    const response = await api.get(
      `/posts?user_id=${userId}&page=${page}&page_size=${pageSize}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting user posts:", error);
    return { data: [], page: 1, page_size: 5, total: 0 };
  }
};

export const updatePost = async (
  postId: number,
  title: string,
  content: string
): Promise<void> => {
  try {
    const response = await api.put(`/posts/${postId}`, {
      post_id: postId,
      title: title,
      content: content,
    });
    void response;
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
};
