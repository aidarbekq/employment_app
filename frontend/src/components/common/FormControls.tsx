import React, { useState } from 'react';
import clsx from 'clsx';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const fieldClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500';

export const textareaClass = `${fieldClass} min-h-[112px] resize-y`;

interface BaseFieldProps {
  label: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

type InputFieldProps = BaseFieldProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> & {
    inputClassName?: string;
  };

type TextareaFieldProps = BaseFieldProps &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
    textareaClassName?: string;
  };

type SelectFieldProps = BaseFieldProps &
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> & {
    selectClassName?: string;
  };

export const InputField: React.FC<InputFieldProps> = ({
  label,
  helperText,
  required,
  className,
  inputClassName,
  ...props
}) => (
  <label className={clsx('block space-y-1.5', className)}>
    <span className="text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-error-600">*</span>}
    </span>
    <input {...props} required={required} className={clsx(fieldClass, inputClassName)} />
    {helperText && <span className="block text-xs text-gray-500">{helperText}</span>}
  </label>
);



type PasswordFieldProps = BaseFieldProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'type'> & {
    inputClassName?: string;
  };

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  helperText,
  required,
  className,
  inputClassName,
  autoComplete = 'new-password',
  ...props
}) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <label className={clsx('block space-y-1.5', className)}>
      <span className="text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-error-600">*</span>}
      </span>
      <div className="relative">
        <input
          {...props}
          type={visible ? 'text' : 'password'}
          required={required}
          autoComplete={autoComplete}
          className={clsx(fieldClass, 'pr-12', inputClassName)}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute right-2.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
          aria-label={visible ? t('auth.hidePassword') : t('auth.showPassword')}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {helperText && <span className="block text-xs text-gray-500">{helperText}</span>}
    </label>
  );
};

export const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  helperText,
  required,
  className,
  textareaClassName,
  ...props
}) => (
  <label className={clsx('block space-y-1.5', className)}>
    <span className="text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-error-600">*</span>}
    </span>
    <textarea {...props} required={required} className={clsx(textareaClass, textareaClassName)} />
    {helperText && <span className="block text-xs text-gray-500">{helperText}</span>}
  </label>
);

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  helperText,
  required,
  className,
  selectClassName,
  children,
  ...props
}) => (
  <label className={clsx('block space-y-1.5', className)}>
    <span className="text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-error-600">*</span>}
    </span>
    <select {...props} required={required} className={clsx(fieldClass, selectClassName)}>
      {children}
    </select>
    {helperText && <span className="block text-xs text-gray-500">{helperText}</span>}
  </label>
);

interface SwitchFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const SwitchField: React.FC<SwitchFieldProps> = ({ label, description, checked, onChange, className }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={clsx(
      'flex w-full items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-primary-200 hover:bg-primary-50/40',
      className
    )}
  >
    <span>
      <span className="block text-sm font-semibold text-gray-800">{label}</span>
      {description && <span className="mt-1 block text-xs leading-5 text-gray-500">{description}</span>}
    </span>
    <span
      className={clsx(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition',
        checked ? 'bg-primary-600' : 'bg-gray-200'
      )}
    >
      <span
        className={clsx(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow transition',
          checked ? 'translate-x-5' : 'translate-x-1'
        )}
      />
    </span>
  </button>
);