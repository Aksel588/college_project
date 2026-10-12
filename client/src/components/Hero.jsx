import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function Hero({ onExploreClick }) {
  return (
    <section className="hero-editorial">
      <div className="hero-backdrop">
        <img 
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2000&q=85" 
          alt="Spring 2026 Campaign" 
          className="hero-image"
        />
        <div className="hero-overlay"></div>
      </div>

      <div className="hero-content">
        <div className="hero-badge">NEW SEASON '26 / HIGH PERFORMANCE & MINIMAL TAILORING</div>
        <h1 className="hero-title">
          FORM FOLLOWS <br />
          <span>FUNCTION.</span>
        </h1>
        <p className="hero-desc">
          Engineered athletic aerodynamics meets high-fashion Spanish minimalism. Monochromatic precision cut for motion.
        </p>

        <div className="hero-actions">
          <button className="hero-btn-primary" onClick={onExploreClick}>
            DISCOVER THE DROP
            <ArrowUpRight size={18} />
          </button>
          <div className="hero-stat-pill">
            <span className="live-dot"></span>
            <span>LIVE DATABASE CONNECTED VIA MYSQL</span>
          </div>
        </div>
      </div>
    </section>
  );
}
