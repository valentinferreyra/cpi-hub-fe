import api from "./client";
import type { User } from "../types/user";

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

export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    const response = await api.get(`/users?full_name=${encodeURIComponent(query)}`);
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
  const response = await api.put(`/users/${userId}/spaces/${spaceId}/add`);
  return response.data;
};
