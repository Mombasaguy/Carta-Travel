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
    <main className="min-h-screen px-6 py-10 bg-background">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-page-title">
            Business Travel Entry Requirements
          </h1>
          <p className="mt-2 text-sm text-muted-foreground" data-testid="text-page-description">
            Determine entry requirements, generate invitation letters, and follow Carta travel policy.
          </p>
        </div>

        <motion.div 
          layout 
          className="rounded-2xl border bg-card/70 backdrop-blur p-6 shadow-sm"
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
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-sm text-muted-foreground" data-testid="text-trip-summary">
                    {trip?.citizenship} → {trip?.destination} · Business · {trip?.durationDays} days
                  </div>
                  <button
                    className="text-sm font-medium text-foreground hover:underline"
                    onClick={() => setResult(null)}
                    data-testid="button-edit"
                  >
                    Edit
                  </button>
                </div>

                <div className="mt-5">
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
