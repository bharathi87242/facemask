
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full max-w-4xl text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
        Gemini Vision: Face Mask Detector
      </h1>
      <p className="mt-4 text-lg text-gray-300">
        Real-time AI analysis to identify face masks through your camera feed.
      </p>
    </header>
  );
};

export default Header;
