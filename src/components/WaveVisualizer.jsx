// ============================================
// WAVE VISUALIZER
// ============================================
// Cinematic audio visualization for AI voice

import { useEffect, useRef } from 'react';

export default function WaveVisualizer({ isSpeaking }) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        window.onresize = () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        };

        let time = 0;

        // Wave configuration
        const waves = [
            { amplitude: 30, frequency: 0.02, speed: 0.1, color: 'rgba(0, 200, 255, 0.6)' },
            { amplitude: 40, frequency: 0.01, speed: 0.08, color: 'rgba(0, 128, 255, 0.4)' },
            { amplitude: 20, frequency: 0.03, speed: 0.12, color: 'rgba(255, 255, 255, 0.2)' }
        ];

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Base line
            const centerY = height / 2;

            if (isSpeaking) {
                // Active speaking animation (turbulent waves)
                time += 0.2;

                waves.forEach(wave => {
                    ctx.beginPath();
                    ctx.moveTo(0, centerY);

                    for (let x = 0; x < width; x++) {
                        const y = centerY +
                            Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude *
                            Math.sin(x / width * Math.PI); // Taper ends
                        ctx.lineTo(x, y);
                    }

                    ctx.strokeStyle = wave.color;
                    ctx.lineWidth = 3;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                });

                // Glow effect
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#00c8ff';

            } else {
                // Idle animation (gentle straight line 'breathing')
                time += 0.05;
                ctx.beginPath();
                ctx.moveTo(0, centerY);
                ctx.lineTo(width, centerY);
                ctx.strokeStyle = 'rgba(0, 200, 255, 0.3)';
                ctx.lineWidth = 2 + Math.sin(time) * 1;
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#00c8ff';
                ctx.stroke();
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => cancelAnimationFrame(animationRef.current);
    }, [isSpeaking]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: '100%',
                height: '120px',
                filter: 'drop-shadow(0 0 10px rgba(0, 200, 255, 0.4))'
            }}
        />
    );
}
