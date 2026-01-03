import { FileText, Shield, Heart, Package, Clock, Check, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Requirement, RequirementType, RequirementSeverity } from "@shared/schema";

interface RequirementCardProps {
  requirements: Requirement[];
  type: RequirementType;
}

const typeConfig: Record<RequirementType, { label: string; icon: typeof FileText; color: string }> = {
  entry: { label: "Entry Requirements", icon: FileText, color: "text-blue-500" },
  document: { label: "Required Documents", icon: FileText, color: "text-purple-500" },
  health: { label: "Health Requirements", icon: Heart, color: "text-red-500" },
  customs: { label: "Customs & Restrictions", icon: Package, color: "text-orange-500" },
  stay: { label: "Stay Regulations", icon: Clock, color: "text-green-500" },
};

const severityConfig: Record<RequirementSeverity, { label: string; icon: typeof Check; variant: "default" | "secondary" | "outline" }> = {
  required: { label: "Required", icon: AlertTriangle, variant: "default" },
  recommended: { label: "Recommended", icon: Info, variant: "secondary" },
  optional: { label: "Optional", icon: Check, variant: "outline" },
};

export function RequirementCard({ requirements, type }: RequirementCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  if (requirements.length === 0) {
    return null;
  }

  return (
    <Card data-testid={`card-requirements-${type}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className={`h-5 w-5 ${config.color}`} />
          {config.label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-2">
          {requirements.map((req) => {
            const severity = severityConfig[req.severity];
            const SeverityIcon = severity.icon;

            return (
              <AccordionItem 
                key={req.id} 
                value={req.id}
                className="border rounded-md px-4"
                data-testid={`accordion-requirement-${req.id}`}
              >
                <AccordionTrigger className="hover:no-underline py-3" data-testid={`button-accordion-${req.id}`}>
                  <div className="flex items-center gap-3 text-left">
                    <SeverityIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span className="font-medium">{req.title}</span>
                    <Badge variant={severity.variant} className="ml-auto mr-2">
                      {severity.label}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <p className="text-muted-foreground mb-3">{req.description}</p>
                  {req.details && req.details.length > 0 && (
                    <ul className="space-y-1.5">
                      {req.details.map((detail, index) => (
                        <li 
                          key={index} 
                          className="flex items-start gap-2 text-sm"
                        >
                          <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
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
  );
}
