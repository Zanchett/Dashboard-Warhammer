import React, { useEffect, useRef } from 'react';

const WarpFluctuationGraph: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation variables
    let animationFrameId: number;
    const waves = [
      { frequency: 0.02, amplitude: 30, speed: 0.04, offset: 0 },
      { frequency: 0.03, amplitude: 15, speed: 0.02, offset: 4 },
      { frequency: 0.01, amplitude: 20, speed: 0.01, offset: 2 }
    ];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#14f074';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let x = 0; x < canvas.width; x++) {
        let y = canvas.height / 2;
        
        // Combine multiple sine waves
        waves.forEach(wave => {
          wave.offset += wave.speed;
          y += Math.sin(x * wave.frequency + wave.offset) * wave.amplitude;
        });

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        border: '1px solid rgba(20, 240, 116, 0.3)'
      }} 
    />
  );
};

export default WarpFluctuationGraph;

