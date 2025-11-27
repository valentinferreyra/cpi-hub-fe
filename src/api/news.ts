import axiosInstance from "./client";
import type { News } from "../types/news";

export const getNews = async (): Promise<News[]> => {
  const response = await axiosInstance.get<News[]>("/news");
  return response.data;
};
