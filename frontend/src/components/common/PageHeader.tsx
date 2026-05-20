import React from 'react';
import clsx from 'clsx';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon, actions, className }) => {
  return (
    <div
      className={clsx(
        'flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white/90 p-5 shadow-sm backdrop-blur sm:p-6 lg:flex-row lg:items-center lg:justify-between',
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-4">
        {icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 ring-1 ring-primary-100">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:justify-end">{actions}</div>}
    </div>
  );
};

export default PageHeader;
