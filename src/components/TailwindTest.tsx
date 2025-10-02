import React from 'react';

export const TailwindTest: React.FC = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Tailwind CSS Test
        </h1>
        
        {/* Color Test */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Color Palette Test</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary-500 text-white p-4 rounded-lg text-center">
              Primary
            </div>
            <div className="bg-developer-500 text-white p-4 rounded-lg text-center">
              Developer
            </div>
            <div className="bg-agent-500 text-white p-4 rounded-lg text-center">
              Agent
            </div>
            <div className="bg-admin-500 text-white p-4 rounded-lg text-center">
              Admin
            </div>
          </div>
        </div>

        {/* Typography Test */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Typography Test</h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Small text (text-sm)</p>
            <p className="text-base text-gray-700">Base text (text-base)</p>
            <p className="text-lg text-gray-800">Large text (text-lg)</p>
            <p className="text-xl text-gray-900">Extra large text (text-xl)</p>
            <p className="text-2xl font-bold text-gray-900">Bold heading (text-2xl font-bold)</p>
          </div>
        </div>

        {/* Spacing Test */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Spacing Test</h2>
          <div className="space-y-2">
            <div className="bg-blue-100 p-2 rounded">Padding 2 (p-2)</div>
            <div className="bg-green-100 p-4 rounded">Padding 4 (p-4)</div>
            <div className="bg-yellow-100 p-6 rounded">Padding 6 (p-6)</div>
            <div className="bg-red-100 p-8 rounded">Padding 8 (p-8)</div>
          </div>
        </div>

        {/* Responsive Test */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Responsive Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-purple-100 p-4 rounded-lg text-center">
              Responsive Grid Item 1
            </div>
            <div className="bg-pink-100 p-4 rounded-lg text-center">
              Responsive Grid Item 2
            </div>
            <div className="bg-indigo-100 p-4 rounded-lg text-center">
              Responsive Grid Item 3
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ Tailwind CSS is working correctly!
        </div>
      </div>
    </div>
  );
};
