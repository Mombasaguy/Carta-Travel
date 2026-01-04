import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, AlertCircle, Info, Shield, ExternalLink, Globe, Building2, Stethoscope, ChevronRight } from "lucide-react";
import type { TravelAdvisory, AdvisoryLevel, AdvisorySource } from "@shared/schema";

interface AdvisoriesResponse {
  advisories: TravelAdvisory[];
  count: number;
  levels: {
    LEVEL_4: number;
    LEVEL_3: number;
    LEVEL_2: number;
    LEVEL_1: number;
  };
}

function getLevelConfig(level: AdvisoryLevel) {
  switch (level) {
    case "LEVEL_4":
      return {
        label: "Do Not Travel",
        icon: AlertTriangle,
        badgeVariant: "destructive" as const,
        bgClass: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900",
        iconClass: "text-red-600 dark:text-red-400",
      };
    case "LEVEL_3":
      return {
        label: "Reconsider Travel",
        icon: AlertCircle,
        badgeVariant: "destructive" as const,
        bgClass: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900",
        iconClass: "text-orange-600 dark:text-orange-400",
      };
    case "LEVEL_2":
      return {
        label: "Exercise Increased Caution",
        icon: Info,
        badgeVariant: "secondary" as const,
        bgClass: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900",
        iconClass: "text-yellow-600 dark:text-yellow-400",
      };
    case "LEVEL_1":
      return {
        label: "Exercise Normal Precautions",
        icon: Shield,
        badgeVariant: "outline" as const,
        bgClass: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900",
        iconClass: "text-green-600 dark:text-green-400",
      };
  }
}

function getSourceConfig(source: AdvisorySource) {
  switch (source) {
    case "STATE_DEPT":
      return { label: "US State Department", icon: Globe };
    case "CDC":
      return { label: "CDC", icon: Stethoscope };
    case "CARTA":
      return { label: "Carta Policy", icon: Building2 };
  }
}

function AdvisoryCard({ advisory }: { advisory: TravelAdvisory }) {
  const levelConfig = getLevelConfig(advisory.level);
  const sourceConfig = getSourceConfig(advisory.source);
  const LevelIcon = levelConfig.icon;
  const SourceIcon = sourceConfig.icon;

  return (
    <Card className={`${levelConfig.bgClass} border hover-elevate transition-all`} data-testid={`card-advisory-${advisory.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md bg-background`}>
              <LevelIcon className={`h-5 w-5 ${levelConfig.iconClass}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{advisory.countryName}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant={levelConfig.badgeVariant} className="text-xs">
                  {levelConfig.label}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <SourceIcon className="h-3 w-3" />
                  {sourceConfig.label}
                </span>
              </CardDescription>
            </div>
          </div>
          {advisory.url && (
            <Button variant="ghost" size="sm" asChild>
              <a href={advisory.url} target="_blank" rel="noopener noreferrer" data-testid={`link-advisory-source-${advisory.id}`}>
                <ExternalLink className="h-4 w-4 mr-1" />
                Source
              </a>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm font-medium">{advisory.summary}</p>
        {advisory.details && (
          <p className="text-sm text-muted-foreground">{advisory.details}</p>
        )}
        {advisory.regions && advisory.regions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="text-xs text-muted-foreground">Affected regions:</span>
            {advisory.regions.map((region, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {region}
              </Badge>
            ))}
          </div>
        )}
        {advisory.tags && advisory.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t">
            {advisory.tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs capitalize">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="text-xs text-muted-foreground pt-2">
          Updated: {new Date(advisory.updatedAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}

function LevelSummaryCard({ level, count, onClick, isActive }: { level: AdvisoryLevel; count: number; onClick: () => void; isActive: boolean }) {
  const config = getLevelConfig(level);
  const Icon = config.icon;

  return (
    <Card 
      className={`cursor-pointer transition-all hover-elevate ${isActive ? 'ring-2 ring-primary' : ''} ${config.bgClass}`}
      onClick={onClick}
      data-testid={`card-level-filter-${level}`}
    >
      <CardContent className="p-4 flex items-center gap-3">
        <Icon className={`h-6 w-6 ${config.iconClass}`} />
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold">{count}</p>
          <p className="text-xs text-muted-foreground truncate">{config.label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdvisoriesPage() {
  const [levelFilter, setLevelFilter] = useState<AdvisoryLevel | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<AdvisorySource | "all">("all");

  const { data, isLoading, error } = useQuery<AdvisoriesResponse>({
    queryKey: ["/api/advisories"],
  });

  const filteredAdvisories = data?.advisories.filter(a => {
    if (levelFilter !== "all" && a.level !== levelFilter) return false;
    if (sourceFilter !== "all" && a.source !== sourceFilter) return false;
    return true;
  }) || [];

  const criticalCount = (data?.levels.LEVEL_4 || 0) + (data?.levels.LEVEL_3 || 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/" data-testid="link-home-breadcrumb">
            <span className="hover:text-foreground">Home</span>
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>Travel Advisories</span>
        </div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Travel Advisories</h1>
        <p className="text-muted-foreground mt-2">
          Current travel warnings and safety information from official government sources and Carta policy.
        </p>
        {criticalCount > 0 && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              {criticalCount} destination{criticalCount !== 1 ? 's' : ''} with significant travel restrictions
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Unable to load advisories</p>
          <p className="text-muted-foreground">Please try again later.</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <LevelSummaryCard 
              level="LEVEL_4" 
              count={data?.levels.LEVEL_4 || 0} 
              onClick={() => setLevelFilter(levelFilter === "LEVEL_4" ? "all" : "LEVEL_4")}
              isActive={levelFilter === "LEVEL_4"}
            />
            <LevelSummaryCard 
              level="LEVEL_3" 
              count={data?.levels.LEVEL_3 || 0} 
              onClick={() => setLevelFilter(levelFilter === "LEVEL_3" ? "all" : "LEVEL_3")}
              isActive={levelFilter === "LEVEL_3"}
            />
            <LevelSummaryCard 
              level="LEVEL_2" 
              count={data?.levels.LEVEL_2 || 0} 
              onClick={() => setLevelFilter(levelFilter === "LEVEL_2" ? "all" : "LEVEL_2")}
              isActive={levelFilter === "LEVEL_2"}
            />
            <LevelSummaryCard 
              level="LEVEL_1" 
              count={data?.levels.LEVEL_1 || 0} 
              onClick={() => setLevelFilter(levelFilter === "LEVEL_1" ? "all" : "LEVEL_1")}
              isActive={levelFilter === "LEVEL_1"}
            />
          </div>

          <div className="flex flex-wrap gap-4 mb-6 items-center">
            <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as AdvisorySource | "all")}>
              <SelectTrigger className="w-48" data-testid="select-source-filter">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="STATE_DEPT">US State Department</SelectItem>
                <SelectItem value="CDC">CDC</SelectItem>
                <SelectItem value="CARTA">Carta Policy</SelectItem>
              </SelectContent>
            </Select>

            {(levelFilter !== "all" || sourceFilter !== "all") && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => { setLevelFilter("all"); setSourceFilter("all"); }}
                data-testid="button-clear-filters"
              >
                Clear filters
              </Button>
            )}

            <span className="text-sm text-muted-foreground ml-auto">
              Showing {filteredAdvisories.length} of {data?.count || 0} advisories
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredAdvisories.map((advisory) => (
              <AdvisoryCard key={advisory.id} advisory={advisory} />
            ))}
          </div>

          {filteredAdvisories.length === 0 && (
            <Card className="p-8 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No advisories match your filters</p>
              <p className="text-muted-foreground">Try adjusting your filter criteria.</p>
            </Card>
          )}
        </>
      )}

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium mb-2">About Travel Advisories</h3>
        <p className="text-sm text-muted-foreground">
          Advisory levels are based on U.S. State Department guidelines. Level 1 (green) indicates normal precautions, 
          Level 2 (yellow) suggests increased caution, Level 3 (orange) recommends reconsidering travel, and 
          Level 4 (red) advises against travel. Carta-specific policies may impose additional restrictions.
        </p>
      </div>
    </div>
  );
}
