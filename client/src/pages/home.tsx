import { useQuery } from "@tanstack/react-query";
import { HeroSection } from "@/components/hero-section";
import { CountryCard } from "@/components/country-card";
import { CountryGridSkeleton } from "@/components/loading-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, AlertCircle, RefreshCw, Plane, FileCheck, ShieldCheck, Clock } from "lucide-react";
import type { Country } from "@shared/schema";

export default function HomePage() {
  const { data: countries, isLoading, error, refetch } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
  });

  const popularCountries = countries?.slice(0, 6) || [];

  const features = [
    {
      icon: FileCheck,
      title: "Visa Requirements",
      description: "Get detailed visa information for every destination including application process and required documents.",
    },
    {
      icon: ShieldCheck,
      title: "Health Regulations",
      description: "Stay informed about vaccination requirements, health certificates, and travel restrictions.",
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Our database is continuously updated with the latest travel requirements and policy changes.",
    },
    {
      icon: Plane,
      title: "Travel Planning",
      description: "Plan your trip with confidence knowing exactly what documents and preparations you need.",
    },
  ];

  return (
    <div className="min-h-screen">
      <HeroSection />

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold" data-testid="text-popular-title">
              Popular Destinations
            </h2>
            <p className="text-muted-foreground mt-1">
              Explore visa requirements for top travel destinations
            </p>
          </div>
          <Link href="/destinations">
            <Button variant="outline" className="gap-2" data-testid="button-view-all">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <CountryGridSkeleton count={6} />
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCountries.map((country) => (
              <CountryCard key={country.id} country={country} />
            ))}
          </div>
        )}
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold" data-testid="text-features-title">
              Everything You Need to Travel Smart
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Get comprehensive travel requirement information to plan your journey with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="text-center"
                data-testid={`card-feature-${index}`}
              >
                <CardContent className="pt-6 pb-6 space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4" data-testid="text-cta-title">
                Ready to Explore?
              </h2>
              <p className="text-muted-foreground mb-6">
                Search any destination to get detailed visa requirements, document checklists, 
                and travel tips. Plan your next adventure with confidence.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link href="/destinations">
                  <Button size="lg" data-testid="button-explore-destinations">
                    Explore Destinations
                  </Button>
                </Link>
                <Link href="/search">
                  <Button size="lg" variant="outline" data-testid="button-search-countries">
                    Search Countries
                  </Button>
                </Link>
              </div>
            </div>
            <div 
              className="h-64 md:h-auto bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80')`,
              }}
            />
          </div>
        </Card>
      </section>
    </div>
  );
}
