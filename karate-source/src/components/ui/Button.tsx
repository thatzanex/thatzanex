import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-red-700 text-white border-red-700 hover:bg-transparent hover:text-red-500',
  secondary: 'bg-transparent text-white border-neutral-700 hover:border-white',
  outline: 'bg-transparent text-red-600 border-red-700 hover:bg-red-950',
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  onClick,
  disabled = false,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-3 font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 text-sm border-2 disabled:opacity-40 disabled:cursor-not-allowed ${VARIANT_STYLES[variant]} ${className}`}
  >
    {children}
  </button>
);

export default Button;
