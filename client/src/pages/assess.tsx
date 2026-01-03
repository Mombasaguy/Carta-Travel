import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EntryForm, type EntryFormData } from "../components/trip/entry-form";
import { ResultCards } from "../components/trip/result-cards";

interface AssessResult {
  entryType: "VISA" | "ETA" | "EVISA" | "NONE" | "UNKNOWN";
  required: boolean;
  headline: string;
  details: string | null;
  maxStayDays: number;
  fee: { amount: number; currency: string; reimbursable: boolean } | null;
  isUSEmployerSponsored: boolean;
  governance: { status: string; owner: string } | null;
}

interface TripPayload extends EntryFormData {
  purpose: "BUSINESS";
}

export default function AssessPage() {
  const [result, setResult] = useState<AssessResult | null>(null);
  const [trip, setTrip] = useState<TripPayload | null>(null);

  return (
    <main className="min-h-screen px-6 py-16 bg-background">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tightish text-foreground" data-testid="text-page-title">
            Business Travel Entry Requirements
          </h1>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed" data-testid="text-page-description">
            Determine entry requirements, generate invitation letters, and follow Carta travel policy.
          </p>
        </div>

        <motion.div 
          layout 
          className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 shadow-soft"
        >
          <AnimatePresence mode="popLayout">
            {!result ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
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
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
              >
                <div className="flex items-center justify-between gap-4 flex-wrap pb-6 border-b border-border/50">
                  <div className="text-sm text-muted-foreground" data-testid="text-trip-summary">
                    {trip?.citizenship} → {trip?.destination} · Business · {trip?.durationDays} days
                  </div>
                  <button
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setResult(null)}
                    data-testid="button-edit"
                  >
                    Edit
                  </button>
                </div>

                <div className="mt-6">
                  <ResultCards result={result} trip={trip || undefined} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}
