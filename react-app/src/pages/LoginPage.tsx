import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const COLORS = {
  primary: '#1a237e',
  accent: '#2196f3',
  danger: '#f44336',
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { login } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      addNotification('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setLocalError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 100%)`,
        fontFamily: "'Segoe UI', Roboto, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 40,
          width: 380,
          maxWidth: '90vw',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontSize: 40 }}>✈️</span>
          <h1 style={{ margin: '8px 0 4px', fontSize: 22, color: COLORS.primary }}>
            GlobalTravel Corp
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: 14 }}>Sign in to the Travel Portal</p>
        </div>

        {localError && (
          <div
            style={{
              background: '#ffebee',
              color: COLORS.danger,
              padding: '10px 14px',
              borderRadius: 6,
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {localError}
          </div>
        )}

        <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#333' }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@company.com"
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: 14,
            border: '1px solid #ccc',
            borderRadius: 6,
            marginBottom: 16,
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />

        <label style={{ display: 'block', marginBottom: 4, fontSize: 13, fontWeight: 600, color: '#333' }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: 14,
            border: '1px solid #ccc',
            borderRadius: 6,
            marginBottom: 24,
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '12px 0',
            fontSize: 15,
            fontWeight: 600,
            color: '#fff',
            background: submitting ? '#999' : COLORS.primary,
            border: 'none',
            borderRadius: 6,
            cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {submitting ? 'Signing in…' : 'Enter Portal'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
