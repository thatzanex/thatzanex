import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (() => void) | null;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick = null }) => (
  <div
    onClick={onClick ?? undefined}
    className={`bg-[#0a0a0a] border border-neutral-800 p-6 relative group transition-colors duration-200 ${
      onClick ? 'cursor-pointer hover:border-red-600' : ''
    } ${className}`}
  >
    {/* Decorative corner accent */}
    <div
      className={`absolute top-0 right-0 w-2 h-2 bg-neutral-800 transition-colors duration-200 ${
        onClick ? 'group-hover:bg-red-600' : ''
      }`}
    />
    {children}
  </div>
);

export default Card;
