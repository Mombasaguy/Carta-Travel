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
  Clock,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { TripResult, TripInput, StructuredRequirement, RequirementSeverity } from "@shared/schema";

interface ResultsStackProps {
  result: TripResult;
  input: TripInput;
  onReset: () => void;
}

const countryNames: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  DE: "Germany",
  JP: "Japan",
  BR: "Brazil",
};

const severityConfig: Record<RequirementSeverity, { icon: typeof CheckCircle2; variant: "default" | "destructive" | "outline" | "secondary"; label: string }> = {
  required: { icon: AlertCircle, variant: "destructive", label: "Required" },
  recommended: { icon: Info, variant: "secondary", label: "Recommended" },
  info: { icon: Info, variant: "outline", label: "Info" },
  warning: { icon: AlertCircle, variant: "secondary", label: "Warning" },
};

const entryTypeLabels: Record<string, { label: string; color: string }> = {
  VISA_FREE: { label: "Visa Free", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  B1_VISA: { label: "B-1 Visa Required", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  ETA: { label: "ETA Required", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  ESTA: { label: "ESTA Required", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
};

const purposeLabels: Record<string, string> = {
  business: "Business",
  conference: "Conference",
  client_meeting: "Client Meeting",
  internal: "Internal",
  relocation: "Relocation",
};

export function ResultsStack({ result, input, onReset }: ResultsStackProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const getCountryName = () => {
    if (result.matchedRule) {
      return countryNames[result.matchedRule.to_country] || result.matchedRule.to_country;
    }
    return countryNames[input.destinationCountry.toUpperCase()] || input.destinationCountry;
  };

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
          destinationCountry: getCountryName(),
          departureDate: input.departureDate,
          returnDate: input.returnDate,
          purpose: input.purpose,
          template: result.letterTemplate
        })
      });
      
      const data = await response.json();
      
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

  const groupedRequirements = result.requirements.reduce<Record<string, StructuredRequirement[]>>((acc, req) => {
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

  const entryType = result.matchedRule?.outputs.entry_authorization.type;
  const entryLabel = entryType ? entryTypeLabels[entryType] : null;

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
                  {getCountryName()}
                </CardTitle>
                <CardDescription className="mt-1" data-testid="text-trip-purpose">
                  {purposeLabels[input.purpose] || input.purpose} Trip
                </CardDescription>
              </div>
              {entryLabel && (
                <Badge 
                  className={`${entryLabel.color} text-sm`}
                  data-testid="badge-visa-type"
                >
                  {entryLabel.label}
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
                  <span>{result.matchedRule.max_duration_days} days max</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {Object.entries(groupedRequirements).map(([type, reqs]) => {
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
                          {req.fee && (
                            <p className="text-sm mb-2">
                              <span className="font-medium">Fee:</span> {req.fee.amount} {req.fee.currency}
                              {req.fee.reimbursable && <span className="text-green-600 dark:text-green-400 ml-2">(Reimbursable)</span>}
                            </p>
                          )}
                          {req.actions && req.actions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {req.actions.map((action, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  data-testid={`button-action-${req.id}-${idx}`}
                                >
                                  <a href={action.url} target="_blank" rel="noopener noreferrer">
                                    {action.label}
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                  </a>
                                </Button>
                              ))}
                            </div>
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
                A formal business invitation letter for {getCountryName()} immigration purposes is available.
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

      {result.sources && result.sources.length > 0 && (
        <motion.div variants={cardVariants}>
          <Card className="overflow-visible bg-muted/50" data-testid="card-sources">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs text-muted-foreground space-y-1">
                {result.sources.map((source) => (
                  <li key={source.source_id} data-testid={`text-source-${source.source_id}`}>
                    {source.title} (verified {source.verified_at})
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={cardVariants} className="pt-4">
        <p className="text-xs text-muted-foreground text-center" data-testid="text-governance-info">
          {result.governance ? (
            <>
              Owner: {result.governance.owner} · Status: {result.governance.status} · Review due: {result.governance.review_due_at}
            </>
          ) : (
            "Always verify requirements with official sources before travel."
          )}
        </p>
      </motion.div>
    </motion.div>
  );
}
