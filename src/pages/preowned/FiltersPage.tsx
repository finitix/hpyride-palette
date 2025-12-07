import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LocationInput from "@/components/LocationInput";

const bodyTypes = ["hatchback", "sedan", "suv", "luxury", "mpv", "crossover"];
const fuelTypes = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];
const transmissions = ["Manual", "Automatic"];
const ownerships = ["1st Owner", "2nd Owner", "3rd Owner", "4th+ Owner"];

const FiltersPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    priceRange: [0, 5000000],
    yearRange: [2000, 2024],
    kmRange: [0, 200000],
    fuelType: "",
    bodyType: "",
    transmission: "",
    ownership: "",
    location: "",
  });

  const handleApply = () => {
    const params = new URLSearchParams();
    if (filters.fuelType) params.set('fuelType', filters.fuelType);
    if (filters.bodyType) params.set('bodyType', filters.bodyType);
    if (filters.transmission) params.set('transmission', filters.transmission);
    if (filters.ownership) params.set('ownership', filters.ownership);
    if (filters.location) params.set('location', filters.location);
    params.set('minPrice', filters.priceRange[0].toString());
    params.set('maxPrice', filters.priceRange[1].toString());
    params.set('minYear', filters.yearRange[0].toString());
    params.set('maxYear', filters.yearRange[1].toString());
    params.set('minKm', filters.kmRange[0].toString());
    params.set('maxKm', filters.kmRange[1].toString());
    
    navigate(`/pre-owned?${params.toString()}`);
  };

  const handleReset = () => {
    setFilters({
      priceRange: [0, 5000000],
      yearRange: [2000, 2024],
      kmRange: [0, 200000],
      fuelType: "",
      bodyType: "",
      transmission: "",
      ownership: "",
      location: "",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Filters</h1>
        </div>
        <button onClick={handleReset} className="flex items-center gap-1 text-sm text-muted-foreground">
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </header>

      <div className="px-4 py-4 space-y-6">
        {/* Price Range */}
        <div>
          <Label className="mb-3 block">Price Range</Label>
          <Slider
            value={filters.priceRange}
            onValueChange={(v) => setFilters(prev => ({ ...prev, priceRange: v }))}
            min={0}
            max={5000000}
            step={50000}
          />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>₹{(filters.priceRange[0] / 100000).toFixed(1)}L</span>
            <span>₹{(filters.priceRange[1] / 100000).toFixed(1)}L</span>
          </div>
        </div>

        {/* Year Range */}
        <div>
          <Label className="mb-3 block">Year Range</Label>
          <Slider
            value={filters.yearRange}
            onValueChange={(v) => setFilters(prev => ({ ...prev, yearRange: v }))}
            min={2000}
            max={2024}
            step={1}
          />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>{filters.yearRange[0]}</span>
            <span>{filters.yearRange[1]}</span>
          </div>
        </div>

        {/* KM Driven */}
        <div>
          <Label className="mb-3 block">KM Driven</Label>
          <Slider
            value={filters.kmRange}
            onValueChange={(v) => setFilters(prev => ({ ...prev, kmRange: v }))}
            min={0}
            max={200000}
            step={5000}
          />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>{(filters.kmRange[0] / 1000).toFixed(0)}K km</span>
            <span>{(filters.kmRange[1] / 1000).toFixed(0)}K km</span>
          </div>
        </div>

        {/* Fuel Type */}
        <div>
          <Label>Fuel Type</Label>
          <Select value={filters.fuelType} onValueChange={(v) => setFilters(prev => ({ ...prev, fuelType: v }))}>
            <SelectTrigger><SelectValue placeholder="All fuel types" /></SelectTrigger>
            <SelectContent>
              {fuelTypes.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Body Type */}
        <div>
          <Label>Body Type</Label>
          <Select value={filters.bodyType} onValueChange={(v) => setFilters(prev => ({ ...prev, bodyType: v }))}>
            <SelectTrigger><SelectValue placeholder="All body types" /></SelectTrigger>
            <SelectContent>
              {bodyTypes.map(b => <SelectItem key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Transmission */}
        <div>
          <Label>Transmission</Label>
          <Select value={filters.transmission} onValueChange={(v) => setFilters(prev => ({ ...prev, transmission: v }))}>
            <SelectTrigger><SelectValue placeholder="All transmissions" /></SelectTrigger>
            <SelectContent>
              {transmissions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Ownership */}
        <div>
          <Label>Ownership</Label>
          <Select value={filters.ownership} onValueChange={(v) => setFilters(prev => ({ ...prev, ownership: v }))}>
            <SelectTrigger><SelectValue placeholder="All ownerships" /></SelectTrigger>
            <SelectContent>
              {ownerships.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div>
          <Label>Location</Label>
          <LocationInput
            placeholder="Search location..."
            value={filters.location}
            onChange={(v) => setFilters(prev => ({ ...prev, location: v }))}
          />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3">
        <Button variant="hero" className="w-full" onClick={handleApply}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default FiltersPage;
