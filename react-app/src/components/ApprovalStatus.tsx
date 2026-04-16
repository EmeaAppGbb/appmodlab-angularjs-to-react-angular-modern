import React from 'react';

interface ApprovalStatusProps {
  status: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<string, { color: string; background: string; icon: string }> = {
  pending:     { color: '#e65100', background: '#fff3e0', icon: '⏳' },
  approved:    { color: '#1b5e20', background: '#e8f5e9', icon: '✓' },
  rejected:    { color: '#b71c1c', background: '#ffebee', icon: '✗' },
  cancelled:   { color: '#616161', background: '#f5f5f5', icon: '⊘' },
  draft:       { color: '#0d47a1', background: '#e3f2fd', icon: '✎' },
  confirmed:   { color: '#1b5e20', background: '#e8f5e9', icon: '✓' },
  'in-review': { color: '#e65100', background: '#fff3e0', icon: '⏳' },
  'under_review': { color: '#e65100', background: '#fff3e0', icon: '⏳' },
  submitted:   { color: '#0d47a1', background: '#e3f2fd', icon: '↗' },
  reimbursed:  { color: '#1b5e20', background: '#e8f5e9', icon: '✓' },
  completed:   { color: '#1b5e20', background: '#e8f5e9', icon: '✓' },
};

const defaultConfig = { color: '#616161', background: '#f5f5f5', icon: '•' };

const sizeMap: Record<string, { fontSize: number; padding: string }> = {
  sm: { fontSize: 11, padding: '2px 8px' },
  md: { fontSize: 13, padding: '4px 12px' },
  lg: { fontSize: 15, padding: '6px 16px' },
};

const ApprovalStatus: React.FC<ApprovalStatusProps> = ({ status, showIcon = true, size = 'md' }) => {
  const key = status.toLowerCase().replace(/ /g, '-');
  const config = statusConfig[key] ?? defaultConfig;
  const sizeStyle = sizeMap[size];

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    fontWeight: 600,
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
    color: config.color,
    backgroundColor: config.background,
    fontSize: sizeStyle.fontSize,
    padding: sizeStyle.padding,
    lineHeight: 1.4,
  };

  const displayText = status.replace(/[_-]/g, ' ');

  return (
    <span style={badgeStyle} role="status">
      {showIcon && <span aria-hidden="true">{config.icon}</span>}
      {displayText}
    </span>
  );
};

export default ApprovalStatus;
