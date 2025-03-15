'use client'

import React from 'react';

export default function Home() {
  return (
    <div className="container animate-fade-in" style={{ color: 'var(--color-text)' }}>
      <section className="text-center">
        <h1 className="text-6xl" style={{ color: 'var(--color-primary)' }}>Welcome</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>A personal portfolio and showcase</p>
        <div className="divider"></div>
      </section>
      
      <section>
        <div className="card">
          <h2 style={{ color: 'var(--color-primary)' }}>About Me</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            I consider myself a curator of experiences, much like the Plain Doll. 
            I guide visitors through this digital realm with careful attention to detail.
          </p>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            My favorite color is gold—the warm, muted tones that invoke a sense of timeless elegance. 
            Youll notice this preference reflected throughout this sites design, from the subtle 
            highlights to the carefully crafted interactive elements.
          </p>
        </div>
      </section>
      
      <section>
        <h3 style={{ color: 'var(--color-primary-light)' }}>Featured Projects</h3>
        <div className="visualization-container">
          <div className="p-4">
            <p style={{ color: 'var(--color-primary)' }}>Projects coming soon...</p>
            <button className="button mt-4">Learn More</button>
          </div>
        </div>
      </section>
    </div>
  );
}