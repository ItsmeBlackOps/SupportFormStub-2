import React from 'react';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">
        {title}
      </h3>
      <div className="mt-4">
        {children}
      </div>
    </div>
  );
}