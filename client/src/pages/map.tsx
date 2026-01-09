import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Map, { Source, Layer, type MapMouseEvent, type MapRef } from "react-map-gl/mapbox";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, AlertCircle, X, Plane, Clock, FileText, ExternalLink, Globe, Shield } from "lucide-react";
import { Link } from "wouter";
import "mapbox-gl/dist/mapbox-gl.css";

interface AssessResult {
  destination: string;
  citizenship: string;
  purpose: string;
  entryType: string;
  required: boolean;
  headline: string;
  details?: string;
  maxStayDays: number;
  processingTime?: string;
  fee?: { currency: string; amount: number; reimbursable: boolean };
  reason?: string;
  actions?: { label: string; url: string }[];
  governance?: { status: string; reviewDueAt: string };
  dataSource?: string;
}

type MapColor = "green" | "yellow" | "orange" | "red" | "gray";

interface MapColorResponse {
  passport: string;
  generatedAt: string;
  colorsByIso2: Record<string, MapColor>;
  legend: Record<MapColor, string>;
}

const colorMap: Record<MapColor, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  red: "#ef4444",
  gray: "#6b7280",
};

const iso3ToIso2: Record<string, string> = {
  USA: "US", GBR: "GB", DEU: "DE", FRA: "FR", CAN: "CA", AUS: "AU",
  JPN: "JP", CHN: "CN", IND: "IN", BRA: "BR", MEX: "MX", ITA: "IT",
  ESP: "ES", NLD: "NL", CHE: "CH", SWE: "SE", NOR: "NO", DNK: "DK",
  FIN: "FI", BEL: "BE", AUT: "AT", IRL: "IE", PRT: "PT", POL: "PL",
  CZE: "CZ", HUN: "HU", ROU: "RO", BGR: "BG", HRV: "HR", SVK: "SK",
  SVN: "SI", EST: "EE", LVA: "LV", LTU: "LT", GRC: "GR", CYP: "CY",
  MLT: "MT", LUX: "LU", ISL: "IS", NZL: "NZ", SGP: "SG", HKG: "HK",
  KOR: "KR", TWN: "TW", MYS: "MY", THA: "TH", VNM: "VN", PHL: "PH",
  IDN: "ID", ARE: "AE", SAU: "SA", ISR: "IL", TUR: "TR", ZAF: "ZA",
  EGY: "EG", NGA: "NG", KEN: "KE", MAR: "MA", ARG: "AR", CHL: "CL",
  COL: "CO", PER: "PE", VEN: "VE", RUS: "RU", UKR: "UA", QAT: "QA",
};

const nameToIso2: Record<string, string> = {
  "France": "FR", "Norway": "NO", "United States of America": "US",
  "United States": "US", "United Kingdom": "GB", "Germany": "DE",
  "Canada": "CA", "Australia": "AU", "Japan": "JP", "China": "CN",
  "India": "IN", "Brazil": "BR", "Mexico": "MX", "Italy": "IT",
  "Spain": "ES", "Netherlands": "NL", "Switzerland": "CH", "Sweden": "SE",
  "Denmark": "DK", "Finland": "FI", "Belgium": "BE", "Austria": "AT",
  "Ireland": "IE", "Portugal": "PT", "Poland": "PL", "Czech Republic": "CZ",
  "Czechia": "CZ", "Hungary": "HU", "Romania": "RO", "Bulgaria": "BG",
  "Croatia": "HR", "Slovakia": "SK", "Slovenia": "SI", "Estonia": "EE",
  "Latvia": "LV", "Lithuania": "LT", "Greece": "GR", "Cyprus": "CY",
  "Malta": "MT", "Luxembourg": "LU", "Iceland": "IS", "New Zealand": "NZ",
  "Singapore": "SG", "Hong Kong": "HK", "South Korea": "KR", "Republic of Korea": "KR",
  "Korea": "KR", "Taiwan": "TW", "Thailand": "TH", "Vietnam": "VN",
  "Viet Nam": "VN", "Philippines": "PH", "Indonesia": "ID", "Malaysia": "MY",
  "United Arab Emirates": "AE", "Saudi Arabia": "SA", "Israel": "IL",
  "Turkey": "TR", "South Africa": "ZA", "Egypt": "EG", "Nigeria": "NG",
  "Kenya": "KE", "Morocco": "MA", "Argentina": "AR", "Chile": "CL",
  "Colombia": "CO", "Peru": "PE",
};

const countryNames: Record<string, string> = {
  US: "United States", GB: "United Kingdom", CA: "Canada", BR: "Brazil",
  DE: "Germany", JP: "Japan", AU: "Australia", FR: "France", IT: "Italy",
  ES: "Spain", NL: "Netherlands", SG: "Singapore", IN: "India", CN: "China",
  KR: "South Korea", MX: "Mexico", CH: "Switzerland", SE: "Sweden",
  NO: "Norway", DK: "Denmark", FI: "Finland", IE: "Ireland", NZ: "New Zealand",
  PL: "Poland", PT: "Portugal", AT: "Austria", BE: "Belgium", AE: "United Arab Emirates",
  SA: "Saudi Arabia", IL: "Israel", TR: "Turkey", ZA: "South Africa",
  EG: "Egypt", TH: "Thailand", MY: "Malaysia", ID: "Indonesia", PH: "Philippines",
  VN: "Vietnam", AR: "Argentina", CL: "Chile", CO: "Colombia", PE: "Peru",
  RU: "Russia", UA: "Ukraine", GR: "Greece", CZ: "Czech Republic", HU: "Hungary",
  RO: "Romania", BG: "Bulgaria", HR: "Croatia", IS: "Iceland",
};

const passportOptions = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "SG", name: "Singapore" },
  { code: "NL", name: "Netherlands" },
  { code: "CH", name: "Switzerland" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "IE", name: "Ireland" },
  { code: "NZ", name: "New Zealand" },
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "PT", name: "Portugal" },
  { code: "PL", name: "Poland" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
];

const destinationOptions = Object.entries(countryNames)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function MapPage() {
  const [, navigate] = useLocation();
  const [passport, setPassport] = useState("US");
  const [destination, setDestination] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [assessResult, setAssessResult] = useState<AssessResult | null>(null);
  const mapRef = useRef<MapRef>(null);

  const { data: configData, isLoading: configLoading } = useQuery<{ token: string }>({
    queryKey: ["/api/config/mapbox"],
  });

  const mapboxToken = configData?.token;

  const { data: mapData, isLoading: mapLoading } = useQuery<MapColorResponse>({
    queryKey: ["/api/map", passport],
    queryFn: async () => {
      const res = await fetch(`/api/map?passport=${passport}`);
      if (!res.ok) throw new Error("Failed to fetch map data");
      return res.json();
    },
    enabled: !!mapboxToken,
  });

  const assessMutation = useMutation({
    mutationFn: async (destCode: string) => {
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: destCode,
          citizenship: passport,
          purpose: "BUSINESS",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setAssessResult(data);
    },
  });

  const handleCountryClick = useCallback((e: MapMouseEvent) => {
    if (!mapRef.current) return;
    
    const features = mapRef.current.queryRenderedFeatures(e.point, {
      layers: ["country-fills"],
    });
    
    if (!features || features.length === 0) return;
    const countryFeature = features[0];
    const props = countryFeature.properties;
    if (!props) return;
    
    let countryCode = props["ISO3166-1-Alpha-2"];
    if (!countryCode || countryCode === "-99") countryCode = props["ISO_A2"];
    if (!countryCode || countryCode === "-99") {
      const iso3 = props["ISO3166-1-Alpha-3"] || props["ISO_A3"];
      if (iso3 && iso3ToIso2[iso3]) countryCode = iso3ToIso2[iso3];
    }
    if (!countryCode || countryCode === "-99") {
      const name = props["ADMIN"] || props["name"];
      if (name && nameToIso2[name]) countryCode = nameToIso2[name];
    }
    if (countryCode && countryCode !== "-99") {
      setDestination(countryCode);
      setSelectedCountry(countryCode);
      setAssessResult(null);
      setValidationError(null);
      assessMutation.mutate(countryCode);
    }
  }, [assessMutation]);

  const closePanel = () => {
    setSelectedCountry(null);
    setAssessResult(null);
  };

  const handleCheckRequirements = () => {
    if (!destination) {
      setValidationError("Select a destination to continue");
      return;
    }
    navigate(`/assess?passport=${passport}&destination=${destination}`);
  };

  const colorsByIso2 = mapData?.colorsByIso2 ?? {};
  const fillColorExpression = [
    "match",
    ["get", "ISO3166-1-Alpha-2"],
    ...Object.entries(colorsByIso2).flatMap(([code, color]) => [code, colorMap[color]]),
    "#d1d5db",
  ] as unknown as string;

  const selectedPassportName = passportOptions.find(p => p.code === passport)?.name || passport;

  return (
    <div className="relative h-[calc(100vh-3.5rem)] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Premium Header Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Branding */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-semibold tracking-tight text-slate-900">Carta</span>
                    <span className="text-lg font-light text-slate-600">Travel</span>
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 -mt-0.5">Global Mobility Platform</p>
                </div>
              </div>
            </div>

            {/* Center: Context Message */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Viewing requirements for{" "}
                  <span className="font-semibold text-slate-900">{selectedPassportName}</span>{" "}
                  passport holders
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Click any country to see entry requirements</p>
              </div>
            </div>

            {/* Right: Legend */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50/80 rounded-full border border-slate-200/60">
                {mapData?.legend && Object.entries(mapData.legend).slice(0, 4).map(([color, label]) => (
                  <div key={color} className="flex items-center gap-1.5">
                    <div 
                      className="w-2.5 h-2.5 rounded-full shadow-sm" 
                      style={{ backgroundColor: colorMap[color as MapColor] }} 
                    />
                    <span className="text-xs text-slate-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Context Banner */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="md:hidden absolute top-[72px] left-0 right-0 z-10 px-4"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200/60 px-4 py-3 shadow-sm">
          <p className="text-sm text-slate-600 text-center">
            Visa requirements for <span className="font-semibold text-slate-900">{selectedPassportName}</span> passport
          </p>
          {/* Mobile Legend */}
          <div className="flex items-center justify-center gap-3 mt-2">
            {mapData?.legend && Object.entries(mapData.legend).slice(0, 4).map(([color, label]) => (
              <div key={color} className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: colorMap[color as MapColor] }} 
                />
                <span className="text-[10px] text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Map */}
      {configLoading ? (
        <div className="absolute inset-0 flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent mx-auto" />
            <p className="text-sm text-slate-500 mt-3">Loading global map...</p>
          </div>
        </div>
      ) : !mapboxToken ? (
        <div className="absolute inset-0 flex items-center justify-center pt-20">
          <div className="text-center px-4">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <h1 className="text-xl font-semibold mb-2 text-slate-900">Map Configuration Required</h1>
            <p className="text-slate-500">Please configure the Mapbox token.</p>
          </div>
        </div>
      ) : (
        <div className="pt-[72px] h-full">
          <Map
            ref={mapRef}
            mapboxAccessToken={mapboxToken}
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
              type="geojson"
              data="https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
            >
              <Layer
                id="country-fills"
                type="fill"
                paint={{
                  "fill-color": mapLoading ? "#d1d5db" : fillColorExpression,
                  "fill-opacity": 0.75,
                }}
              />
              <Layer
                id="country-borders"
                type="line"
                paint={{
                  "line-color": "#94a3b8",
                  "line-width": 0.5,
                }}
              />
            </Source>
          </Map>
        </div>
      )}

      {/* Floating Control Panel */}
      <div className="absolute inset-x-0 bottom-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-8 lg:left-12 md:right-auto pointer-events-none px-4 pb-6 md:px-0 md:pb-0 md:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
          className="pointer-events-auto w-full md:w-[380px]"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/60 p-6 space-y-5">
            {/* Header */}
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900" data-testid="text-hero-title">
                Where are you traveling?
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Select your passport and explore visa requirements worldwide
              </p>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Your Passport</label>
                <Select value={passport} onValueChange={setPassport}>
                  <SelectTrigger className="w-full bg-slate-50 border-slate-200 focus:ring-emerald-500 focus:border-emerald-500" data-testid="select-passport">
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

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Destination</label>
                <Select 
                  value={destination ?? ""} 
                  onValueChange={(val) => {
                    setDestination(val);
                    setValidationError(null);
                  }}
                >
                  <SelectTrigger 
                    className={`w-full bg-slate-50 border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 ${validationError ? "ring-2 ring-red-500 border-red-500" : ""}`} 
                    data-testid="select-destination"
                  >
                    <SelectValue placeholder="Click map or select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinationOptions.map((opt) => (
                      <SelectItem key={opt.code} value={opt.code}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationError}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-1">
              <Button 
                className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 text-white" 
                size="lg"
                onClick={handleCheckRequirements}
                data-testid="button-check-requirements"
              >
                Check Requirements
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Link 
                href="/advisories" 
                className="text-sm text-slate-500 inline-flex items-center justify-center gap-1 hover:text-slate-700 transition-colors" 
                data-testid="link-advisories"
              >
                View travel advisories
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Trust Badge */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <Shield className="w-3.5 h-3.5" />
                <span>Data verified against official sources</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Slide-out Country Panel */}
      <AnimatePresence>
        {selectedCountry && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-md border-l border-slate-200 overflow-y-auto z-30"
          >
            <div className="p-5 pt-20">
              <div className="flex items-center justify-between gap-2 mb-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {countryNames[selectedCountry] || selectedCountry}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Entry requirements for {selectedPassportName} citizens</p>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-slate-400 hover:text-slate-600"
                  onClick={closePanel}
                  data-testid="button-close-panel"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {assessMutation.isPending && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
                </div>
              )}

              {assessResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
                          <Plane className="w-4 h-4 text-emerald-500" />
                          Entry Requirements
                        </CardTitle>
                        {assessResult.actions && assessResult.actions.length > 0 && 
                         ["VISA", "EVISA", "ETA"].includes(assessResult.entryType) ? (
                          <Button
                            size="sm"
                            className="gap-1 text-xs h-7 px-2 bg-emerald-500 hover:bg-emerald-600"
                            asChild
                            data-testid="button-apply-visa"
                          >
                            <a href={assessResult.actions[0].url} target="_blank" rel="noopener noreferrer">
                              {assessResult.entryType === "ETA" ? "Apply for ETA" : "Apply for Visa"}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                        ) : (
                          <Badge 
                            variant={assessResult.required ? "destructive" : "secondary"}
                            className={!assessResult.required ? "bg-emerald-100 text-emerald-700" : ""}
                          >
                            {assessResult.entryType}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium text-slate-900 mb-1">{assessResult.headline}</p>
                      {assessResult.details && (
                        <p className="text-sm text-slate-500">{assessResult.details}</p>
                      )}
                    </CardContent>
                  </Card>

                  {(assessResult.maxStayDays > 0 || assessResult.processingTime) && (
                    <Card className="border-slate-200 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
                          <Clock className="w-4 h-4 text-emerald-500" />
                          Timing
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {assessResult.maxStayDays > 0 && (
                          <div className="flex justify-between gap-2 text-sm">
                            <span className="text-slate-500">Allowed Stay</span>
                            <span className="text-slate-900 font-medium">Up to {assessResult.maxStayDays} days</span>
                          </div>
                        )}
                        {assessResult.processingTime && (
                          <div className="flex justify-between gap-2 text-sm">
                            <span className="text-slate-500">Processing Time</span>
                            <span className="text-slate-900 font-medium">{assessResult.processingTime}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {assessResult.fee && (
                    <Card className="border-slate-200 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-700">Fee</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-900 font-medium">
                          {assessResult.fee.currency} {assessResult.fee.amount}
                          {assessResult.fee.reimbursable && (
                            <span className="text-emerald-600 ml-2 font-normal">(Reimbursable)</span>
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {assessResult.reason && (
                    <Card className="border-slate-200 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
                          <FileText className="w-4 h-4 text-emerald-500" />
                          Policy Basis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-500">{assessResult.reason}</p>
                      </CardContent>
                    </Card>
                  )}

                  <Button 
                    className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" 
                    onClick={handleCheckRequirements}
                    data-testid="button-full-assessment"
                  >
                    View Full Assessment
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {assessMutation.isError && (
                <div className="text-center py-8 text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>Could not load requirements for this destination.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Attribution */}
      <div className="absolute bottom-3 right-3 z-10">
        <p className="text-[10px] text-slate-400 bg-white/60 backdrop-blur-sm px-2 py-1 rounded">
          Built for Carta · Visa data updated daily
        </p>
      </div>
    </div>
  );
}
