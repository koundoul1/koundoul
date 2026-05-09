import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+221', country: 'SN', flag: '\uD83C\uDDF8\uD83C\uDDF3', name: 'Senegal' },
  { code: '+33', country: 'FR', flag: '\uD83C\uDDEB\uD83C\uDDF7', name: 'France' },
  { code: '+225', country: 'CI', flag: '\uD83C\uDDE8\uD83C\uDDEE', name: 'Cote d\'Ivoire' },
  { code: '+237', country: 'CM', flag: '\uD83C\uDDE8\uD83C\uDDF2', name: 'Cameroun' },
  { code: '+223', country: 'ML', flag: '\uD83C\uDDF2\uD83C\uDDF1', name: 'Mali' },
  { code: '+226', country: 'BF', flag: '\uD83C\uDDE7\uD83C\uDDEB', name: 'Burkina Faso' },
  { code: '+224', country: 'GN', flag: '\uD83C\uDDEC\uD83C\uDDF3', name: 'Guinee' },
  { code: '+228', country: 'TG', flag: '\uD83C\uDDF9\uD83C\uDDEC', name: 'Togo' },
  { code: '+229', country: 'BJ', flag: '\uD83C\uDDE7\uD83C\uDDEF', name: 'Benin' },
  { code: '+212', country: 'MA', flag: '\uD83C\uDDF2\uD83C\uDDE6', name: 'Maroc' },
];

const PhoneInput = ({ value, onChange, error, className }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  // Parse current value to extract country code and number
  const currentCode = COUNTRY_CODES.find(c => value?.startsWith(c.code)) || COUNTRY_CODES[0];
  const numberPart = value ? value.slice(currentCode.code.length) : '';

  const handleCodeChange = (code) => {
    onChange(code.code + numberPart);
    setShowDropdown(false);
  };

  const handleNumberChange = (e) => {
    const num = e.target.value.replace(/\D/g, '');
    onChange(currentCode.code + num);
  };

  return (
    <div className={className}>
      <div className={`flex border rounded-xl overflow-hidden ${error ? 'border-red-500/50' : 'border-white/10'}`}>
        {/* Country code selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1 px-3 py-3 bg-white/5 hover:bg-white/10 text-white text-sm border-r border-white/10 min-w-[90px]"
          >
            <span>{currentCode.flag}</span>
            <span className="font-mono text-xs">{currentCode.code}</span>
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </button>

          {showDropdown && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
              {COUNTRY_CODES.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleCodeChange(c)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10 text-left ${
                    c.code === currentCode.code ? 'bg-kprimary/10 text-kprimary' : 'text-gray-300'
                  }`}
                >
                  <span>{c.flag}</span>
                  <span className="flex-1">{c.name}</span>
                  <span className="font-mono text-xs text-gray-500">{c.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Number input */}
        <input
          type="tel"
          inputMode="numeric"
          value={numberPart}
          onChange={handleNumberChange}
          placeholder="77 123 45 67"
          className="flex-1 px-3 py-3 bg-white/5 text-white text-sm placeholder-white/25 focus:outline-none"
        />
      </div>
    </div>
  );
};

export default PhoneInput;
