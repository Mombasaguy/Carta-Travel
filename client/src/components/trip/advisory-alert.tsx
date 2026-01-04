import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, Info, Shield, ExternalLink, ChevronRight, Globe, Building2, Stethoscope } from "lucide-react";
import type { TravelAdvisory, AdvisoryLevel, AdvisorySource } from "@shared/schema";

interface AdvisoryResponse {
  countryCode: string;
  advisories: TravelAdvisory[];
  highestLevel: AdvisoryLevel | null;
  highestLevelLabel: string | null;
}

interface AdvisoryAlertProps {
  destinationCode: string;
  destinationName?: string;
}

function getLevelConfig(level: AdvisoryLevel) {
  switch (level) {
    case "LEVEL_4":
      return {
        label: "Do Not Travel",
        icon: AlertTriangle,
        bgClass: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900",
        iconClass: "text-red-600 dark:text-red-400",
        textClass: "text-red-800 dark:text-red-200",
        badgeClass: "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700",
      };
    case "LEVEL_3":
      return {
        label: "Reconsider Travel",
        icon: AlertCircle,
        bgClass: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900",
        iconClass: "text-orange-600 dark:text-orange-400",
        textClass: "text-orange-800 dark:text-orange-200",
        badgeClass: "bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700",
      };
    case "LEVEL_2":
      return {
        label: "Exercise Increased Caution",
        icon: Info,
        bgClass: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900",
        iconClass: "text-yellow-600 dark:text-yellow-500",
        textClass: "text-yellow-800 dark:text-yellow-200",
        badgeClass: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700",
      };
    case "LEVEL_1":
      return {
        label: "Exercise Normal Precautions",
        icon: Shield,
        bgClass: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900",
        iconClass: "text-green-600 dark:text-green-400",
        textClass: "text-green-800 dark:text-green-200",
        badgeClass: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700",
      };
  }
}

function getSourceIcon(source: AdvisorySource) {
  switch (source) {
    case "STATE_DEPT": return Globe;
    case "CDC": return Stethoscope;
    case "CARTA": return Building2;
  }
}

function getSourceLabel(source: AdvisorySource) {
  switch (source) {
    case "STATE_DEPT": return "US State Dept";
    case "CDC": return "CDC";
    case "CARTA": return "Carta Policy";
  }
}

const springTransition = { type: "spring", stiffness: 280, damping: 30 };

export function AdvisoryAlert({ destinationCode, destinationName }: AdvisoryAlertProps) {
  const { data, isLoading, error } = useQuery<AdvisoryResponse>({
    queryKey: ["/api/advisories", destinationCode],
    enabled: !!destinationCode && destinationCode.length === 2,
  });

  if (isLoading || error || !data || data.advisories.length === 0) {
    return null;
  }

  const highestAdvisory = data.advisories[0];
  const config = getLevelConfig(highestAdvisory.level);
  const Icon = config.icon;
  const SourceIcon = getSourceIcon(highestAdvisory.source);

  const showWarning = highestAdvisory.level === "LEVEL_3" || highestAdvisory.level === "LEVEL_4";
  const showCaution = highestAdvisory.level === "LEVEL_2";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...springTransition, delay: 0.05 }}
      data-testid="advisory-alert"
    >
      <Card className={`${config.bgClass} border mb-4`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-md bg-background/80 flex-shrink-0`}>
              <Icon className={`h-5 w-5 ${config.iconClass}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`font-semibold ${config.textClass}`}>
                  {config.label}
                </span>
                <Badge variant="outline" className={`text-xs ${config.badgeClass}`}>
                  <SourceIcon className="h-3 w-3 mr-1" />
                  {getSourceLabel(highestAdvisory.source)}
                </Badge>
              </div>
              <p className={`text-sm ${config.textClass} opacity-90 mb-2`}>
                {highestAdvisory.summary}
              </p>
              {highestAdvisory.regions && highestAdvisory.regions.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="text-xs text-muted-foreground">Regions:</span>
                  {highestAdvisory.regions.slice(0, 3).map((region, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {region}
                    </Badge>
                  ))}
                  {highestAdvisory.regions.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{highestAdvisory.regions.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                {highestAdvisory.url && (
                  <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
                    <a href={highestAdvisory.url} target="_blank" rel="noopener noreferrer" data-testid="link-advisory-source">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Official source
                    </a>
                  </Button>
                )}
                <Link href="/advisories">
                  <Button variant="ghost" size="sm" className="h-7 px-2" data-testid="link-all-advisories">
                    View all advisories
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
              {data.advisories.length > 1 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {data.advisories.length - 1} additional advisor{data.advisories.length > 2 ? 'ies' : 'y'} for this destination
                </p>
              )}
            </div>
          </div>
          {showWarning && (
            <div className={`mt-3 pt-3 border-t ${config.textClass} opacity-80`}>
              <p className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {highestAdvisory.level === "LEVEL_4" 
                  ? "Carta strongly discourages travel to this destination. Manager and executive approval required."
                  : "Additional approval may be required for travel to this destination. Contact People Operations."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
