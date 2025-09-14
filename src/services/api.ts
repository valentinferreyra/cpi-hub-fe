import axios from "axios";
import type { User } from "../types/user";
import type { Post } from "../types/post";
import type { Space } from "../types/space";

const api = axios.create({
  baseURL: "/api/v1",
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
    console.log("User API Response:", response.data);
    
    if (response.data && response.data.id) {
      return response.data;
    }
    
    console.warn("Unexpected user API response structure:", response.data);
    throw new Error("Invalid user data structure");
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
    
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    console.warn("Unexpected API response structure:", response.data);
    return [];
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
    const response = await api.get(`/posts?space_id=${spaceId}`);
    console.log("Posts by space API Response:", response.data);
    
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    console.warn("Unexpected API response structure for space posts:", response.data);
    return [];
  } catch (error) {
    console.error("Error getting posts by space id:", error);
    return [];
  }
};

export const getSpaceById = async (spaceId: number): Promise<Space | null> => {
  try {
    const response = await api.get(`/spaces/${spaceId}`);
    console.log("Space API Response:", response.data);
    
    if (response.data && response.data.id) {
      return response.data;
    } else if (response.data && response.data.data && response.data.data.id) {
      return response.data.data;
    }
    
    console.warn("Unexpected space API response structure:", response.data);
    return null;
  } catch (error) {
    console.error("Error getting space by id:", error);
    return null;
  }
};

export const addCommentToPost = async (
  created_by: number,
  postId: string,
  content: string
): Promise<any> => {
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
    const response = await api.get(
      `/posts/search?q=${encodeURIComponent(query)}`
    );
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error searching posts:", error);
    return [];
  }
};

export const removeSpaceFromUser = async (
  userId: number,
  spaceId: number
): Promise<void> => {
  try {
    const response = await api.put(`/users/${userId}/spaces/${spaceId}/remove`);
    return response.data;
  } catch (error) {
    console.error("Error removing space from user:", error);
    throw error;
  }
};

export const addSpaceToUser = async (
  userId: number,
  spaceId: number
): Promise<void> => {
  try {
    const response = await api.put(`/users/${userId}/spaces/${spaceId}/add`);
    return response.data;
  } catch (error) {
    console.log("Error adding space to user:", error);
    throw error;
  }
};

export const getSpacesByCreatedAt = async (page: number = 1, pageSize: number = 20): Promise<Space[]> => {
  try {
    const response = await api.get(`/spaces?order_by=created_at&page=${page}&page_size=${pageSize}`);
    console.log("Spaces by created_at API Response:", response.data);
    
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    console.warn("Unexpected API response structure for spaces by created_at:", response.data);
    return [];
  } catch (error) {
    console.error("Error getting spaces by created_at:", error);
    return [];
  }
};

export const getSpacesByUpdatedAt = async (page: number = 1, pageSize: number = 20): Promise<Space[]> => {
  try {
    const response = await api.get(`/spaces?order_by=updated_at&page=${page}&page_size=${pageSize}`);
    console.log("Spaces by updated_at API Response:", response.data);
    
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    console.warn("Unexpected API response structure for spaces by updated_at:", response.data);
    return [];
  } catch (error) {
    console.error("Error getting spaces by updated_at:", error);
    return [];
  }
};

export default api;
