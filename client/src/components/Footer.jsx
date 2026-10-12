import React from 'react';
import { ArrowRight, Globe, Share2, Compass, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-newsletter-banner">
        <div className="footer-container newsletter-flex">
          <div className="newsletter-text">
            <span className="newsletter-caps">STAY INFORMED</span>
            <h3 className="newsletter-headline">SUBSCRIBE FOR ADVANCE DROP ACCESS</h3>
            <p className="newsletter-sub">Be the first to know about capsule collaborations, seasonal sales, and store events.</p>
          </div>
          <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Subscribed to drop notifications!'); }}>
            <input type="email" placeholder="ENTER YOUR EMAIL ADDRESS" required />
            <button type="submit">
              JOIN
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>

      <div className="footer-container footer-links-grid">
        <div className="footer-col">
          <h4 className="footer-col-title">COLLECTIONS</h4>
          <ul>
            <li><a href="#men">Men's Athletic & Tailored</a></li>
            <li><a href="#women">Women's Contemporary</a></li>
            <li><a href="#footwear">Footwear Innovations</a></li>
            <li><a href="#outerwear">Studio Outerwear</a></li>
            <li><a href="#capsule">Archive Editions</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">CUSTOMER SERVICES</h4>
          <ul>
            <li><a href="#shipping">Track Your Order</a></li>
            <li><a href="#returns">Returns & Exchanges</a></li>
            <li><a href="#shipping-policy">Shipping Guidelines</a></li>
            <li><a href="#store-locator">Flagship Stores</a></li>
            <li><a href="#faq">Payment Options</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">COMPANY</h4>
          <ul>
            <li><a href="#about">About Aura / Archive</a></li>
            <li><a href="#sustainability">Circular Fashion & Materials</a></li>
            <li><a href="#careers">Careers</a></li>
            <li><a href="#press">Press Room</a></li>
            <li><a href="#terms">Legal Notice & Privacy</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">STORE CONNECT</h4>
          <p className="footer-text">
            Full-stack React & MySQL implementation. Minimalist luxury fashion interface inspired by Zara's editorial elegance and Nike's performance innovation.
          </p>
          <div className="social-icons-row">
            <a href="#globe" className="social-icon" title="Global Store"><Globe size={18} /></a>
            <a href="#explore" className="social-icon" title="Lookbook"><Compass size={18} /></a>
            <a href="#share" className="social-icon" title="Community"><Share2 size={18} /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="footer-container footer-bottom-flex">
          <span>© 2026 AURA / ARCHIVE ENTERPRISES. ALL RIGHTS RESERVED.</span>
          <div className="footer-bottom-links">
            <a href="#privacy">PRIVACY POLICY</a>
            <a href="#terms">TERMS OF SALE</a>
            <a href="#cookies">COOKIE SETTINGS</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
