import { useState } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Plane, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const stats = [
    { icon: MapPin, value: "200+", label: "Countries" },
    { icon: Shield, value: "Real-time", label: "Updates" },
    { icon: Plane, value: "Trusted", label: "By Travelers" },
  ];

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
          data-testid="text-hero-title"
        >
          Know Before You Go
        </h1>
        <p 
          className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto"
          data-testid="text-hero-subtitle"
        >
          Check visa requirements, travel documents, and entry regulations for any destination worldwide.
        </p>

        <form 
          onSubmit={handleSearch} 
          className="max-w-xl mx-auto mb-10"
          data-testid="form-hero-search"
        >
          <div className="flex gap-2 bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
              <Input
                type="search"
                placeholder="Search for a country or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-0 text-white placeholder:text-white/60 focus-visible:ring-white/30"
                data-testid="input-hero-search"
              />
            </div>
            <Button 
              type="submit" 
              className="px-6"
              data-testid="button-hero-search"
            >
              Search
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 text-white"
              data-testid={`stat-${stat.label.toLowerCase()}`}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur">
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">{stat.value}</div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
