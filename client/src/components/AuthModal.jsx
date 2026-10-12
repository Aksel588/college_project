import React, { useState } from 'react';
import { X, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { api } from '../api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let data;
      if (mode === 'login') {
        data = await api.login(email, password);
      } else {
        data = await api.register(name, email, password);
      }

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-icon" onClick={onClose}>
          <X size={22} />
        </button>

        <div className="auth-brand-badge">ARCHIVE MEMBERSHIP</div>
        <h2 className="auth-title">
          {mode === 'login' ? 'SIGN IN TO YOUR PROFILE' : 'CREATE YOUR ACCOUNT'}
        </h2>
        <p className="auth-sub">
          {mode === 'login'
            ? 'Access your orders, saved addresses, and express checkout.'
            : 'Join our member club for member-only drops and tailored recommendations.'}
        </p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="input-group">
              <label>FULL NAME</label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  type="text"
                  placeholder="e.g. Aksel Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label>EMAIL ADDRESS</label>
            <div className="input-with-icon">
              <Mail size={18} className="field-icon" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>PASSWORD</label>
            <div className="input-with-icon">
              <Lock size={18} className="field-icon" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="solid-btn block-btn auth-submit" disabled={loading}>
            {loading ? 'PROCESSING...' : mode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-switch-prompt">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button 
                type="button" 
                className="switch-link" 
                onClick={() => { setMode('register'); setError(''); }}
              >
                Create one now
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button 
                type="button" 
                className="switch-link" 
                onClick={() => { setMode('login'); setError(''); }}
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
