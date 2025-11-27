
import React from 'react';

export const Spinner: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
        <p className="text-white text-lg mt-4 font-semibold">Processando...</p>
      </div>
    </div>
  );
};
