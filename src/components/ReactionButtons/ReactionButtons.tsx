import { useState, useEffect } from 'react';
import { getReactionCount, addReaction } from '@/api/reactions';
import { useAppContext } from '@/context/AppContext';
import likeIcon from '@/assets/like.png';
import dislikeIcon from '@/assets/dislike.png';
import './ReactionButtons.css';

interface ReactionButtonsProps {
  entityType: 'post' | 'comment';
  entityId: number;
  onReactionChange?: () => void;
}

export const ReactionButtons: React.FC<ReactionButtonsProps> = ({
  entityType,
  entityId,
  onReactionChange,
}) => {
  const { currentUser } = useAppContext();
  const [reactionScore, setReactionScore] = useState<number>(0);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReactions = async () => {
    if (!currentUser) return;

    try {
      const totalReactions = await getReactionCount(entityType, entityId);
      const score = totalReactions.likes_count - totalReactions.dislikes_count;
      setReactionScore(score);

      const userReactionData = await getReactionCount(entityType, entityId, currentUser.id);
      if (userReactionData.likes_count > 0) {
        setUserReaction('like');
      } else if (userReactionData.dislikes_count > 0) {
        setUserReaction('dislike');
      } else {
        setUserReaction(null);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  useEffect(() => {
    fetchReactions();
  }, [entityId]);

  const handleReaction = async (action: 'like' | 'dislike') => {
    if (isLoading || !currentUser) return;

    try {
      setIsLoading(true);
      await addReaction(currentUser.id, entityType, entityId, action);

      // Actualizar el estado local inmediatamente
      await fetchReactions();

      // Notificar al componente padre si existe el callback
      if (onReactionChange) {
        onReactionChange();
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reaction-buttons">
      <button
        className={`reaction-btn like-btn ${userReaction === 'like' ? 'active' : ''}`}
        onClick={() => handleReaction('like')}
        disabled={isLoading}
      >
        <img src={likeIcon} alt="Like" className="reaction-icon" />
      </button>
      <span className="reaction-count">{reactionScore}</span>
      <button
        className={`reaction-btn dislike-btn ${userReaction === 'dislike' ? 'active' : ''}`}
        onClick={() => handleReaction('dislike')}
        disabled={isLoading}
      >
        <img src={dislikeIcon} alt="Dislike" className="reaction-icon" />
      </button>
    </div>
  );
};

export default ReactionButtons;
