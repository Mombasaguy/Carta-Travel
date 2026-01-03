import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EntryForm, type EntryFormData } from "../components/trip/entry-form";
import { ResultCards } from "../components/trip/result-cards";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}

interface TripPayload extends EntryFormData {
  purpose: "BUSINESS";
}

export default function AssessPage() {
  const [result, setResult] = useState<AssessResult | null>(null);
  const [trip, setTrip] = useState<TripPayload | null>(null);

  const springTransition = { type: "spring", stiffness: 280, damping: 30 };

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
                className="rounded-xl bg-surface border border-border/40 px-5 py-4 mb-8 shadow-soft"
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...springTransition, delay: 0.1 }}
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setResult(null)}
                      data-testid="button-back"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                      <p className="text-sm font-medium text-foreground" data-testid="text-trip-route">
                        {trip?.citizenship} → {trip?.destination}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid="text-trip-details">
                        Business · {trip?.durationDays} days · {trip?.travelDate}
                      </p>
                    </div>
                  </div>
                  <button
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setResult(null)}
                    data-testid="button-edit"
                  >
                    Edit trip
                  </button>
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
