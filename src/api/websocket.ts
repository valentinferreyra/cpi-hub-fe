const WEBSOCKET_BASE_URL = 'ws://localhost:8080/v1/ws';

export const createUserConnectionWebSocket = (userId: number): WebSocket => {
  const wsUrl = `${WEBSOCKET_BASE_URL}/user-connection?user_id=${userId}`;
  return new WebSocket(wsUrl);
};

export const createChatWebSocket = (spaceId: number, userId: number, username: string): WebSocket => {
  const fullName = encodeURIComponent(username);
  const wsUrl = `${WEBSOCKET_BASE_URL}/spaces/${spaceId}?user_id=${userId}&username=${fullName}`;
  return new WebSocket(wsUrl);
};

export const createNotificationWebSocket = (userId: number): WebSocket => {
  const wsUrl = `${WEBSOCKET_BASE_URL}/notifications?user_id=${userId}`;
  return new WebSocket(wsUrl);
};
