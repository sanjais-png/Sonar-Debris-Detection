import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'normal' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'normal',
  ...props
}) => {
  const paddingMap = {
    none: 'p-0',
    sm: 'p-4',
    normal: 'p-5 md:p-6',
    large: 'p-6 md:p-8',
  };

  return (
    <div
      className={`bg-surface border border-border rounded-card shadow-subtle ${paddingMap[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
