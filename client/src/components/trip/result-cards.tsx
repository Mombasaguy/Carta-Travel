import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
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
  Plane,
  ExternalLink,
  BadgeCheck,
  FileSignature
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
  governance: { status: string; owner: string; reviewDueAt: string } | null;
  sources: { sourceId: string; title: string; verifiedAt: string }[] | null;
  actions: { label: string; url: string }[] | null;
  letterAvailable: boolean;
  letterTemplate: string | null;
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
  const [letterOpen, setLetterOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  
  const [mergeData, setMergeData] = useState({
    FULL_NAME: "",
    EMPLOYEE_EMAIL: "",
    EMPLOYEE_TITLE: "",
  });

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
            FULL_NAME: mergeData.FULL_NAME || "Employee Name",
            EMPLOYEE_EMAIL: mergeData.EMPLOYEE_EMAIL || "employee@carta.com",
            EMPLOYEE_TITLE: mergeData.EMPLOYEE_TITLE || "Team Member",
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
        setLetterOpen(false);
      } else {
        const fallbackResponse = await fetch("/api/letters/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeName: mergeData.FULL_NAME || "Employee Name",
            employeeEmail: mergeData.EMPLOYEE_EMAIL || "employee@carta.com",
            employeeTitle: mergeData.EMPLOYEE_TITLE || "Team Member",
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
        setLetterOpen(false);
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
                <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium">1</span>
                </div>
                <span>Valid passport (see requirements above)</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium">2</span>
                </div>
                <span>Return or onward travel documentation</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium">3</span>
                </div>
                <span>Proof of accommodation or hotel booking</span>
              </li>
              {result.required && (
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
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
              <Sheet open={letterOpen} onOpenChange={setLetterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" data-testid="button-generate-letter">
                    <FileSignature className="w-4 h-4 mr-2" />
                    Generate Letter
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-2xl">
                  <SheetHeader>
                    <SheetTitle>Invitation Letter Details</SheetTitle>
                    <SheetDescription>
                      Enter your information to personalize the letter
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name (as on passport)</Label>
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        value={mergeData.FULL_NAME}
                        onChange={(e) => setMergeData({ ...mergeData, FULL_NAME: e.target.value })}
                        data-testid="input-letter-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Work Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.name@carta.com"
                        value={mergeData.EMPLOYEE_EMAIL}
                        onChange={(e) => setMergeData({ ...mergeData, EMPLOYEE_EMAIL: e.target.value })}
                        data-testid="input-letter-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g. Software Engineer"
                        value={mergeData.EMPLOYEE_TITLE}
                        onChange={(e) => setMergeData({ ...mergeData, EMPLOYEE_TITLE: e.target.value })}
                        data-testid="input-letter-title"
                      />
                    </div>
                  </div>
                  <SheetFooter>
                    <Button
                      onClick={handleDownloadLetter}
                      disabled={isDownloading}
                      className="w-full"
                      data-testid="button-download-letter"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isDownloading ? "Generating..." : "Download Letter"}
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
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

      {result.actions && result.actions.length > 0 && (
        <motion.div variants={cardVariants} transition={springTransition}>
          <Card className="overflow-visible bg-surface border-border/40 rounded-2xl shadow-soft" data-testid="card-actions">
            <CardHeader className="flex flex-row items-start gap-4 pb-4">
              <div className="p-3 rounded-xl bg-accent-2/10">
                <ExternalLink className="w-5 h-5 text-accent-2" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
                <CardDescription className="mt-1">Official application links</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-3">
                {result.actions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(action.url, "_blank", "noopener,noreferrer")}
                    data-testid={`button-action-${index}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

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
                  <>
                    <div className="flex items-center justify-between py-2 border-b border-border/30">
                      <span className="text-muted-foreground">Data verification</span>
                      <Badge variant="secondary" className="text-xs">
                        {result.governance.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground">Next review due</span>
                      <span className="font-medium text-xs">{new Date(result.governance.reviewDueAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {result.sources && result.sources.length > 0 && (
        <motion.div variants={cardVariants} transition={springTransition}>
          <Sheet open={sourcesOpen} onOpenChange={setSourcesOpen}>
            <SheetTrigger asChild>
              <button 
                className="w-full flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-view-sources"
              >
                <BadgeCheck className="w-4 h-4" />
                <span>View {result.sources.length} verified sources</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[60vh]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-success" />
                  Sources & Citations
                </SheetTitle>
                <SheetDescription>
                  Official verification references for this information
                </SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-4 overflow-y-auto">
                {result.sources.map((source, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between py-3 px-4 rounded-xl bg-muted/30 border border-border/30"
                    data-testid={`source-${index}`}
                  >
                    <div>
                      <p className="text-sm font-medium">{source.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{source.sourceId}</p>
                    </div>
                    <Badge variant="outline" className="text-xs gap-1.5 shrink-0">
                      <BadgeCheck className="w-3 h-3" />
                      Verified {new Date(source.verifiedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </Badge>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
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
