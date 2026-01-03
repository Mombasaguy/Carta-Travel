import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Info, 
  Shield, 
  FileCheck, 
  Clock,
  Building2,
  Plane
} from "lucide-react";
import { useState } from "react";

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

interface ResultCardsProps {
  result: AssessResult;
  trip?: {
    citizenship: string;
    destination: string;
    durationDays: number;
    travelDate: string;
  };
}

const entryTypeBadgeVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  NONE: "secondary",
  ETA: "secondary",
  EVISA: "outline",
  VISA: "outline",
  UNKNOWN: "outline",
};

const entryTypeLabels: Record<string, string> = {
  NONE: "Visa Free Entry",
  ETA: "Electronic Travel Authorization Required",
  EVISA: "e-Visa Required",
  VISA: "Visa Required",
  UNKNOWN: "Requirements Unknown",
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const springTransition = { type: "spring", stiffness: 280, damping: 30 };

export function ResultCards({ result, trip }: ResultCardsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadLetter = async () => {
    if (!trip) return;
    
    setIsDownloading(true);
    try {
      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      
      const response = await fetch("/api/letters/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: trip.destination,
          merge: {
            FULL_NAME: "Employee Name",
            EMPLOYEE_EMAIL: "employee@carta.com",
            EMPLOYEE_TITLE: "Team Member",
            CITIZENSHIP: trip.citizenship,
            DEPARTURE_DATE: new Date(trip.travelDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long", 
              day: "numeric"
            }),
            RETURN_DATE: new Date(
              new Date(trip.travelDate).getTime() + trip.durationDays * 24 * 60 * 60 * 1000
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric"
            }),
            CURRENT_DATE: currentDate
          }
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Carta_Invitation_Letter_${trip.destination}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const fallbackResponse = await fetch("/api/letters/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeName: "Employee Name",
            employeeEmail: "employee@carta.com",
            employeeTitle: "Team Member",
            destinationCountry: trip.destination,
            citizenship: trip.citizenship,
            departureDate: trip.travelDate,
            returnDate: new Date(
              new Date(trip.travelDate).getTime() + trip.durationDays * 24 * 60 * 60 * 1000
            ).toISOString().split("T")[0],
            purpose: "BUSINESS",
            template: trip.destination
          })
        });
        
        const data = await fallbackResponse.json();
        const textBlob = new Blob([data.content], { type: "text/plain" });
        const url = URL.createObjectURL(textBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invitation_letter_${trip.destination}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to download letter:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: { staggerChildren: 0.08 }
        }
      }}
    >
      <motion.div variants={cardVariants} transition={springTransition}>
        <Card className="overflow-visible bg-surface border-border/40 rounded-2xl shadow-soft" data-testid="card-entry-result">
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl ${result.required ? 'bg-warning/10' : 'bg-success/10'}`}>
                {result.required ? (
                  <AlertCircle className="w-5 h-5 text-warning" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-success" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-foreground" data-testid="text-entry-type">
                  Entry Authorization
                </CardTitle>
                <CardDescription className="mt-1">
                  {entryTypeLabels[result.entryType] || result.entryType}
                </CardDescription>
              </div>
            </div>
            <Badge variant={entryTypeBadgeVariants[result.entryType] || "secondary"} className="mt-1">
              {result.entryType}
            </Badge>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-foreground leading-relaxed" data-testid="text-headline">{result.headline}</p>
            {result.details && (
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed" data-testid="text-details">
                {result.details}
              </p>
            )}
            {result.fee && (
              <div className="mt-4 pt-4 border-t border-border/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Application Fee</span>
                  <div className="text-right">
                    <span className="text-sm font-medium" data-testid="text-fee-amount">
                      {result.fee.currency} {result.fee.amount}
                    </span>
                    {result.fee.reimbursable && (
                      <p className="text-xs text-success mt-0.5">Reimbursable</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants} transition={springTransition}>
        <Card className="overflow-visible bg-surface border-border/40 rounded-2xl shadow-soft" data-testid="card-passport">
          <CardHeader className="flex flex-row items-start gap-4 pb-4">
            <div className="p-3 rounded-xl bg-muted/50">
              <Shield className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">Passport Requirements</CardTitle>
              <CardDescription className="mt-1">Validity and condition</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                <span>Valid for at least 6 months beyond travel dates</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                <span>At least 2 blank visa pages available</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                <span>Good condition, no damage or alterations</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants} transition={springTransition}>
        <Card className="overflow-visible bg-surface border-border/40 rounded-2xl shadow-soft" data-testid="card-required-docs">
          <CardHeader className="flex flex-row items-start gap-4 pb-4">
            <div className="p-3 rounded-xl bg-muted/50">
              <FileCheck className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">Required Documents</CardTitle>
              <CardDescription className="mt-1">Must have for entry</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium">1</span>
                </div>
                <span>Valid passport (see requirements above)</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium">2</span>
                </div>
                <span>Return or onward travel documentation</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium">3</span>
                </div>
                <span>Proof of accommodation or hotel booking</span>
              </li>
              {result.required && (
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium">4</span>
                  </div>
                  <span>{result.entryType} approval document</span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants} transition={springTransition}>
        <Card className="overflow-visible bg-surface border-border/40 rounded-2xl shadow-soft" data-testid="card-recommended-docs">
          <CardHeader className="flex flex-row items-start gap-4 pb-4">
            <div className="p-3 rounded-xl bg-muted/50">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">Recommended Documents</CardTitle>
              <CardDescription className="mt-1">Helpful but not required</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                <span>Business invitation letter from Carta</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                <span>Travel itinerary with meeting details</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                <span>Proof of employment at Carta</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                <span>Travel insurance documentation</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {trip && ["US", "GB", "CA", "BR", "DE", "JP"].includes(trip.destination) && (
        <motion.div variants={cardVariants} transition={springTransition}>
          <Card className="overflow-visible bg-surface border-border/40 rounded-2xl shadow-soft" data-testid="card-invitation-letter">
            <CardHeader className="flex flex-row items-start gap-4 pb-4">
              <div className="p-3 rounded-xl bg-accent-2/10">
                <Plane className="w-5 h-5 text-accent-2" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-foreground">Invitation Letter</CardTitle>
                <CardDescription className="mt-1">
                  Official Carta business invitation for {trip.destination} immigration
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Download a pre-formatted invitation letter on Carta letterhead. This document confirms your employment and business purpose for travel.
              </p>
              <Button
                onClick={handleDownloadLetter}
                disabled={isDownloading}
                variant="outline"
                data-testid="button-download-letter"
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? "Generating..." : "Download Letter"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={cardVariants} transition={springTransition}>
        <Card className="overflow-visible bg-surface border-border/40 rounded-2xl shadow-soft" data-testid="card-carta-policy">
          <CardHeader className="flex flex-row items-start gap-4 pb-4">
            <div className="p-3 rounded-xl bg-muted/50">
              <Building2 className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">Carta Policy Requirements</CardTitle>
              <CardDescription className="mt-1">Internal travel guidelines</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                <span>Book through Navan for flights and hotels</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                <span>Obtain manager approval before booking</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                <span>Book at least 21 days in advance (35 for international)</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                <span>Economy class for flights under 6 hours</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {result.maxStayDays > 0 && (
        <motion.div variants={cardVariants} transition={springTransition}>
          <Card className="overflow-visible bg-surface border-border/40 rounded-2xl shadow-soft" data-testid="card-notes">
            <CardHeader className="flex flex-row items-start gap-4 pb-4">
              <div className="p-3 rounded-xl bg-muted/50">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">Notes</CardTitle>
                <CardDescription className="mt-1">Additional information</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Maximum allowed stay</span>
                  <span className="font-medium" data-testid="text-max-stay">{result.maxStayDays} days</span>
                </div>
                {result.governance && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Data verification</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {result.governance.status}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {result.governance && (
        <motion.div variants={cardVariants} transition={springTransition}>
          <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
            <Info className="w-3 h-3" />
            <span>Requirements managed by {result.governance.owner}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
