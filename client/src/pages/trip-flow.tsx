import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { TripInputForm } from "../components/trip/trip-input-form";
import { ResultsStack } from "../components/trip/results-stack";
import type { TripResult, TripInput } from "@shared/schema";

type FlowState = "input" | "loading" | "results";

export default function TripFlowPage() {
  const [flowState, setFlowState] = useState<FlowState>("input");
  const [tripResult, setTripResult] = useState<TripResult | null>(null);
  const [tripInput, setTripInput] = useState<TripInput | null>(null);

  const handleSubmit = async (input: TripInput) => {
    setTripInput(input);
    setFlowState("loading");
    
    try {
      const response = await fetch("/api/trip/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      
      if (!response.ok) {
        throw new Error("Failed to resolve trip requirements");
      }
      
      const result = await response.json();
      setTripResult(result);
      setFlowState("results");
    } catch (error) {
      console.error("Error resolving trip:", error);
      setFlowState("input");
    }
  };

  const handleReset = () => {
    setFlowState("input");
    setTripResult(null);
    setTripInput(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <LayoutGroup>
            <AnimatePresence mode="wait">
              {flowState === "input" && (
                <motion.div
                  key="input"
                  layoutId="flow-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ 
                    duration: 0.4,
                    ease: [0.32, 0.72, 0, 1]
                  }}
                >
                  <TripInputForm onSubmit={handleSubmit} />
                </motion.div>
              )}

              {flowState === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center py-24"
                >
                  <motion.div
                    className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="mt-4 text-muted-foreground">
                    Checking requirements...
                  </p>
                </motion.div>
              )}

              {flowState === "results" && tripResult && tripInput && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <ResultsStack 
                    result={tripResult} 
                    input={tripInput}
                    onReset={handleReset} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </LayoutGroup>
        </div>
      </div>
    </div>
  );
}
