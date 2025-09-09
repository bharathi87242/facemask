
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FaceDetection, DetectionStatus } from './types';
import { detectMasksInImage } from './services/geminiService';
import WebcamFeed from './components/WebcamFeed';
import Header from './components/Header';
import StatusIndicator from './components/StatusIndicator';
import ControlButton from './components/ControlButton';

const App: React.FC = () => {
  const [detections, setDetections] = useState<FaceDetection[]>([]);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Click "Start Detection" to begin');
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopDetectionLoop = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setIsDetecting(false);
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
      setDetections([]);
    }
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setStatusMessage('Requesting camera access...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraOn(true);
        setStatusMessage('Camera activated. Starting detection...');
        return true;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Camera access denied. Please allow camera permissions in your browser settings.');
      setStatusMessage('Camera access denied.');
      setIsCameraOn(false);
      return false;
    }
    return false;
  }, []);

  const captureAndDetect = useCallback(async () => {
    if (!videoRef.current || videoRef.current.readyState < 3) {
      return;
    }
    setIsDetecting(true);
    setStatusMessage('Analyzing frame...');

    const video = videoRef.current;
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth;
    captureCanvas.height = video.videoHeight;
    const ctx = captureCanvas.getContext('2d');
    
    if (!ctx) {
      setError('Could not get canvas context.');
      setIsDetecting(false);
      return;
    }
    
    ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
    const base64Image = captureCanvas.toDataURL('image/jpeg');

    try {
      const results = await detectMasksInImage(base64Image);
      setDetections(results);
      const maskCount = results.filter(d => d.status === DetectionStatus.Mask).length;
      const noMaskCount = results.filter(d => d.status === DetectionStatus.NoMask).length;
      setStatusMessage(`Detection complete. Masks: ${maskCount}, No Masks: ${noMaskCount}.`);
    } catch (err) {
      console.error('Detection error:', err);
      setError('An error occurred during detection. Please try again.');
      setStatusMessage('Detection failed.');
      setDetections([]);
    } finally {
      setIsDetecting(false);
    }
  }, []);
  
  const startDetectionLoop = useCallback(() => {
    if (detectionIntervalRef.current) return;
    captureAndDetect(); // Run once immediately
    detectionIntervalRef.current = setInterval(captureAndDetect, 2500); // Then every 2.5 seconds
  }, [captureAndDetect]);

  const handleToggleDetection = useCallback(async () => {
    if (isCameraOn) {
      stopDetectionLoop();
      stopCamera();
      setStatusMessage('Detection stopped. Click "Start Detection" to begin.');
    } else {
      const cameraStarted = await startCamera();
      if (cameraStarted) {
        startDetectionLoop();
      }
    }
  }, [isCameraOn, startCamera, stopCamera, startDetectionLoop, stopDetectionLoop]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetectionLoop();
      stopCamera();
    };
  }, [stopDetectionLoop, stopCamera]);


  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 md:p-8">
      <Header />
      <div className="w-full max-w-4xl bg-gray-800 rounded-2xl shadow-2xl overflow-hidden mt-8 border-2 border-indigo-500/30">
        <div className="relative aspect-video">
          <WebcamFeed videoRef={videoRef} canvasRef={canvasRef} detections={detections} />
          <div className="absolute top-4 right-4">
             <StatusIndicator message={statusMessage} isDetecting={isDetecting} />
          </div>
        </div>
        <div className="p-6 bg-gray-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-300 text-sm md:text-base flex-grow">
            {error || 'Point your camera at a face to see the detection in action.'}
          </p>
          <ControlButton isCameraOn={isCameraOn} onClick={handleToggleDetection} />
        </div>
      </div>
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>Powered by Gemini Vision API & React. Designed for demonstration purposes.</p>
      </footer>
    </div>
  );
};

export default App;
