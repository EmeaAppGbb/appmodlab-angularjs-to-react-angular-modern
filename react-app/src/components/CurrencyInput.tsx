import React, { useState, useCallback, useId } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  symbol?: string;
  max?: number;
  label?: string;
  required?: boolean;
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 4,
  fontSize: 14,
  fontWeight: 500,
  color: '#333',
};

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  border: '1px solid #ccc',
  borderRadius: 4,
  overflow: 'hidden',
};

const symbolStyle: React.CSSProperties = {
  padding: '8px 10px',
  backgroundColor: '#f5f5f5',
  borderRight: '1px solid #ccc',
  fontSize: 14,
  color: '#555',
  userSelect: 'none',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px 10px',
  fontSize: 14,
  border: 'none',
  outline: 'none',
  boxSizing: 'border-box',
  minWidth: 0,
};

function formatCurrency(val: number): string {
  return val.toFixed(2);
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  symbol = '$',
  max,
  label,
  required,
}) => {
  const id = useId();
  const [display, setDisplay] = useState(formatCurrency(value));
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setFocused(true);
    // Show raw number for easier editing
    setDisplay(value === 0 ? '' : String(value));
  }, [value]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    const parsed = parseFloat(display);
    if (isNaN(parsed)) {
      setDisplay(formatCurrency(value));
      return;
    }
    const clamped = max !== undefined ? Math.min(parsed, max) : parsed;
    const final = Math.max(0, clamped);
    onChange(final);
    setDisplay(formatCurrency(final));
  }, [display, value, max, onChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Allow digits, a single decimal point, and empty string
      if (raw === '' || /^\d*\.?\d{0,2}$/.test(raw)) {
        setDisplay(raw);
      }
    },
    [],
  );

  // Keep display in sync when value prop changes externally while not focused
  React.useEffect(() => {
    if (!focused) {
      setDisplay(formatCurrency(value));
    }
  }, [value, focused]);

  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label}
          {required && <span style={{ color: '#d32f2f', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={wrapperStyle}>
        <span style={symbolStyle}>{symbol}</span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={display}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          style={inputStyle}
          aria-label={label ?? 'Currency amount'}
        />
      </div>
    </div>
  );
};

export default CurrencyInput;
