import React from 'react';

const Placeholder = ({ title, description }) => {
  return (
    <div className="px-8 py-8 w-full max-w-[1200px] mx-auto">
      <div className="bg-white border border-gray-100 rounded-xl p-12 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500">{description || 'This page is currently under construction.'}</p>
      </div>
    </div>
  );
};

export default Placeholder;
