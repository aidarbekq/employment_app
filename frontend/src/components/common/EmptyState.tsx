import React from 'react';
import clsx from 'clsx';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, actions, className }) => (
  <div className={clsx('rounded-3xl border border-dashed border-gray-200 bg-gray-50/70 px-6 py-12 text-center', className)}>
    {icon && <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm">{icon}</div>}
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    {description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">{description}</p>}
    {actions && <div className="mt-5 flex justify-center">{actions}</div>}
  </div>
);

export default EmptyState;
