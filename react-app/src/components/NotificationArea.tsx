import React from 'react';
import { useNotifications } from '../context/NotificationContext';

const containerStyle: React.CSSProperties = {
  position: 'fixed',
  top: 16,
  right: 16,
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  maxWidth: 380,
  pointerEvents: 'none',
};

const typeStyles: Record<string, { bg: string; border: string; color: string; icon: string }> = {
  success: { bg: '#e8f5e9', border: '#4caf50', color: '#1b5e20', icon: '✓' },
  error:   { bg: '#ffebee', border: '#f44336', color: '#b71c1c', icon: '✗' },
  warning: { bg: '#fff3e0', border: '#ff9800', color: '#e65100', icon: '⚠' },
  info:    { bg: '#e3f2fd', border: '#2196f3', color: '#0d47a1', icon: 'ℹ' },
};

const defaultType = typeStyles.info;

const NotificationArea: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div style={containerStyle} aria-live="polite">
      {notifications.map((n) => {
        const t = typeStyles[n.type] ?? defaultType;
        return (
          <div
            key={n.id}
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              backgroundColor: t.bg,
              borderLeft: `4px solid ${t.border}`,
              color: t.color,
              padding: '12px 14px',
              borderRadius: 6,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              fontSize: 14,
              lineHeight: 1.5,
              pointerEvents: 'auto',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 16, flexShrink: 0 }} aria-hidden="true">
              {t.icon}
            </span>
            <span style={{ flex: 1 }}>{n.message}</span>
            <button
              type="button"
              onClick={() => removeNotification(n.id)}
              aria-label="Dismiss notification"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: t.color,
                fontSize: 18,
                lineHeight: 1,
                padding: 0,
                opacity: 0.6,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationArea;
