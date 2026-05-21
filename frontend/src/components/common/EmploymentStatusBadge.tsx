import React from 'react';
import { BookOpen, Briefcase, Building2, Clock3, HelpCircle, UserRound } from 'lucide-react';
import clsx from 'clsx';

interface EmploymentStatusBadgeProps {
  status?: string | null;
  label: string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { className: string; icon: React.ReactNode }> = {
  EMPLOYED_SPECIALTY: {
    className: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    icon: <Briefcase className="h-4 w-4" />,
  },
  EMPLOYED_NOT_SPECIALTY: {
    className: 'border-blue-100 bg-blue-50 text-blue-700',
    icon: <Building2 className="h-4 w-4" />,
  },
  SELF_EMPLOYED: {
    className: 'border-teal-100 bg-teal-50 text-teal-700',
    icon: <UserRound className="h-4 w-4" />,
  },
  CONTINUING_EDUCATION: {
    className: 'border-indigo-100 bg-indigo-50 text-indigo-700',
    icon: <BookOpen className="h-4 w-4" />,
  },
  UNEMPLOYED: {
    className: 'border-amber-100 bg-amber-50 text-amber-700',
    icon: <Clock3 className="h-4 w-4" />,
  },
  LOST_CONTACT: {
    className: 'border-gray-200 bg-gray-50 text-gray-600',
    icon: <HelpCircle className="h-4 w-4" />,
  },
};

const EmploymentStatusBadge: React.FC<EmploymentStatusBadgeProps> = ({ status, label, className }) => {
  const config = STATUS_CONFIG[status || ''] ?? STATUS_CONFIG.LOST_CONTACT;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ring-1 ring-white/50',
        config.className,
        className
      )}
    >
      {config.icon}
      {label}
    </span>
  );
};

export default EmploymentStatusBadge;
