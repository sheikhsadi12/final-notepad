import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

interface VisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ analyser, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { accent } = useTheme();

  useEffect(() => {
    if (!canvasRef.current || !analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Color map based on accent
    const colors: Record<string, string> = {
      emerald: '#10b981',
      blue: '#3b82f6',
      rose: '#f43f5e',
    };
    const color = colors[accent] || '#10b981';

    const draw = () => {
      if (!isPlaying) {
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         // Draw a flat line
         ctx.beginPath();
         ctx.moveTo(0, canvas.height / 2);
         ctx.lineTo(canvas.width, canvas.height / 2);
         ctx.strokeStyle = '#374151'; // gray-700
         ctx.lineWidth = 2;
         ctx.stroke();
         return;
      }

      animationId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2; // Scale down

        ctx.fillStyle = color;
        // Draw rounded bars centered vertically
        const y = (canvas.height - barHeight) / 2;
        
        // Simple smoothing for look
        if (barHeight > 0) {
            ctx.fillRect(x, y, barWidth, barHeight);
        }

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [analyser, isPlaying, accent]);

  return (
    <canvas 
        ref={canvasRef} 
        width={200} 
        height={40} 
        className="w-full h-full rounded-lg"
    />
  );
};

export default Visualizer;