import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Filter, SlidersHorizontal, X, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchInput } from "@/components/search-input";
import { CountryCard } from "@/components/country-card";
import { CountryGridSkeleton } from "@/components/loading-skeleton";
import type { Country } from "@shared/schema";

const regions = [
  "All Regions",
  "Europe",
  "Asia",
  "North America",
  "South America",
  "Oceania",
  "Africa",
];

const visaFilters = [
  { value: "all", label: "All Visa Types" },
  { value: "visa-free", label: "Visa Free" },
  { value: "visa-on-arrival", label: "Visa on Arrival" },
  { value: "evisa", label: "e-Visa Available" },
  { value: "visa-required", label: "Visa Required" },
];

export default function SearchPage() {
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(searchString);
  
  const initialQuery = params.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [region, setRegion] = useState("All Regions");
  const [visaFilter, setVisaFilter] = useState("all");

  const { data: allCountries, isLoading, error, refetch } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
  });

  useEffect(() => {
    const urlQuery = params.get("q") || "";
    setQuery(urlQuery);
  }, [searchString]);

  const filteredCountries = allCountries?.filter((country) => {
    const matchesQuery = !query || 
      country.name.toLowerCase().includes(query.toLowerCase()) ||
      country.code.toLowerCase().includes(query.toLowerCase());
    
    const matchesRegion = region === "All Regions" || country.region === region;
    
    let matchesVisa = true;
    switch (visaFilter) {
      case "visa-free":
        matchesVisa = !country.visaRequired;
        break;
      case "visa-on-arrival":
        matchesVisa = country.visaOnArrival;
        break;
      case "evisa":
        matchesVisa = country.eVisaAvailable;
        break;
      case "visa-required":
        matchesVisa = country.visaRequired && !country.visaOnArrival && !country.eVisaAvailable;
        break;
    }

    return matchesQuery && matchesRegion && matchesVisa;
  }) || [];

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    if (newQuery) {
      setLocation(`/search?q=${encodeURIComponent(newQuery)}`);
    } else {
      setLocation("/search");
    }
  };

  const clearFilters = () => {
    setQuery("");
    setRegion("All Regions");
    setVisaFilter("all");
    setLocation("/search");
  };

  const hasActiveFilters = query || region !== "All Regions" || visaFilter !== "all";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-search-title">
          Search Destinations
        </h1>
        <p className="text-muted-foreground">
          Find visa requirements and travel information for any country
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="flex-1">
          <SearchInput
            initialValue={query}
            onSearch={handleSearch}
            placeholder="Search by country name or code..."
            autoFocus
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-[180px]" data-testid="select-region">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={visaFilter} onValueChange={setVisaFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-visa-filter">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Visa Type" />
            </SelectTrigger>
            <SelectContent>
              {visaFilters.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="gap-2"
              data-testid="button-clear-filters"
            >
              <X className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {query && (
            <Badge variant="secondary" className="gap-1">
              Search: "{query}"
              <button onClick={() => handleSearch("")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {region !== "All Regions" && (
            <Badge variant="secondary" className="gap-1">
              {region}
              <button onClick={() => setRegion("All Regions")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {visaFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {visaFilters.find(f => f.value === visaFilter)?.label}
              <button onClick={() => setVisaFilter("all")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <p className="text-muted-foreground" data-testid="text-results-count">
          {isLoading ? "Loading..." : `${filteredCountries.length} destination${filteredCountries.length !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {isLoading ? (
        <CountryGridSkeleton count={9} />
      ) : error ? (
        <Card className="p-8 text-center">
          <CardContent className="space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Failed to load destinations</p>
            <Button onClick={() => refetch()} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredCountries.length === 0 ? (
        <Card className="p-8 text-center">
          <CardContent className="space-y-4">
            <p className="text-xl font-medium">No destinations found</p>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                Clear All Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCountries.map((country) => (
            <CountryCard key={country.id} country={country} />
          ))}
        </div>
      )}
    </div>
  );
}
