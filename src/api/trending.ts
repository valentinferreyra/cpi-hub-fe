import api from "./client";
import type {
  TrendingPostsResponse,
  TrendingCommentsResponse,
  TrendingUsersResponse,
  TimeFrame,
} from "../types/trending";

export const getTrendingPosts = async (
  timeFrame: TimeFrame = "7d",
  page: number = 1,
  pageSize: number = 6
): Promise<TrendingPostsResponse> => {
  try {
    const response = await api.get(
      `/posts/trending?time_frame=${timeFrame}&page=${page}&page_size=${pageSize}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting trending posts:", error);
    return { data: [], page: 1, page_size: pageSize, total: 0 };
  }
};

export const getTrendingComments = async (
  timeFrame: TimeFrame = "7d",
  page: number = 1,
  pageSize: number = 5
): Promise<TrendingCommentsResponse> => {
  try {
    const response = await api.get(
      `/comments/trending?time_frame=${timeFrame}&page=${page}&page_size=${pageSize}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting trending comments:", error);
    return { data: [], page: 1, page_size: pageSize, total: 0 };
  }
};

export const getTrendingUsers = async (
  timeFrame: TimeFrame = "7d",
  page: number = 1,
  pageSize: number = 9
): Promise<TrendingUsersResponse> => {
  try {
    const response = await api.get(
      `/users/trending?time_frame=${timeFrame}&page=${page}&page_size=${pageSize}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting trending users:", error);
    return { data: [], page: 1, page_size: pageSize, total: 0 };
  }
};
