import { useState } from 'react';
import { sendChatMessage } from '@/api/chat';
import type { SendMessageData } from '@/api/chat';
import './MessageInput.css';

interface MessageInputProps {
  currentUser: any;
  spaceId: string | undefined;
  onMessageSent: () => void;
}

export const MessageInput = ({ currentUser, spaceId, onMessageSent }: MessageInputProps) => {
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentUser || !spaceId || isSending) return;

    try {
      setIsSending(true);
      const numericSpaceId = typeof spaceId === 'string' ? parseInt(spaceId, 10) : spaceId;
      if (isNaN(numericSpaceId)) {
        throw new Error('ID de espacio inválido');
      }

      const messageData: SendMessageData = {
        space_id: numericSpaceId,
        user_id: currentUser.id,
        username: `${currentUser.name} ${currentUser.last_name}`,
        message: inputMessage.trim(),
        image: currentUser.image
      };
      
      await sendChatMessage(messageData);
      setInputMessage("");
      onMessageSent();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error al enviar el mensaje. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-chat-input-section">
      <input
        className="space-chat-input"
        type="text"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Escribe un mensaje..."
        disabled={isSending}
      />
      <button 
        className="space-chat-send-btn" 
        onClick={handleSendMessage}
        disabled={isSending || !inputMessage.trim()}
      >
{isSending ? '...' : '>'}
      </button>
    </div>
  );
};
