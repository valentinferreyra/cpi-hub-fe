import React from 'react';

interface NoSpacesMessageProps {
  message: string;
}

const NoSpacesMessage: React.FC<NoSpacesMessageProps> = ({ message }) => {
  return (
    <div className="no-spaces-message">
      <p>{message}</p>
    </div>
  );
};

export default NoSpacesMessage;
