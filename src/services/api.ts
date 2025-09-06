import axios from "axios";
import type { User } from "../types/user";
import type { Post } from "../types/post";
import type { Space } from "../types/space";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getCurrentUser = async (userId: number): Promise<User> => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error getting current user:", error);
    throw error;
  }
};

export const getPostsBySpaceIds = async (
  _spaceIds: string[]
): Promise<Post[]> => {
  try {
    console.warn("getPostsBySpaceIds not implemented yet");
    return [];
  } catch (error) {
    console.error("Error getting posts by space ids:", error);
    throw error;
  }
};

export const getPostsByUserId = async (userId: number): Promise<Post[]> => {
  try {
    const response = await api.get(`/users/${userId}/interested-posts`);
    console.log("Posts API Response:", response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error getting posts by user id:", error);
    console.log("No posts available");
    return [];
  }
};

export const getPostById = async (postId: string): Promise<Post | null> => {
  try {
    const response = await api.get(`/posts/${postId}`);
    console.log("Post API Response:", response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error getting post by id:", error);
    return null;
  }
};

export const getPostsBySpaceId = async (spaceId: number): Promise<Post[]> => {
  try {
    const response = await api.get(`/posts/search?space_id=${spaceId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error getting posts by space id:", error);
    return [];
  }
};

export const getSpaceById = async (spaceId: number): Promise<Space | null> => {
  try {
    const response = await api.get(`/spaces/${spaceId}`);
    console.log("Space API Response:", response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error getting space by id:", error);
    return null;
  }
};

export const addCommentToPost = async (postId: string, content: string): Promise<any> => {
  try {
    const response = await api.post(`/posts/${postId}/comments`, {
      content: content,
      created_by: 16
    });
    return response.data;
  } catch (error) {
    console.error("Error adding comment to post:", error);
    throw error;
  }
};

export const createPost = async (title: string, content: string, spaceId: number): Promise<Post> => {
  try {
    const response = await api.post(`/posts`, {
      title: title,
      content: content,
      created_by: 16,
      space_id: spaceId
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const searchPosts = async (query: string): Promise<Post[]> => {
  try {
    const response = await api.get(`/posts/search?q=${encodeURIComponent(query)}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error searching posts:", error);
    return [];
  }
};

export default api;
