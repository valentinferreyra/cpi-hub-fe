import { useState, useEffect } from 'react';
import { getReactionCount, addReaction, deleteReaction, getUserLikes } from '@/api/reactions';
import { useAppContext } from '@/context/AppContext';
import likeIcon from '@/assets/like.png';
import dislikeIcon from '@/assets/dislike.png';
import './ReactionButtons.css';

interface ReactionButtonsProps {
  entityType: 'post' | 'comment';
  entityId: number;
  onReactionChange?: () => void;
  initialUserReaction?: 'like' | 'dislike' | null;
  initialReactionId?: string | null;
}

export const ReactionButtons: React.FC<ReactionButtonsProps> = ({
  entityType,
  entityId,
  onReactionChange,
  initialUserReaction,
  initialReactionId,
}) => {
  const { currentUser } = useAppContext();
  const [reactionScore, setReactionScore] = useState<number>(0);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reactionId, setReactionId] = useState<string | null>(null);

  const fetchTotals = async () => {
    try {
      const totalReactions = await getReactionCount(entityType, entityId);
      const score = totalReactions.likes_count - totalReactions.dislikes_count;
      setReactionScore(score);
    } catch (error) {
      console.error('Error fetching reactions totals:', error);
    }
  };



  const fetchUserReactionDetails = async () => {
    if (!currentUser) return;
    try {
      const res = await getUserLikes(currentUser.id, [{ entity_type: entityType, entity_id: entityId }]);
      const r = res[0];
      if (r) {
        setUserReaction(r.liked ? 'like' : r.disliked ? 'dislike' : null);
        setReactionId(r.reaction_id ?? null);
      }
    } catch (error) {
      console.error('Error fetching user reaction details:', error);
    }
  };

  useEffect(() => {
    fetchTotals();
    if (initialUserReaction !== undefined) {
      setUserReaction(initialUserReaction);
      setReactionId(initialReactionId ?? null);
    } else {
      fetchUserReactionDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId, initialUserReaction, initialReactionId, currentUser?.id]);

  const handleReaction = async (action: 'like' | 'dislike') => {
    if (isLoading || !currentUser) return;

    try {
      setIsLoading(true);
      if (userReaction === action) {
        if (reactionId) {
          await deleteReaction(reactionId);
          setReactionId(null);
          setUserReaction(null);
          await fetchTotals();
        } else {
          await fetchUserReactionDetails();
          if (reactionId) {
            await deleteReaction(reactionId);
            setReactionId(null);
            setUserReaction(null);
            await fetchTotals();
          }
        }
      } else {
        const created = await addReaction(currentUser.id, entityType, entityId, action);
        setReactionId(created.id || null);
        await fetchTotals();
        setUserReaction(action);
      }

      if (onReactionChange) {
        onReactionChange();
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  let countClass = 'reaction-count';
  if (reactionScore > 0) countClass += ' positive';
  else if (reactionScore < 0) countClass += ' negative';

  return (
    <div className="reaction-buttons">
      <button
        className={`reaction-btn like-btn ${userReaction === 'like' ? 'active' : ''}`}
        onClick={() => handleReaction('like')}
        disabled={isLoading}
      >
        <img src={likeIcon} alt="Like" className="reaction-icon" />
      </button>
      <span className={countClass}>{reactionScore}</span>
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
