import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, X, ChevronDown, Search } from 'lucide-react';

export const COUNTRIES = [
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'ASEAN' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', region: 'ASEAN' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', region: 'ASEAN' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', region: 'ASEAN' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', region: 'ASEAN' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', region: 'ASEAN' },
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'Americas' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'APAC' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'APAC' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe' },
  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'APAC' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'Americas' }
];

export default function CountrySelector({ selectedCountries, onChange, isDark }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCountry = (code) => {
    if (selectedCountries.includes(code)) {
      if (selectedCountries.length === 1) return; // keep at least one
      onChange(selectedCountries.filter(c => c !== code));
    } else {
      onChange([...selectedCountries, code]);
    }
  };

  const removeCountry = (code, e) => {
    e.stopPropagation();
    if (selectedCountries.length === 1) return;
    onChange(selectedCountries.filter(c => c !== code));
  };

  const selectRegion = (regionName) => {
    const regionCodes = COUNTRIES.filter(c => c.region === regionName).map(c => c.code);
    const combined = Array.from(new Set([...selectedCountries, ...regionCodes]));
    onChange(combined);
  };

  const filteredCountries = COUNTRIES.filter(
    c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
        isDark ? 'text-slate-400' : 'text-slate-600'
      }`}>
        Target Countries ({selectedCountries.length} selected)
      </label>

      {/* Trigger Button & Selected Pills */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`min-h-[46px] p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all duration-150 ${
          isOpen
            ? 'ring-2 ring-[#0A66C2] border-[#0A66C2]'
            : isDark
            ? 'bg-slate-900/90 border-slate-700 hover:border-slate-600'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
        }`}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          {selectedCountries.map(code => {
            const country = COUNTRIES.find(c => c.code === code) || { code, name: code, flag: '🌐' };
            return (
              <span
                key={code}
                className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md transition-colors ${
                  isDark
                    ? 'bg-blue-950/80 text-blue-300 border border-blue-800/50'
                    : 'bg-[#E8F3FC] text-[#0A66C2] border border-blue-100'
                }`}
              >
                <span>{country.flag}</span>
                <span>{country.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({country.code})</span>
                {selectedCountries.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => removeCountry(code, e)}
                    className="hover:text-red-500 rounded-xs ml-0.5"
                    title="Remove country"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 shrink-0 pr-1">
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute left-0 right-0 top-full mt-2 z-50 rounded-xl shadow-2xl border p-3 backdrop-blur-md ${
          isDark
            ? 'bg-[#0E1320]/95 border-slate-700 text-slate-200'
            : 'bg-white/95 border-slate-200 text-slate-800'
        }`}>
          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 pb-2.5 mb-2.5 border-b border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Quick:
            </span>
            <button
              type="button"
              onClick={() => selectRegion('ASEAN')}
              className="text-xs px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 font-medium transition-colors"
            >
              + ASEAN
            </button>
            <button
              type="button"
              onClick={() => selectRegion('APAC')}
              className="text-xs px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 font-medium transition-colors"
            >
              + APAC
            </button>
            <button
              type="button"
              onClick={() => onChange(['SG'])}
              className="text-xs px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-600 dark:text-slate-400 hover:bg-slate-500/20 font-medium transition-colors"
            >
              SG Only
            </button>
            <button
              type="button"
              onClick={() => onChange(['SG', 'MY', 'US', 'GB', 'AU'])}
              className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-medium transition-colors ml-auto"
            >
              Top 5
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search country or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className={`w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border outline-hidden transition-colors ${
                isDark
                  ? 'bg-slate-900/90 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-blue-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500'
              }`}
            />
          </div>

          {/* Country List */}
          <div className="max-h-52 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredCountries.map(country => {
              const isSelected = selectedCountries.includes(country.code);
              return (
                <div
                  key={country.code}
                  onClick={() => toggleCountry(country.code)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    isSelected
                      ? isDark
                        ? 'bg-blue-600/20 text-blue-300'
                        : 'bg-blue-50 text-[#0A66C2]'
                      : isDark
                      ? 'hover:bg-slate-800 text-slate-300'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{country.flag}</span>
                    <span>{country.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({country.code})</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-slate-200/50 dark:bg-slate-800 text-slate-500">
                      {country.region}
                    </span>
                  </div>

                  <div className={`w-4 h-4 rounded-sm flex items-center justify-center border transition-colors ${
                    isSelected
                      ? 'bg-[#0A66C2] border-[#0A66C2] text-white'
                      : isDark
                      ? 'border-slate-700'
                      : 'border-slate-300'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
