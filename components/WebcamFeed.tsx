
import React, { useEffect, RefObject } from 'react';
import { FaceDetection, DetectionStatus } from '../types';

interface WebcamFeedProps {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  detections: FaceDetection[];
}

const WebcamFeed: React.FC<WebcamFeedProps> = ({ videoRef, canvasRef, detections }) => {

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const drawDetections = () => {
        // Match canvas size to video element size to ensure correct scaling
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        detections.forEach(detection => {
            const { box, status, confidence } = detection;
            
            // Coordinates are normalized, so scale them to the canvas dimensions
            const x = box.x * canvas.width;
            const y = box.y * canvas.height;
            const width = box.width * canvas.width;
            const height = box.height * canvas.height;

            // Set styles based on mask status
            const color = status === DetectionStatus.Mask ? '#22c55e' : '#ef4444'; // green-500 or red-500
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.fillStyle = color;
            ctx.font = '16px sans-serif';

            // Draw bounding box
            ctx.strokeRect(x, y, width, height);

            // Draw label background
            const label = `${status} (${(confidence * 100).toFixed(0)}%)`;
            const textWidth = ctx.measureText(label).width;
            ctx.fillRect(x, y - 22, textWidth + 10, 22);

            // Draw label text
            ctx.fillStyle = '#ffffff';
            ctx.fillText(label, x + 5, y - 5);
        });
    };
    
    // Use requestAnimationFrame for smoother rendering
    let animationFrameId: number;
    const renderLoop = () => {
        drawDetections();
        animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    return () => {
        cancelAnimationFrame(animationFrameId);
        // Clear canvas on cleanup
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };
  }, [detections, canvasRef, videoRef]);

  return (
    <>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
    </>
  );
};

export default WebcamFeed;
