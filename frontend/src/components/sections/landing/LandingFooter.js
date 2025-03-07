import React, { useEffect, useRef } from 'react';
import './landingFooter.css';

const LandingFooter = () => {
  const footerMoonRef = useRef(null);
  
  // Static vector moon for footer
  useEffect(() => {
    if (!footerMoonRef.current) return;
    
    const canvas = footerMoonRef.current;
    const ctx = canvas.getContext('2d');
    
    const drawFooterMoon = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 70;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw thin circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(191, 173, 127, 0.7)';
      ctx.lineWidth = 1.5;
      
      // Add subtle glow
      ctx.shadowColor = 'rgba(191, 173, 127, 0.3)';
      ctx.shadowBlur = 10;
      
      ctx.stroke();
      
      // Draw a few thin lines across for texture (very subtle)
      ctx.beginPath();
      ctx.moveTo(centerX - radius * 0.7, centerY - radius * 0.3);
      ctx.lineTo(centerX + radius * 0.7, centerY + radius * 0.3);
      ctx.strokeStyle = 'rgba(191, 173, 127, 0.2)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX - radius * 0.5, centerY + radius * 0.5);
      ctx.lineTo(centerX + radius * 0.5, centerY - radius * 0.5);
      ctx.stroke();
    };
    
    drawFooterMoon();
    
    window.addEventListener('resize', drawFooterMoon);
    return () => {
      window.removeEventListener('resize', drawFooterMoon);
    };
  }, []);

  return (
    <div className="footer-section">
      <canvas ref={footerMoonRef} className="footer-moon" width="200" height="200"></canvas>
      <div className="brand-mark">
        <span className="symbol">◊</span>
        <span className="year">2025</span>
      </div>
    </div>
  );
};

export default LandingFooter;