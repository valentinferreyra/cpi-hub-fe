import axios from "axios";
import type { User, SpaceUser } from "../types/user";
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

export const getSpaceById = async (spaceId: number): Promise<Space | null> => {
  try {
    const response = await api.get(`/spaces/${spaceId}`);

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
    const response = await api.get(`/posts?q=${encodeURIComponent(query)}`);
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
    throw error;
  }
};

export const createSpace = async (
  userId: number,
  name: string,
  description: string
): Promise<Space | null> => {
  try {
    const response = await api.post(`/spaces`, {
      name: name,
      description: description,
      created_by: userId,
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error creating space:", error);
    return null;
  }
};

export const getSpacesByCreatedAt = async (
  page: number = 1,
  pageSize: number = 20
): Promise<Space[]> => {
  try {
    const response = await api.get(
      `/spaces?order_by=created_at&page=${page}&page_size=${pageSize}`
    );

    if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data)
    ) {
      return response.data.data;
    }

    console.warn(
      "Unexpected API response structure for spaces by created_at:",
      response.data
    );
    return [];
  } catch (error) {
    console.error("Error getting spaces by created_at:", error);
    return [];
  }
};

export const getSpacesByUpdatedAt = async (
  page: number = 1,
  pageSize: number = 20
): Promise<Space[]> => {
  try {
    const response = await api.get(
      `/spaces?order_by=updated_at&page=${page}&page_size=${pageSize}`
    );

    if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data)
    ) {
      return response.data.data;
    }

    console.warn(
      "Unexpected API response structure for spaces by updated_at:",
      response.data
    );
    return [];
  } catch (error) {
    console.error("Error getting spaces by updated_at:", error);
    return [];
  }
};

export const GetSpacesByName = async (
  name: string,
  page: number = 1,
  pageSize: number = 20
): Promise<Space[]> => {
  try {
    const response = await api.get(
      `/spaces?name=${encodeURIComponent(
        name
      )}&page=${page}&page_size=${pageSize}`
    );

    if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data)
    ) {
      return response.data.data;
    }

    console.warn(
      "Unexpected API response structure for spaces by name:",
      response.data
    );
    return [];
  } catch (error) {
    console.error("Error getting spaces by name:", error);
    return [];
  }
};

export const getSpaceUsers = async (spaceId: number): Promise<SpaceUser[]> => {
  try {
    const response = await api.get(`/spaces/${spaceId}/users`);
    return response.data;
  } catch (error) {
    console.error("Error getting space users:", error);
    return [];
  }
};

export const getUserById = async (userId: number): Promise<User> => {
  try {
    const response = await api.get(`/users/${userId}`);

    if (response.data && response.data.id) {
      return response.data;
    }

    console.warn("Unexpected user by ID API response structure:", response.data);
    throw new Error("Invalid user data structure");
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
};

export const getUserComments = async (userId: number, page: number = 1, pageSize: number = 5): Promise<{
  data: any[];
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

export const getUserPosts = async (userId: number, page: number = 1, pageSize: number = 5): Promise<{
  data: Post[];
  page: number;
  page_size: number;
  total: number;
}> => {
  try {
    const response = await api.get(`/posts?user_id=${userId}&page=${page}&page_size=${pageSize}`);
    return response.data;
  } catch (error) {
    console.error("Error getting user posts:", error);
    return { data: [], page: 1, page_size: 5, total: 0 };
  }
};

export default api;
