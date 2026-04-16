import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navbarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#1a237e',
  color: '#fff',
  padding: '0 24px',
  height: 56,
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const brandStyle: React.CSSProperties = {
  color: '#fff',
  textDecoration: 'none',
  fontSize: 18,
  fontWeight: 700,
  letterSpacing: 0.5,
};

const linkListStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  listStyle: 'none',
  margin: 0,
  padding: 0,
};

const baseLinkStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.8)',
  textDecoration: 'none',
  padding: '8px 14px',
  borderRadius: 4,
  fontSize: 14,
  fontWeight: 500,
  transition: 'background 0.15s, color 0.15s',
};

const activeLinkStyle: React.CSSProperties = {
  ...baseLinkStyle,
  color: '#fff',
  backgroundColor: 'rgba(255,255,255,0.15)',
};

const logoutBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.3)',
  color: '#fff',
  padding: '6px 16px',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
};

interface NavItem {
  to: string;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/flights', label: 'Flights' },
  { to: '/hotels', label: 'Hotels' },
  { to: '/itinerary', label: 'Itinerary' },
  { to: '/travel-requests', label: 'Travel Requests' },
  { to: '/expenses', label: 'Expenses' },
];

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={navbarStyle}>
      <NavLink to="/dashboard" style={brandStyle}>
        GlobalTravel Corp
      </NavLink>

      {isAuthenticated && (
        <ul style={linkListStyle}>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                style={({ isActive }) => (isActive ? activeLinkStyle : baseLinkStyle)}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}

      {isAuthenticated && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user && (
            <span style={{ fontSize: 13, opacity: 0.85 }}>
              {user.firstName} {user.lastName}
            </span>
          )}
          <button type="button" style={logoutBtnStyle} onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
