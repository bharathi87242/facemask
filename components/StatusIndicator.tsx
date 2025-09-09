
import React from 'react';

interface StatusIndicatorProps {
  message: string;
  isDetecting: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ message, isDetecting }) => {
  return (
    <div className="flex items-center space-x-2 bg-gray-900/60 backdrop-blur-sm text-white py-2 px-4 rounded-full shadow-lg">
      {isDetecting && (
        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
      )}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export default StatusIndicator;
