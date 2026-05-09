import React, { useRef } from 'react';

/**
 * 4-digit PIN input with auto-focus between digits.
 */
const PinInput = ({ value, onChange, error }) => {
  const inputsRef = useRef([]);

  const handleChange = (index, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const digits = (value || '').split('');
    digits[index] = digit;
    const newPin = digits.join('').slice(0, 4);
    onChange(newPin);

    // Auto-focus next
    if (digit && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !(value || '')[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div>
      <div className="flex gap-3 justify-center">
        {[0, 1, 2, 3].map(i => (
          <input
            key={i}
            ref={el => inputsRef.current[i] = el}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={(value || '')[i] || ''}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className={`w-14 h-14 text-center text-2xl font-bold text-white bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-kprimary/50 focus:border-kprimary/50 transition-colors ${
              error ? 'border-red-500/50' : 'border-white/10'
            }`}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-red-400 text-center">{error}</p>}
    </div>
  );
};

export default PinInput;
