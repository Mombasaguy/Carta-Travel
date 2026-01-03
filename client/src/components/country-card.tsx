import { Link } from "wouter";
import { Check, AlertTriangle, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Country } from "@shared/schema";

interface CountryCardProps {
  country: Country;
}

export function CountryCard({ country }: CountryCardProps) {
  const getVisaStatus = () => {
    if (!country.visaRequired) {
      return { label: "Visa Free", variant: "default" as const, icon: Check };
    }
    if (country.visaOnArrival) {
      return { label: "Visa on Arrival", variant: "secondary" as const, icon: FileText };
    }
    if (country.eVisaAvailable) {
      return { label: "e-Visa", variant: "secondary" as const, icon: FileText };
    }
    return { label: "Visa Required", variant: "outline" as const, icon: AlertTriangle };
  };

  const visaStatus = getVisaStatus();

  const countryImages: Record<string, string> = {
    JP: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=240&fit=crop",
    FR: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=240&fit=crop",
    TH: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&h=240&fit=crop",
    IT: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400&h=240&fit=crop",
    ES: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=240&fit=crop",
    AU: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=400&h=240&fit=crop",
    BR: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&h=240&fit=crop",
    MX: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=400&h=240&fit=crop",
    DE: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&h=240&fit=crop",
    GB: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=240&fit=crop",
    CA: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=400&h=240&fit=crop",
    IN: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=240&fit=crop",
  };

  const imageUrl = countryImages[country.code] || 
    `https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&h=240&fit=crop`;

  return (
    <Link href={`/country/${country.id}`} data-testid={`link-country-${country.id}`}>
      <Card 
        className="group overflow-visible hover-elevate active-elevate-2 cursor-pointer transition-all"
        data-testid={`card-country-${country.id}`}
      >
        <div className="relative aspect-video overflow-hidden rounded-t-md">
          <img
            src={imageUrl}
            alt={country.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{country.flagEmoji}</span>
              <h3 className="font-semibold text-white text-lg">{country.name}</h3>
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Badge variant={visaStatus.variant} className="gap-1">
              <visaStatus.icon className="h-3 w-3" />
              {visaStatus.label}
            </Badge>
            {country.maxStayDays && (
              <span className="text-sm text-muted-foreground">
                Up to {country.maxStayDays} days
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{country.region}</span>
            <span className="flex items-center gap-1 text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              View Details <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
