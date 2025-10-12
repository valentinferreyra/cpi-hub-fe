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

export interface SendMessageData {
  space_id: number;
  user_id: number;
  username: string;
  message: string;
  image?: string;
}

export const sendChatMessage = async (messageData: SendMessageData): Promise<any> => {
  const response = await api.post(
    `/ws/spaces/${messageData.space_id}/chat`,
    messageData,
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};
