import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Map, { Source, Layer, type MapMouseEvent } from "react-map-gl/mapbox";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Info, AlertCircle, ChevronUp, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import "mapbox-gl/dist/mapbox-gl.css";

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

export default function HomePage() {
  const [, navigate] = useLocation();
  const [passport, setPassport] = useState("US");
  const [destination, setDestination] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

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

  const handleCountryClick = useCallback((e: MapMouseEvent) => {
    const features = e.features;
    if (!features || features.length === 0) {
      return;
    }
    const countryFeature = features.find(f => f.layer?.id === "country-fills");
    if (!countryFeature) {
      return;
    }
    const props = countryFeature.properties;
    if (!props) {
      return;
    }
    let countryCode = props["ISO3166-1-Alpha-2"];
    if (!countryCode || countryCode === "-99") {
      countryCode = props["ISO_A2"];
    }
    if (!countryCode || countryCode === "-99") {
      const iso3 = props["ISO3166-1-Alpha-3"] || props["ISO_A3"];
      if (iso3 && iso3ToIso2[iso3]) {
        countryCode = iso3ToIso2[iso3];
      }
    }
    if (!countryCode || countryCode === "-99") {
      const name = props["ADMIN"] || props["name"];
      if (name && nameToIso2[name]) {
        countryCode = nameToIso2[name];
      }
    }
    if (countryCode && countryCode !== "-99" && countryNames[countryCode]) {
      setDestination(countryCode);
      setValidationError(null);
    }
  }, []);

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
    ...Object.entries(colorsByIso2).flatMap(([code, color]) => [
      code,
      colorMap[color],
    ]),
    "#d1d5db",
  ] as unknown as string;

  return (
    <div className="relative h-[calc(100vh-3.5rem)] overflow-hidden bg-background">
      {configLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : !mapboxToken ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-semibold mb-2">Map Configuration Required</h1>
            <p className="text-muted-foreground">Please configure the Mapbox token.</p>
          </div>
        </div>
      ) : (
        <Map
          mapboxAccessToken={mapboxToken}
          initialViewState={{
            longitude: 0,
            latitude: 20,
            zoom: 1.2,
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
                "fill-opacity": 0.7,
              }}
            />
            <Layer
              id="country-borders"
              type="line"
              paint={{
                "line-color": "#374151",
                "line-width": 0.8,
              }}
            />
          </Source>
        </Map>
      )}

      <AnimatePresence>
        {showLegend && mapData?.legend && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 left-4 z-20 bg-background/95 backdrop-blur-sm rounded-md p-3 border shadow-md"
          >
            <div className="text-xs font-medium mb-2">Visa Requirements</div>
            <div className="flex flex-col gap-1">
              {Object.entries(mapData.legend).map(([color, label]) => (
                <div key={color} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: colorMap[color as MapColor] }} 
                  />
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant="ghost"
        size="sm"
        className="absolute bottom-4 left-4 z-20 bg-background/90 backdrop-blur-sm text-xs gap-1"
        onClick={() => setShowLegend(!showLegend)}
        data-testid="button-toggle-legend"
      >
        <Info className="w-3 h-3" />
        Visa legend
        {showLegend ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
      </Button>

      <div className="absolute inset-x-0 bottom-0 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-8 lg:left-16 md:right-auto pointer-events-none px-4 pb-6 md:px-0 md:pb-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
          className="pointer-events-auto w-full md:w-96"
        >
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground drop-shadow-sm" data-testid="text-hero-title">
                Where are you traveling?
              </h1>
              <p className="text-sm text-muted-foreground mt-2 drop-shadow-sm">
                Click the map or select a destination below
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap w-20">Passport</span>
                <Select value={passport} onValueChange={setPassport}>
                  <SelectTrigger className="flex-1 bg-background/80 backdrop-blur-sm border-0 shadow-sm" data-testid="select-passport">
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

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap w-20">Destination</span>
                <Select 
                  value={destination ?? ""} 
                  onValueChange={(val) => {
                    setDestination(val);
                    setValidationError(null);
                  }}
                >
                  <SelectTrigger 
                    className={`flex-1 bg-background/80 backdrop-blur-sm border-0 shadow-sm ${validationError ? "ring-2 ring-destructive" : ""}`} 
                    data-testid="select-destination"
                  >
                    <SelectValue placeholder="Click map or select" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinationOptions.map((opt) => (
                      <SelectItem key={opt.code} value={opt.code}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {validationError && (
                <p className="text-xs text-destructive pl-22">{validationError}</p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                className="w-full gap-2 shadow-lg" 
                size="lg"
                onClick={handleCheckRequirements}
                data-testid="button-check-requirements"
              >
                Check requirements
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Link 
                href="/advisories" 
                className="text-sm text-muted-foreground inline-flex items-center justify-center gap-1 hover:text-foreground transition-colors" 
                data-testid="link-advisories"
              >
                View travel advisories
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
