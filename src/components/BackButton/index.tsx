'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ className = '' }) => {
  const router = useRouter();

  const goBack = () => {
    router.push("/?returning=true");
  };

  return (
    <button
      onClick={goBack}
      className={`flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </button>
  );
};

export default BackButton;