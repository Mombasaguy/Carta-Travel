import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, AlertCircle, FileText, Info } from "lucide-react";
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
  NONE: "Visa Free",
  ETA: "ETA Required",
  EVISA: "e-Visa Required",
  VISA: "Visa Required",
  UNKNOWN: "Unknown",
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

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
          transition: { staggerChildren: 0.1 }
        }
      }}
    >
      <motion.div variants={cardVariants}>
        <Card className="overflow-visible border-border/50" data-testid="card-entry-result">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
            <div className="flex items-center gap-3">
              {result.required ? (
                <AlertCircle className="w-5 h-5 text-warning" />
              ) : (
                <CheckCircle className="w-5 h-5 text-success" />
              )}
              <CardTitle className="text-lg font-medium" data-testid="text-entry-type">
                {entryTypeLabels[result.entryType] || result.entryType}
              </CardTitle>
            </div>
            <Badge variant={entryTypeBadgeVariants[result.entryType] || "secondary"}>
              {result.entryType}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground" data-testid="text-headline">{result.headline}</p>
            {result.details && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed" data-testid="text-details">
                {result.details}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {result.fee && (
        <motion.div variants={cardVariants}>
          <Card className="overflow-visible border-border/50" data-testid="card-fee">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fee</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium" data-testid="text-fee-amount">
                {result.fee.currency} {result.fee.amount}
              </p>
              {result.fee.reimbursable && (
                <p className="text-xs text-success mt-2">Reimbursable per Carta policy</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {result.maxStayDays > 0 && (
        <motion.div variants={cardVariants}>
          <Card className="overflow-visible border-border/50" data-testid="card-max-stay">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Maximum Stay</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium" data-testid="text-max-stay">
                {result.maxStayDays} days
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {trip && ["US", "GB", "CA", "BR", "DE", "JP"].includes(trip.destination) && (
        <motion.div variants={cardVariants}>
          <Card className="overflow-visible border-border/50" data-testid="card-invitation-letter">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base font-medium">Invitation Letter</CardTitle>
              </div>
              <CardDescription className="mt-1">
                Business invitation letter for {trip.destination} immigration purposes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleDownloadLetter}
                disabled={isDownloading}
                variant="outline"
                size="sm"
                data-testid="button-download-letter"
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? "Generating..." : "Download Letter"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {result.governance && (
        <motion.div variants={cardVariants}>
          <Card className="overflow-visible border-border/30 bg-muted/30" data-testid="card-governance">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-subtle" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Governance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {result.governance.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Managed by {result.governance.owner}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
