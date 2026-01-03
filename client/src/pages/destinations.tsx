import { useQuery } from "@tanstack/react-query";
import { AlertCircle, RefreshCw, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CountryCard } from "@/components/country-card";
import { CountryGridSkeleton } from "@/components/loading-skeleton";
import { SearchInput } from "@/components/search-input";
import { useState } from "react";
import type { Country } from "@shared/schema";

const regionEmojis: Record<string, string> = {
  Europe: "EU",
  Asia: "AS",
  "North America": "NA",
  "South America": "SA",
  Oceania: "OC",
  Africa: "AF",
};

export default function DestinationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const { data: countries, isLoading, error, refetch } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
  });

  const regions = countries
    ? [...new Set(countries.map((c) => c.region))].sort()
    : [];

  const filteredCountries = countries?.filter((country) => {
    const matchesSearch = !searchQuery ||
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRegion = !selectedRegion || country.region === selectedRegion;

    return matchesSearch && matchesRegion;
  }) || [];

  const groupedByRegion = filteredCountries.reduce((acc, country) => {
    if (!acc[country.region]) {
      acc[country.region] = [];
    }
    acc[country.region].push(country);
    return acc;
  }, {} as Record<string, Country[]>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-destinations-title">
          All Destinations
        </h1>
        <p className="text-muted-foreground">
          Browse travel requirements by region or search for a specific country
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <SearchInput
          initialValue={searchQuery}
          onSearch={setSearchQuery}
          placeholder="Search countries..."
          className="flex-1 max-w-md"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedRegion === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedRegion(null)}
            data-testid="button-filter-all"
          >
            All
          </Button>
          {regions.map((region) => (
            <Button
              key={region}
              variant={selectedRegion === region ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRegion(region)}
              data-testid={`button-filter-${region.toLowerCase().replace(" ", "-")}`}
            >
              {region}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <CountryGridSkeleton count={12} />
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
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-xl font-medium">No destinations found</p>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </CardContent>
        </Card>
      ) : selectedRegion ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCountries.map((country) => (
            <CountryCard key={country.id} country={country} />
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedByRegion)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([region, countries]) => (
              <section key={region}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">
                    {regionEmojis[region] || region.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{region}</h2>
                    <p className="text-sm text-muted-foreground">
                      {countries.length} destination{countries.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {countries.map((country) => (
                    <CountryCard key={country.id} country={country} />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}
