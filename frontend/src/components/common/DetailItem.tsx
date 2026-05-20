import React from 'react';
import clsx from 'clsx';

interface DetailItemProps {
  label: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  emptyText?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, icon, className, emptyText = '—' }) => {
  const isEmpty = value === undefined || value === null || value === '';
  return (
    <div className={clsx('rounded-2xl border border-gray-100 bg-gray-50/70 p-4', className)}>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {icon}
        {label}
      </div>
      {isEmpty ? (
        <p className="text-sm italic text-gray-400">{emptyText}</p>
      ) : (
        <div className="break-words text-sm font-medium leading-6 text-gray-900">{value}</div>
      )}
    </div>
  );
};

export default DetailItem;
