import React from 'react';

export const SimpleTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Simple Test Page</h1>
        <p className="text-gray-600">If you can see this, the routing is working!</p>
        <div className="mt-4">
          <a href="/login" className="text-blue-500 hover:underline">Go to Login</a>
        </div>
      </div>
    </div>
  );
};
