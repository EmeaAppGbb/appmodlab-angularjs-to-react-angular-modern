import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: '#1a237e',
  accent: '#2196f3',
};

interface ModuleCard {
  emoji: string;
  title: string;
  description: string;
  path: string;
  gradient: string;
}

const modules: ModuleCard[] = [
  {
    emoji: '✈️',
    title: 'Flights',
    description: 'Search and book flights worldwide with real-time pricing and availability.',
    path: '/flights',
    gradient: 'linear-gradient(135deg, #1565c0, #42a5f5)',
  },
  {
    emoji: '🏨',
    title: 'Hotels',
    description: 'Find and reserve hotels with detailed room options and amenities.',
    path: '/hotels',
    gradient: 'linear-gradient(135deg, #00695c, #26a69a)',
  },
  {
    emoji: '📋',
    title: 'Itinerary',
    description: 'View and manage your trip itineraries with day-by-day planning.',
    path: '/itinerary',
    gradient: 'linear-gradient(135deg, #4527a0, #7e57c2)',
  },
  {
    emoji: '📝',
    title: 'Travel Requests',
    description: 'Submit and track travel approval requests with cost estimates.',
    path: '/travel-requests',
    gradient: 'linear-gradient(135deg, #e65100, #ff9800)',
  },
  {
    emoji: '💰',
    title: 'Expenses',
    description: 'Create expense reports, upload receipts, and track reimbursements.',
    path: '/expenses',
    gradient: 'linear-gradient(135deg, #1b5e20, #4caf50)',
  },
];

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1100, margin: '0 auto', fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 28, color: COLORS.primary }}>
          Welcome to GlobalTravel Corp Portal
        </h1>
        {user && (
          <p style={{ margin: 0, color: '#555', fontSize: 15 }}>
            Hello, {user.firstName} {user.lastName} — {user.department}
          </p>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300, 1fr))',
          gap: 24,
        }}
      >
        {modules.map((mod) => (
          <Link
            key={mod.path}
            to={mod.path}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'flex',
              flexDirection: 'column',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.18)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.1)';
            }}
          >
            <div
              style={{
                background: mod.gradient,
                padding: '28px 24px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <span style={{ fontSize: 36 }}>{mod.emoji}</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{mod.title}</span>
            </div>
            <div style={{ padding: '16px 24px 20px', background: '#fff' }}>
              <p style={{ margin: 0, color: '#555', fontSize: 14, lineHeight: 1.5 }}>
                {mod.description}
              </p>
              <span
                style={{
                  display: 'inline-block',
                  marginTop: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  color: COLORS.accent,
                }}
              >
                Open →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
