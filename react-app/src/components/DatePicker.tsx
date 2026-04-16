import React, { useId } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  max?: string;
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

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '8px 10px',
  fontSize: 14,
  border: '1px solid #ccc',
  borderRadius: 4,
  boxSizing: 'border-box',
  outline: 'none',
};

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, min, max, label, required }) => {
  const id = useId();

  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label}
          {required && <span style={{ color: '#d32f2f', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        required={required}
        style={inputStyle}
      />
    </div>
  );
};

export default DatePicker;
