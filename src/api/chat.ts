import api from "./client";
import type { ChatCommentsResponse } from "../types/chat";

export const getSpaceChatComments = async (
  spaceId: number,
  page: number = 1,
  pageSize: number = 25
): Promise<ChatCommentsResponse> => {
  const response = await api.get(
    `/messages?space_id=${spaceId}&page=${page}&page_size=${pageSize}`
  );
  return response.data;
};
