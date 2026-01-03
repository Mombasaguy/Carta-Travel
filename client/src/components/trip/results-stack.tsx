import { useState } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  FileText, 
  ArrowLeft, 
  Download,
  Calendar,
  MapPin,
  User,
  Briefcase,
  Shield,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { TripResult, TripInput, Requirement, Severity } from "@shared/schema";

interface ResultsStackProps {
  result: TripResult;
  input: TripInput;
  onReset: () => void;
}

const severityConfig: Record<Severity, { icon: typeof CheckCircle2; variant: "default" | "destructive" | "outline" | "secondary"; label: string }> = {
  required: { icon: AlertCircle, variant: "destructive", label: "Required" },
  recommended: { icon: Info, variant: "secondary", label: "Recommended" },
  optional: { icon: CheckCircle2, variant: "outline", label: "Optional" },
};

const visaTypeLabels: Record<string, { label: string; color: string }> = {
  visa_free: { label: "Visa Free", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  visa_required: { label: "Visa Required", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  visa_on_arrival: { label: "Visa on Arrival", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  e_visa: { label: "e-Visa", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  eta: { label: "ETA/Authorization", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
};

const purposeLabels: Record<string, string> = {
  business_meeting: "Business Meeting",
  conference: "Conference",
  client_visit: "Client Visit",
  training: "Training",
  relocation: "Relocation",
  personal: "Personal Travel",
};

export function ResultsStack({ result, input, onReset }: ResultsStackProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadLetter = async () => {
    if (!result.letterTemplate) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch("/api/letters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeName: input.employeeName,
          employeeEmail: input.employeeEmail,
          destinationCountry: result.matchedRule?.countryName || input.destinationCountry,
          departureDate: input.departureDate,
          returnDate: input.returnDate,
          purpose: input.purpose,
          template: result.letterTemplate
        })
      });
      
      const data = await response.json();
      
      // Create and download as text file
      const blob = new Blob([data.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invitation_letter_${result.letterTemplate}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading letter:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.5, 
        ease: [0.32, 0.72, 0, 1]
      }
    }
  };

  const groupedRequirements = result.requirements.reduce<Record<string, Requirement[]>>((acc, req) => {
    if (!acc[req.type]) acc[req.type] = [];
    acc[req.type].push(req);
    return acc;
  }, {});

  const typeLabels: Record<string, { label: string; icon: typeof Shield }> = {
    entry: { label: "Entry Requirements", icon: Shield },
    document: { label: "Documents Needed", icon: FileText },
    health: { label: "Health & Safety", icon: CheckCircle2 },
    customs: { label: "Customs & Declarations", icon: Briefcase },
    stay: { label: "Stay Rules", icon: Clock },
    policy: { label: "Carta Policy", icon: Info },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <motion.div variants={cardVariants}>
        <Button 
          variant="ghost" 
          onClick={onReset}
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Check Another Trip
        </Button>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card className="overflow-visible border-primary/20 bg-gradient-to-br from-primary/5 to-transparent" data-testid="card-trip-summary">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2" data-testid="text-destination-name">
                  <MapPin className="w-5 h-5 text-primary" />
                  {result.matchedRule?.countryName || input.destinationCountry}
                </CardTitle>
                <CardDescription className="mt-1" data-testid="text-trip-purpose">
                  {purposeLabels[input.purpose]} Trip
                </CardDescription>
              </div>
              {result.matchedRule && (
                <Badge 
                  className={`${visaTypeLabels[result.matchedRule.output.visaType]?.color || ""} text-sm`}
                  data-testid="badge-visa-type"
                >
                  {visaTypeLabels[result.matchedRule.output.visaType]?.label || result.matchedRule.output.visaType}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2" data-testid="text-result-employee">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{input.employeeName}</span>
              </div>
              <div className="flex items-center gap-2" data-testid="text-result-departure">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{new Date(input.departureDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2" data-testid="text-result-return">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{new Date(input.returnDate).toLocaleDateString()}</span>
              </div>
              {result.matchedRule && (
                <div className="flex items-center gap-2" data-testid="text-result-max-stay">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{result.matchedRule.output.maxStayDays} days max</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {Object.entries(groupedRequirements).map(([type, reqs], index) => {
        const typeConfig = typeLabels[type] || { label: type, icon: Info };
        const TypeIcon = typeConfig.icon;
        
        return (
          <motion.div key={type} variants={cardVariants}>
            <Card className="overflow-visible" data-testid={`card-requirements-${type}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2" data-testid={`text-requirements-title-${type}`}>
                  <TypeIcon className="w-5 h-5 text-primary" />
                  {typeConfig.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {reqs.map((req) => {
                    const severity = severityConfig[req.severity];
                    const SeverityIcon = severity.icon;
                    
                    return (
                      <AccordionItem 
                        key={req.id} 
                        value={req.id}
                        className="border rounded-md px-4 mb-2 last:mb-0"
                        data-testid={`accordion-item-${req.id}`}
                      >
                        <AccordionTrigger 
                          className="hover:no-underline py-3"
                          data-testid={`button-accordion-${req.id}`}
                        >
                          <div className="flex items-center gap-3 text-left flex-1">
                            <SeverityIcon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                            <span className="font-medium flex-1">{req.title}</span>
                            <Badge variant={severity.variant} className="ml-2">
                              {severity.label}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground mb-3">{req.description}</p>
                          {req.details && req.details.length > 0 && (
                            <ul className="space-y-1.5">
                              {req.details.map((detail, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {result.letterEligible && result.letterTemplate && (
        <motion.div variants={cardVariants}>
          <Card className="overflow-visible border-primary bg-primary/5" data-testid="card-invitation-letter">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2" data-testid="text-letter-title">
                <FileText className="w-5 h-5 text-primary" />
                Invitation Letter Ready
              </CardTitle>
              <CardDescription data-testid="text-letter-description">
                A formal business invitation letter for {result.matchedRule?.countryName || input.destinationCountry} immigration purposes is available.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleDownloadLetter}
                disabled={isDownloading}
                data-testid="button-download-letter"
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? "Generating..." : "Download Letter"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={cardVariants} className="pt-4">
        <p className="text-xs text-muted-foreground text-center">
          Requirements last updated: {result.matchedRule?.lastUpdated || "N/A"} 
          {" · "}
          Always verify requirements with official sources before travel.
        </p>
      </motion.div>
    </motion.div>
  );
}
