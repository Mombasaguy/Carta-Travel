import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { ArrowLeft, Check, AlertTriangle, FileText, Calendar, Clock, Info, Phone, Building, RefreshCw, AlertCircle, ClipboardCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RequirementCard } from "@/components/requirement-card";
import { CountryDetailSkeleton } from "@/components/loading-skeleton";
import type { CountryDetails, RequirementType } from "@shared/schema";

export default function CountryDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: country, isLoading, error, refetch } = useQuery<CountryDetails>({
    queryKey: ["/api/countries", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CountryDetailSkeleton />
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 text-center">
          <CardContent className="space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-xl font-medium">Country not found</p>
            <p className="text-muted-foreground">
              We couldn't find the country you're looking for.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => refetch()} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" /> Try Again
              </Button>
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getVisaStatus = () => {
    if (!country.visaRequired) {
      return { label: "Visa Free Entry", color: "text-green-600 dark:text-green-400", icon: Check };
    }
    if (country.visaOnArrival) {
      return { label: "Visa on Arrival Available", color: "text-blue-600 dark:text-blue-400", icon: FileText };
    }
    if (country.eVisaAvailable) {
      return { label: "e-Visa Available", color: "text-blue-600 dark:text-blue-400", icon: FileText };
    }
    return { label: "Visa Required", color: "text-amber-600 dark:text-amber-400", icon: AlertTriangle };
  };

  const visaStatus = getVisaStatus();
  const VisaIcon = visaStatus.icon;

  const requirementTypes: RequirementType[] = ["entry", "document", "health", "customs", "stay"];
  
  const groupedRequirements = requirementTypes.reduce((acc, type) => {
    acc[type] = country.requirements.filter(r => r.type === type);
    return acc;
  }, {} as Record<RequirementType, typeof country.requirements>);

  const quickStats = [
    {
      label: "Visa Status",
      value: country.visaRequired ? "Required" : "Not Required",
      icon: FileText,
    },
    {
      label: "Max Stay",
      value: country.maxStayDays ? `${country.maxStayDays} days` : "Varies",
      icon: Calendar,
    },
    {
      label: "Processing Time",
      value: country.processingTime || "Varies",
      icon: Clock,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/">
        <Button variant="ghost" className="gap-2 mb-6" data-testid="button-back">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </Link>

      <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
        <div 
          className="text-6xl flex-shrink-0"
          data-testid="text-country-flag"
        >
          {country.flagEmoji}
        </div>
        <div className="flex-1">
          <h1 
            className="text-3xl sm:text-4xl font-bold mb-2"
            data-testid="text-country-name"
          >
            {country.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{country.region}</Badge>
            <Badge variant="outline">{country.code}</Badge>
            <div className={`flex items-center gap-1 font-medium ${visaStatus.color}`}>
              <VisaIcon className="h-4 w-4" />
              {visaStatus.label}
            </div>
          </div>
          <div className="mt-4">
            <Button className="gap-2" asChild data-testid="button-check-requirements">
              <Link href={`/assess?destination=${country.code}`}>
                <ClipboardCheck className="h-4 w-4" />
                Check Visa Requirements
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {quickStats.map((stat, index) => (
          <Card key={index} data-testid={`card-stat-${stat.label.toLowerCase().replace(" ", "-")}`}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="font-semibold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6 mb-8">
        {requirementTypes.map((type) => (
          <RequirementCard
            key={type}
            type={type}
            requirements={groupedRequirements[type]}
          />
        ))}
      </div>

      {country.tips && country.tips.length > 0 && (
        <Card className="mb-8" data-testid="card-travel-tips">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Travel Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {country.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {country.emergencyContacts && (
        <Card data-testid="card-emergency-contacts">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-red-500" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {country.emergencyContacts.police && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Police</p>
                    <p className="font-mono font-semibold">{country.emergencyContacts.police}</p>
                  </div>
                </div>
              )}
              {country.emergencyContacts.ambulance && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ambulance</p>
                    <p className="font-mono font-semibold">{country.emergencyContacts.ambulance}</p>
                  </div>
                </div>
              )}
              {country.emergencyContacts.embassy && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">US Embassy</p>
                    <p className="font-mono font-semibold">{country.emergencyContacts.embassy}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator className="my-8" />

      <p className="text-sm text-muted-foreground text-center">
        Last updated: {country.lastUpdated}. Information is subject to change. 
        Please verify with official government sources before traveling.
      </p>
    </div>
  );
}
