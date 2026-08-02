import React, { useEffect, useRef } from 'react';
import './NeuralNetworkBackground.css';

interface Node {
  x: number;
  y: number;
  layer: number;
}

interface Connection {
  from: Node;
  to: Node;
}

interface Pulse {
  connection: Connection;
  progress: number;
  speed: number;
}

const NeuralNetworkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(20);
  const pulsesRef = useRef<Pulse[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create network structure
    const layers = 5;
    const nodesPerLayer = [5, 8, 8, 8, 5];
    const nodes: Node[] = [];
    const connections: Connection[] = [];

    // Create nodes
    for (let layer = 0; layer < layers; layer++) {
      const nodeCount = nodesPerLayer[layer];
      const xPos = (canvas.width / (layers + 1)) * (layer + 1);
      
      for (let i = 0; i < nodeCount; i++) {
        const yPos = (canvas.height / (nodeCount + 1)) * (i + 1);
        nodes.push({ x: xPos, y: yPos, layer });
      }
    }

    // Create connections between adjacent layers
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const nextLayerNodes = nodes.filter(n => n.layer === node.layer + 1);
      
      nextLayerNodes.forEach(nextNode => {
        connections.push({ from: node, to: nextNode });
      });
    }

    // Initialize pulses
    const initializePulses = () => {
      pulsesRef.current = [];
      connections.forEach((connection, index) => {
        if (Math.random() > 0.7) { // Only 30% of connections start with a pulse
          pulsesRef.current.push({
            connection,
            progress: Math.random(),
            speed: 0.003 + Math.random() * 0.004
          });
        }
      });
    };
    initializePulses();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      connections.forEach(conn => {
        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(conn.to.x, conn.to.y);
        ctx.strokeStyle = 'rgba(100, 181, 246, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Update and draw pulses
      pulsesRef.current = pulsesRef.current.filter(pulse => {
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          // Pulse completed, maybe create new ones from this endpoint
          if (Math.random() > 0.6) {
            const nextConnections = connections.filter(
              c => c.from.x === pulse.connection.to.x && c.from.y === pulse.connection.to.y
            );
            nextConnections.forEach(nextConn => {
              if (Math.random() > 0.5) {
                pulsesRef.current.push({
                  connection: nextConn,
                  progress: 0,
                  speed: 0.003 + Math.random() * 0.004
                });
              }
            });
          }
          return false; // Remove completed pulse
        }

        // Draw pulse
        const x = pulse.connection.from.x + 
                  (pulse.connection.to.x - pulse.connection.from.x) * pulse.progress;
        const y = pulse.connection.from.y + 
                  (pulse.connection.to.y - pulse.connection.from.y) * pulse.progress;

        // Glowing pulse
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
        gradient.addColorStop(0, 'rgba(66, 165, 245, 0.9)');
        gradient.addColorStop(0.5, 'rgba(66, 165, 245, 0.5)');
        gradient.addColorStop(1, 'rgba(66, 165, 245, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Bright center
        ctx.fillStyle = 'rgba(144, 202, 249, 1)';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      // Occasionally add new pulses from input layer
      if (Math.random() > 0.97) {
        const inputConnections = connections.filter(c => c.from.layer === 0);
        const randomConn = inputConnections[Math.floor(Math.random() * inputConnections.length)];
        if (randomConn) {
          pulsesRef.current.push({
            connection: randomConn,
            progress: 0,
            speed: 0.003 + Math.random() * 0.004
          });
        }
      }

      // Draw nodes
      nodes.forEach(node => {
        // Check if any pulse is near this node
        const nearbyPulse = pulsesRef.current.some(pulse => {
          const x = pulse.connection.from.x + 
                    (pulse.connection.to.x - pulse.connection.from.x) * pulse.progress;
          const y = pulse.connection.from.y + 
                    (pulse.connection.to.y - pulse.connection.from.y) * pulse.progress;
          const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
          return distance < 30;
        });

        // Node glow
        if (nearbyPulse) {
          const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 15);
          glowGradient.addColorStop(0, 'rgba(66, 165, 245, 0.4)');
          glowGradient.addColorStop(1, 'rgba(66, 165, 245, 0)');
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 15, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node
        ctx.beginPath();
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = nearbyPulse ? 'rgba(144, 202, 249, 1)' : 'rgba(100, 181, 246, 0.6)';
        ctx.fill();
        
        // Node border
        ctx.strokeStyle = 'rgba(144, 202, 249, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
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
  }, []);

  return (
    <div className="neural-network-container">
      <canvas ref={canvasRef} className="neural-network-canvas" />
    </div>
  );
};

export default NeuralNetworkBackground;