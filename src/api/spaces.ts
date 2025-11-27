import api from "./client";
import type { Space } from "../types/space";
import type { SpaceUser } from "../types/user";

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

export const searchSpaces = async (query: string): Promise<Space[]> => {
  try {
    const response = await api.get(`/spaces?q=${encodeURIComponent(query)}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error searching spaces:", error);
    return [];
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
