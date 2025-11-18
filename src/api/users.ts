import api from "./client";
import type { User } from "../types/user";
import { getUserPosts, getUserComments } from "./index";

interface LoginResponse {
  user: User;
  token: string;
}

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await api.post("/auth/login", { email, password });

    if (response.data && response.data.token && response.data.user) {
      return response.data;
    }

    console.warn("Unexpected login API response structure:", response.data);
    throw new Error("Invalid login data structure");
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const register = async (
  name: string,
  last_name: string,
  email: string,
  password: string,
  image?: string
): Promise<LoginResponse> => {
  try {
    const response = await api.post("/auth/register", {
      name,
      last_name,
      email,
      password,
      image,
    });

    if (response.data && response.data.token) {
      console.log("Register API Response:", response.data);
      return response.data;
    }

    console.warn("Unexpected register API response structure:", response.data);
    throw new Error("Invalid register data structure");
  } catch (error) {
    console.error("Error registering:", error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await api.get("/users/current", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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

export const getUserById = async (userId: number): Promise<User> => {
  try {
    const response = await api.get(`/users/${userId}`);

    if (response.data && response.data.id) {
      return response.data;
    }

    console.warn(
      "Unexpected user by ID API response structure:",
      response.data
    );
    throw new Error("Invalid user data structure");
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
};

export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    const response = await api.get(
      `/users?full_name=${encodeURIComponent(query)}`
    );
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error searching users:", error);
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
    console.error("Error adding space to user:", error);
    throw error;
  }
};

interface UserStats {
  totalPosts: number;
  totalComments: number;
}

export const getUserStats = async (userId: number): Promise<UserStats> => {
  try {
    // Obtener total de posts
    const postsResponse = await getUserPosts(userId, 1, 1);
    const totalPosts = postsResponse.total || 0;

    // Obtener total de comentarios
    const commentsResponse = await getUserComments(userId, 1, 1);
    const totalComments = commentsResponse.total || 0;

    return { totalPosts, totalComments };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return { totalPosts: 0, totalComments: 0 };
  }
};

interface UpdateUserData {
  id: number;
  name?: string;
  last_name?: string;
  image?: string;
}

export const updateUser = async (userData: UpdateUserData): Promise<void> => {
  try {
    const payload: Record<string, string> = {};

    if (userData.name !== undefined) {
      payload.name = userData.name;
    }
    if (userData.last_name !== undefined) {
      payload.last_name = userData.last_name;
    }
    if (userData.image !== undefined) {
      payload.image = userData.image;
    }

    await api.put(`/users/${userData.id}`, payload);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};
