
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const finalClasses = `bg-gray-800/50 border border-gray-700 shadow-lg rounded-xl p-6 ${className}`;
  return (
    <div className={finalClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
