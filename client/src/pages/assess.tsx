import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EntryForm, type EntryFormData } from "../components/trip/entry-form";
import { ResultCards } from "../components/trip/result-cards";
import { ArrowLeft, Globe, Briefcase, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface V2VisaData {
  destination: {
    name: string;
    continent: string;
    capital: string;
    currency: string;
    passportValidity: string;
    timezone: string;
    embassyUrl?: string;
  };
  mandatoryRegistration: {
    name: string;
    color: string;
    link?: string;
  } | null;
  visaRules: {
    primaryRule: {
      name: string;
      duration?: string;
      color: string;
      link?: string;
    };
    secondaryRule: {
      name: string;
      duration?: string;
      color: string;
      link?: string;
    } | null;
    exceptionRule: {
      name: string;
      exceptionTypeName?: string;
      fullText?: string;
      countryCodes?: string[];
      link?: string;
    } | null;
  };
}

interface AssessResult {
  entryType: "VISA" | "ETA" | "EVISA" | "NONE" | "UNKNOWN";
  required: boolean;
  headline: string;
  details: string | null;
  maxStayDays: number;
  fee: { amount: number; currency: string; reimbursable: boolean } | null;
  isUSEmployerSponsored: boolean;
  governance: { status: string; owner: string; reviewDueAt: string } | null;
  sources: { sourceId: string; title: string; verifiedAt: string }[] | null;
  actions: { label: string; url: string }[] | null;
  letterAvailable: boolean;
  letterTemplate: string | null;
  v2Data?: V2VisaData;
}

interface TripPayload extends EntryFormData {
  purpose: "BUSINESS";
}

const countryNames: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  BR: "Brazil",
  DE: "Germany",
  JP: "Japan",
  AU: "Australia",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  SG: "Singapore",
  IN: "India",
  CN: "China",
  KR: "South Korea",
  MX: "Mexico",
  CH: "Switzerland",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  IE: "Ireland",
  NZ: "New Zealand",
  PL: "Poland",
  PT: "Portugal",
  AT: "Austria",
  BE: "Belgium",
};

export default function AssessPage() {
  const [result, setResult] = useState<AssessResult | null>(null);
  const [trip, setTrip] = useState<TripPayload | null>(null);

  const springTransition = { type: "spring", stiffness: 280, damping: 30 };

  const getCountryName = (code: string) => countryNames[code] || code;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="hero-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={springTransition}
            >
              <div className="text-center mb-12">
                <motion.h1 
                  className="text-3xl font-semibold tracking-tightish text-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springTransition, delay: 0.1 }}
                  data-testid="text-page-title"
                >
                  Check entry requirements for business travel
                </motion.h1>
                <motion.p 
                  className="mt-4 text-base text-muted-foreground leading-relaxed max-w-md mx-auto"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springTransition, delay: 0.2 }}
                  data-testid="text-page-description"
                >
                  Enter your trip details to get visa requirements, policy guidance, and invitation letters.
                </motion.p>
              </div>

              <motion.div 
                className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-8 shadow-soft"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...springTransition, delay: 0.3 }}
              >
                <EntryForm
                  onSubmit={async (payload) => {
                    setTrip(payload);
                    const res = await fetch("/api/assess", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload)
                    });
                    const json = await res.json();
                    setResult(json);
                  }}
                />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={springTransition}
            >
              <motion.div 
                className="rounded-2xl bg-surface border border-border/40 p-6 mb-8 shadow-soft"
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...springTransition, delay: 0.1 }}
                data-testid="card-trip-summary"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setResult(null)}
                      data-testid="button-back"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground flex items-center gap-2" data-testid="text-trip-route">
                        <Globe className="w-5 h-5 text-muted-foreground" />
                        {getCountryName(trip?.citizenship || "")} 
                        <span className="text-muted-foreground mx-1">to</span>
                        {getCountryName(trip?.destination || "")}
                      </h2>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <Badge variant="secondary" className="gap-1.5">
                          <Briefcase className="w-3 h-3" />
                          Business
                        </Badge>
                        <Badge variant="outline" className="gap-1.5">
                          <CalendarDays className="w-3 h-3" />
                          {trip?.durationDays} days
                        </Badge>
                        {trip?.travelDate && (
                          <span className="text-sm text-muted-foreground">
                            {formatDate(trip.travelDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setResult(null)}
                    data-testid="button-edit"
                  >
                    Edit trip
                  </Button>
                </div>
              </motion.div>

              <ResultCards result={result} trip={trip || undefined} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
