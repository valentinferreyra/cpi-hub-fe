import api from "./client";

export interface ReactionCount {
  likes_count: number;
  dislikes_count: number;
}

export interface Reaction {
  id: string;
  user_id: number;
  entity_type: string;
  entity_id: number;
  action: string;
}

export const getReactionCount = async (
  entityType?: string,
  entityId?: number,
  userId?: number
): Promise<ReactionCount> => {
  try {
    const payload: {
      entity_type?: string;
      entity_id?: number;
      user_id?: number;
    } = {};

    if (entityType) {
      payload.entity_type = entityType;
    }

    if (entityId) {
      payload.entity_id = entityId;
    }

    if (userId) {
      payload.user_id = userId;
    }

    const response = await api.post("/reactions/count", payload);
    return response.data;
  } catch (error) {
    console.error("Error getting reaction count:", error);
    return { likes_count: 0, dislikes_count: 0 };
  }
};

export const addReaction = async (
  userId: number,
  entityType: "post" | "comment",
  entityId: number,
  action: "like" | "dislike"
): Promise<Reaction> => {
  try {
    const response = await api.post("/reactions", {
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      action: action,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding reaction:", error);
    throw error;
  }
};
