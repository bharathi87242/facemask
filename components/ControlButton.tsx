
import React from 'react';

interface ControlButtonProps {
  isCameraOn: boolean;
  onClick: () => void;
}

const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4h3l2-2h6l2 2h3v2H4V4zm16 4v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8h16zM12 9c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z" />
    </svg>
);


const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 6h12v12H6V6z" />
    </svg>
);

const ControlButton: React.FC<ControlButtonProps> = ({ isCameraOn, onClick }) => {
  const baseClasses = "flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 ease-in-out transform hover:scale-105";
  const startClasses = "bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-500";
  const stopClasses = "bg-red-600 hover:bg-red-500 focus:ring-red-500";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isCameraOn ? stopClasses : startClasses}`}
    >
      {isCameraOn ? (
        <>
            <StopIcon className="w-5 h-5" />
            <span>Stop Detection</span>
        </>
      ) : (
        <>
            <CameraIcon className="w-5 h-5" />
            <span>Start Detection</span>
        </>
      )}
    </button>
  );
};

export default ControlButton;
