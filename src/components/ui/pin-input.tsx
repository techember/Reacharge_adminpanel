import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PinInputProps {
  length: number;
  onChange: (pin: string) => void;
  onComplete?: (pin: string) => void;
  className?: string;
  disabled?: boolean;
  type?: 'number' | 'text';
}

export const PinInput: React.FC<PinInputProps> = ({
  length,
  onChange,
  onComplete,
  className,
  disabled = false,
  type = 'number'
}) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    const pin = values.join('');
    onChange(pin);
    
    if (pin.length === length && onComplete) {
      onComplete(pin);
    }
  }, [values, length, onChange, onComplete]);

  const handleChange = (index: number, value: string) => {
    if (type === 'number' && !/^\d*$/.test(value)) return;
    
    const newValues = [...values];
    newValues[index] = value.slice(-1); // Only take the last character
    setValues(newValues);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    const newValues = Array(length).fill('');
    
    for (let i = 0; i < pastedData.length && i < length; i++) {
      if (type === 'number' && !/^\d$/.test(pastedData[i])) continue;
      newValues[i] = pastedData[i];
    }
    
    setValues(newValues);
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            if (el) inputRefs.current[index] = el;
          }}
          type="text"
          inputMode={type === 'number' ? 'numeric' : 'text'}
          value={values[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="pin-input"
          maxLength={1}
        />
      ))}
    </div>
  );
};