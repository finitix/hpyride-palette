import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLocationSearch } from '@/hooks/useLocationSearch';

interface LocationInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string, coords?: [number, number]) => void;
  iconColor?: string;
  onUseMyLocation?: () => void;
}

const LocationInput = ({ placeholder, value, onChange, iconColor = 'green', onUseMyLocation }: LocationInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions, loading, searchLocations, clearSuggestions } = useLocationSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onChange(query);
    searchLocations(query);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (suggestion: any) => {
    onChange(suggestion.place_name, suggestion.center);
    clearSuggestions();
    setShowSuggestions(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <div 
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${
            iconColor === 'green' ? 'bg-green-500' : 'bg-orange-500'
          }`} 
        />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className="pl-10 pr-10"
        />
        {onUseMyLocation && (
          <button 
            onClick={onUseMyLocation}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
          >
            <Navigation className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-muted flex items-start gap-3 border-b border-border last:border-b-0"
            >
              <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-foreground">{suggestion.place_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationInput;
