import api from "./client";
import type { ChatComment, ChatCommentsResponse } from "../types/chat";

export const getSpaceChatComments = async (
  spaceId: number,
  page: number = 1,
  pageSize: number = 10
): Promise<ChatCommentsResponse> => {
  const response = await api.get(
    `/spaces/${spaceId}/chat/messages?page=${page}&page_size=${pageSize}`
  );
  return response.data;
};
