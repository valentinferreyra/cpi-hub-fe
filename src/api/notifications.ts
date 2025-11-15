import api from "./client";
import type { Notification } from "../types/notification";

export interface NotificationsResponse {
  data: Notification[];
  page: number;
  page_size: number;
  total: number;
}

export interface UnreadCountResponse {
  count: number;
}

export const getNotifications = async (
  userId: number,
  limit: number = 50,
  offset: number = 0
): Promise<Notification[]> => {
  try {
    const response = await api.get(`/users/${userId}/notifications?limit=${limit}&offset=${offset}`);
    
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data?.notifications && Array.isArray(response.data.notifications)) {
      return response.data.notifications;
    }
    
    console.warn("Unexpected notifications API response structure:", response.data);
    return [];
  } catch (error) {
    console.error("Error getting notifications:", error);
    return [];
  }
};

export const getUnreadCount = async (userId: number): Promise<number> => {
  try {
    const response = await api.get(`/users/${userId}/notifications/unread-count`);
    
    if (response.data?.unread_count !== undefined) {
      return response.data.unread_count;
    } else if (typeof response.data === 'number') {
      return response.data;
    } else if (response.data?.count !== undefined) {
      return response.data.count;
    }
    
    console.warn("Unexpected unread count API response structure:", response.data);
    return 0;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
};

export const markNotificationAsRead = async (
  userId: number,
  notificationId: string
): Promise<boolean> => {
  try {
    await api.put(`/users/${userId}/notifications/${notificationId}/read`);
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

export const markAllNotificationsAsRead = async (userId: number): Promise<boolean> => {
  try {
    await api.put(`/users/${userId}/notifications/read-all`);
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
};

