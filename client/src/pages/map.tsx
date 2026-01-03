import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Map, { Source, Layer, type MapMouseEvent } from "react-map-gl/mapbox";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plane, FileText, Clock, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

type MapColor = "green" | "yellow" | "orange" | "red" | "gray";

interface MapColorResponse {
  passport: string;
  generatedAt: string;
  colorsByCountry: Record<string, MapColor>;
  legend: Record<MapColor, string>;
}

interface AssessResult {
  entryType: string;
  required: boolean;
  headline: string;
  details: string | null;
  reason: string | null;
  maxStayDays: number;
  fee: { amount: number; currency: string; reimbursable: boolean } | null;
  governance: { status: string; owner: string; reviewDueAt: string } | null;
  sources: { sourceId: string; title: string; verifiedAt: string }[] | null;
  actions: { label: string; url: string }[] | null;
  letterAvailable: boolean;
  dataSource: string;
}

const colorMap: Record<MapColor, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  red: "#ef4444",
  gray: "#6b7280",
};

const countryNameMap: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  DE: "Germany",
  JP: "Japan",
  BR: "Brazil",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  AU: "Australia",
  IN: "India",
  CN: "China",
  MX: "Mexico",
  NL: "Netherlands",
  CH: "Switzerland",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  IE: "Ireland",
  AT: "Austria",
  BE: "Belgium",
  PT: "Portugal",
  GR: "Greece",
  PL: "Poland",
  CZ: "Czech Republic",
  HU: "Hungary",
  RO: "Romania",
  BG: "Bulgaria",
  HR: "Croatia",
  SK: "Slovakia",
  SI: "Slovenia",
  EE: "Estonia",
  LV: "Latvia",
  LT: "Lithuania",
  LU: "Luxembourg",
  MT: "Malta",
  CY: "Cyprus",
  NZ: "New Zealand",
  SG: "Singapore",
  HK: "Hong Kong",
  KR: "South Korea",
  TW: "Taiwan",
  TH: "Thailand",
  MY: "Malaysia",
  ID: "Indonesia",
  PH: "Philippines",
  VN: "Vietnam",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  IL: "Israel",
  TR: "Turkey",
  ZA: "South Africa",
  EG: "Egypt",
  NG: "Nigeria",
  KE: "Kenya",
  AR: "Argentina",
  CL: "Chile",
  CO: "Colombia",
  PE: "Peru",
};

const passportOptions = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "JP", name: "Japan" },
  { code: "AU", name: "Australia" },
  { code: "BR", name: "Brazil" },
];

export default function MapPage() {
  const [passport, setPassport] = useState("US");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [assessResult, setAssessResult] = useState<AssessResult | null>(null);

  const { data: mapData, isLoading: mapLoading } = useQuery<MapColorResponse>({
    queryKey: ["/api/map", passport],
    queryFn: async () => {
      const res = await fetch(`/api/map?passport=${passport}`);
      return res.json();
    },
  });

  const assessMutation = useMutation({
    mutationFn: async (destination: string) => {
      const today = new Date().toISOString().split("T")[0];
      const res = await apiRequest("POST", "/api/assess", {
        citizenship: passport,
        destination,
        purpose: "BUSINESS",
        durationDays: 14,
        travelDate: today,
        isUSEmployerSponsored: false,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setAssessResult(data);
    },
  });

  const handleCountryClick = useCallback((e: MapMouseEvent) => {
    const feature = e.features?.[0];
    if (feature?.properties?.iso_3166_1_alpha_2) {
      const countryCode = feature.properties.iso_3166_1_alpha_2;
      setSelectedCountry(countryCode);
      setAssessResult(null);
      assessMutation.mutate(countryCode);
    }
  }, [assessMutation, passport]);

  const closePanel = () => {
    setSelectedCountry(null);
    setAssessResult(null);
  };

  const fillColorExpression: unknown = [
    "match",
    ["get", "iso_3166_1_alpha_2"],
    ...Object.entries(mapData?.colorsByCountry ?? {}).flatMap(([code, color]) => [
      code,
      colorMap[color],
    ]),
    "#d1d5db",
  ];

  if (!MAPBOX_TOKEN) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-semibold mb-2">Mapbox Token Required</h1>
        <p className="text-muted-foreground">
          Please set the VITE_MAPBOX_ACCESS_TOKEN environment variable to enable the map.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-8rem)]">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <Select value={passport} onValueChange={setPassport}>
          <SelectTrigger className="w-48 bg-background" data-testid="select-passport">
            <SelectValue placeholder="Select passport" />
          </SelectTrigger>
          <SelectContent>
            {passportOptions.map((opt) => (
              <SelectItem key={opt.code} value={opt.code}>
                {opt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="absolute bottom-4 left-4 z-10 bg-background/90 backdrop-blur-sm rounded-md p-3 border">
        <div className="text-xs font-medium mb-2">Visa Requirements</div>
        <div className="flex flex-col gap-1">
          {mapData?.legend && Object.entries(mapData.legend).map(([color, label]) => (
            <div key={color} className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: colorMap[color as MapColor] }} 
              />
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: 0,
          latitude: 20,
          zoom: 1.5,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        interactiveLayerIds={["country-fills"]}
        onClick={handleCountryClick}
        cursor="pointer"
      >
        <Source
          id="countries"
          type="vector"
          url="mapbox://mapbox.country-boundaries-v1"
        >
          <Layer
            id="country-fills"
            type="fill"
            source-layer="country_boundaries"
            paint={{
              "fill-color": mapLoading ? "#d1d5db" : (fillColorExpression as string),
              "fill-opacity": 0.7,
            }}
          />
          <Layer
            id="country-borders"
            type="line"
            source-layer="country_boundaries"
            paint={{
              "line-color": "#9ca3af",
              "line-width": 0.5,
            }}
          />
        </Source>
      </Map>

      <AnimatePresence>
        {selectedCountry && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 h-full w-96 bg-background border-l shadow-xl overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {countryNameMap[selectedCountry] || selectedCountry}
                </h2>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={closePanel}
                  data-testid="button-close-panel"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {assessMutation.isPending && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              )}

              {assessResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Plane className="w-4 h-4" />
                          Entry Requirements
                        </CardTitle>
                        <Badge variant={assessResult.required ? "destructive" : "secondary"}>
                          {assessResult.entryType}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium mb-1">{assessResult.headline}</p>
                      {assessResult.details && (
                        <p className="text-sm text-muted-foreground">{assessResult.details}</p>
                      )}
                    </CardContent>
                  </Card>

                  {assessResult.maxStayDays > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Allowed Stay
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">Up to {assessResult.maxStayDays} days</p>
                      </CardContent>
                    </Card>
                  )}

                  {assessResult.fee && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Fee</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          {assessResult.fee.currency} {assessResult.fee.amount}
                          {assessResult.fee.reimbursable && (
                            <span className="text-green-600 ml-2">(Reimbursable)</span>
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {assessResult.reason && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Why This Applies
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{assessResult.reason}</p>
                      </CardContent>
                    </Card>
                  )}

                  {assessResult.actions && assessResult.actions.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {assessResult.actions.map((action, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className="w-full justify-start"
                          asChild
                        >
                          <a href={action.url} target="_blank" rel="noopener noreferrer">
                            {action.label}
                          </a>
                        </Button>
                      ))}
                    </div>
                  )}

                  {assessResult.governance && (
                    <div className="text-xs text-muted-foreground border-t pt-3 mt-4">
                      <p>Data source: {assessResult.dataSource}</p>
                      <p>Status: {assessResult.governance.status}</p>
                      <p>Review due: {assessResult.governance.reviewDueAt}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {assessMutation.isError && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>Could not load requirements for this destination.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
