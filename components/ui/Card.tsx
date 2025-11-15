import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  return (
    <div
      className={cn('card', onClick && 'cursor-pointer hover:shadow-medium transition-shadow', className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

