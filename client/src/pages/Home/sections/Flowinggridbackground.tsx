import React, { useEffect, useRef } from 'react';
import './FlowingGridBackground.css';

interface FlowingGridBackgroundProps {
  opacity?: number;
  rows?: number;
  cols?: number;
  speed?: number;
}

const FlowingGridBackground: React.FC<FlowingGridBackgroundProps> = ({
  opacity = 0.5,
  rows = 20,
  cols = 30,
  speed = 0.02
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(null);
  const timeRef = useRef(0);
  const gridRef = useRef<Array<{ row: number; col: number; phase: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      initializeGrid();
    };

    const initializeGrid = () => {
      gridRef.current = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          gridRef.current.push({
            row,
            col,
            phase: Math.random() * Math.PI * 2
          });
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      timeRef.current += speed;
      
      const cellWidth = canvas.width / cols;
      const cellHeight = canvas.height / rows;

      gridRef.current.forEach(cell => {
        const x = cell.col * cellWidth;
        const y = cell.row * cellHeight;
        
        // Create multiple wave patterns for organic movement
        const wave1 = Math.sin(cell.col * 0.3 + timeRef.current + cell.phase);
        const wave2 = Math.sin(cell.row * 0.3 + timeRef.current * 0.8);
        const wave3 = Math.sin((cell.col + cell.row) * 0.2 + timeRef.current * 1.2);
        
        // Combine waves for interesting patterns
        const intensity = (wave1 + wave2 + wave3) / 3;
        const normalizedIntensity = (intensity + 1) / 2; // 0 to 1
        
        // Draw grid lines
        ctx.strokeStyle = `rgba(100, 181, 246, ${0.1 + normalizedIntensity * 0.1})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellWidth, cellHeight);
        
        // Draw glowing cells when intensity is high
        if (normalizedIntensity > 0.7) {
          const glowIntensity = (normalizedIntensity - 0.7) / 0.3;
          
          // Cell glow
          const gradient = ctx.createRadialGradient(
            x + cellWidth / 2, 
            y + cellHeight / 2, 
            0, 
            x + cellWidth / 2, 
            y + cellHeight / 2, 
            Math.max(cellWidth, cellHeight)
          );
          gradient.addColorStop(0, `rgba(66, 165, 245, ${0.6 * glowIntensity})`);
          gradient.addColorStop(0.5, `rgba(66, 165, 245, ${0.3 * glowIntensity})`);
          gradient.addColorStop(1, 'rgba(66, 165, 245, 0)');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, cellWidth, cellHeight);
          
          // Bright center dot
          ctx.fillStyle = `rgba(144, 202, 249, ${0.8 * glowIntensity})`;
          ctx.beginPath();
          ctx.arc(
            x + cellWidth / 2, 
            y + cellHeight / 2, 
            Math.min(cellWidth, cellHeight) * 0.3, 
            0, 
            Math.PI * 2
          );
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [rows, cols, speed]);

  return (
    <div ref={containerRef} className="flowing-grid-container">
      <canvas 
        ref={canvasRef} 
        className="flowing-grid-canvas"
        style={{ opacity }}
      />
    </div>
  );
};

export default FlowingGridBackground;