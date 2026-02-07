import React from 'react';
import { cn } from '../utils/cn';

const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    primary: 'bg-primary-50 text-primary-700 border-primary-100',
    success: 'bg-green-50 text-green-700 border-green-100',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    danger: 'bg-red-50 text-red-700 border-red-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
  };

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-semibold border",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};

export default Badge;
