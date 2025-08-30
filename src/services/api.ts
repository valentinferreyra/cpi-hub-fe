import axios from "axios";
import type { User } from "../types/user";
import type { Post } from "../types/post";
import { mockLatestPosts } from "../data/mockLatestPosts";

const api = axios.create({
  baseURL: "http://localhost:8080/v1",
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

export const getCurrentUser = async (_userId: string): Promise<User> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const response = await api.get(`/users/${_userId}`);
    console.log("API Response:", response.data.data);
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
    await new Promise((resolve) => setTimeout(resolve, 400));

    const mockResponse = mockLatestPosts;

    return mockResponse;
  } catch (error) {
    console.error("Error getting posts by space ids:", error);
    throw error;
  }
};

export default api;
