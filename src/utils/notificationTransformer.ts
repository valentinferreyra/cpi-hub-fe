import type { Event } from '../types/event';
import type { CreateNotificationDTO } from '../types/notification';

export const transformEventToNotification = (
  event: Event,
  currentUserId: number
): CreateNotificationDTO | null => {
  if (event.target_user_id !== currentUserId) {
    return null;
  }

  switch (event.type) {
    case 'reaction_created':
      return transformReactionEvent(event);
    case 'comment_created':
      return transformCommentEvent(event);
    case 'comment_reply_created':
      return transformCommentReplyEvent(event);
    default:
      return null;
  }
};

const transformReactionEvent = (event: Event): CreateNotificationDTO | null => {
  const { entity_type, entity_id, post_id } = event.metadata;
  
  if (!entity_type || !entity_id) {
    return null;
  }

  const entityName = entity_type === 'post' ? 'post' : 'comentario';
  const postId = post_id || entity_id;

  return {
    title: 'Nueva reacción',
    description: `Alguien reaccionó a tu ${entityName}`,
    url: `/post/${postId}`,
    to: event.target_user_id,
  };
};

const transformCommentEvent = (event: Event): CreateNotificationDTO | null => {
  const { post_id, user_name, user_first_name, user_last_name, comment_content, comment_text } = event.metadata;

  if (!post_id) {
    return null;
  }

  const userName = user_name || 
    (user_first_name && user_last_name ? `${user_first_name} ${user_last_name}` : null);
  
  const title = userName ? `${userName} comentó tu post` : 'Nuevo comentario';
  
  const commentText = comment_content || comment_text;
  let description = 'Alguien comentó en tu post';
  if (commentText) {
    const commentPreview = commentText.length > 50 
      ? `${commentText.substring(0, 50)}...` 
      : commentText;
    description = commentPreview;
  }

  return {
    title,
    description,
    url: `/post/${post_id}`,
    to: event.target_user_id,
  };
};

const transformCommentReplyEvent = (event: Event): CreateNotificationDTO | null => {
  const { post_id, comment_id, user_name, user_first_name, user_last_name, comment_content, comment_text } = event.metadata;

  if (!post_id || !comment_id) {
    return null;
  }

  const userName = user_name || 
    (user_first_name && user_last_name ? `${user_first_name} ${user_last_name}` : null);
  
  const title = userName ? `${userName} ha respondido a tu comentario` : 'Respuesta a tu comentario';
  
  const commentText = comment_content || comment_text;
  let description = 'Alguien respondió a tu comentario';
  if (commentText) {
    const commentPreview = commentText.length > 50 
      ? `${commentText.substring(0, 50)}...` 
      : commentText;
    description = commentPreview;
  }

  return {
    title,
    description,
    url: `/post/${post_id}#comment-${comment_id}`,
    to: event.target_user_id,
  };
};

