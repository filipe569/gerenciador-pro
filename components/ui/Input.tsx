
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, icon, className = '', ...props }, ref) => {
    return (
      <div>
        {label && <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">{icon}</div>}
          <input
            id={id}
            ref={ref}
            className={`w-full bg-gray-900 border border-gray-700 rounded-md py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition ${icon ? 'pl-10' : 'px-3'} ${className}`}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
