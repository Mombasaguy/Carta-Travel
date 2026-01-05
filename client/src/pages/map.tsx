import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Map, { Source, Layer, type MapMouseEvent } from "react-map-gl/mapbox";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plane, FileText, Clock, AlertCircle, MapPin, ChevronRight, ExternalLink, PanelRightOpen, PanelRightClose } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import "mapbox-gl/dist/mapbox-gl.css";

const topDestinations = [
  { code: "US", name: "United States", region: "North America" },
  { code: "GB", name: "United Kingdom", region: "Europe" },
  { code: "DE", name: "Germany", region: "Europe" },
  { code: "FR", name: "France", region: "Europe" },
  { code: "CA", name: "Canada", region: "North America" },
  { code: "AE", name: "United Arab Emirates", region: "Middle East" },
  { code: "SG", name: "Singapore", region: "Asia" },
  { code: "JP", name: "Japan", region: "Asia" },
  { code: "AU", name: "Australia", region: "Oceania" },
  { code: "CH", name: "Switzerland", region: "Europe" },
];

type MapColor = "green" | "yellow" | "orange" | "red" | "gray";

interface MapColorResponse {
  passport: string;
  generatedAt: string;
  colorsByIso2: Record<string, MapColor>;
  legend: Record<MapColor, string>;
}

// ISO2 to ISO3 mapping for converting between country code formats
const iso2ToIso3: Record<string, string> = {
  US: "USA", GB: "GBR", DE: "DEU", FR: "FRA", CA: "CAN", AU: "AUS",
  JP: "JPN", CN: "CHN", IN: "IND", BR: "BRA", MX: "MEX", IT: "ITA",
  ES: "ESP", NL: "NLD", CH: "CHE", SE: "SWE", NO: "NOR", DK: "DNK",
  FI: "FIN", BE: "BEL", AT: "AUT", IE: "IRL", PT: "PRT", PL: "POL",
  CZ: "CZE", HU: "HUN", RO: "ROU", BG: "BGR", HR: "HRV", SK: "SVK",
  SI: "SVN", EE: "EST", LV: "LVA", LT: "LTU", GR: "GRC", CY: "CYP",
  MT: "MLT", LU: "LUX", IS: "ISL", NZ: "NZL", SG: "SGP", HK: "HKG",
  KR: "KOR", TW: "TWN", MY: "MYS", TH: "THA", VN: "VNM", PH: "PHL",
  ID: "IDN", AE: "ARE", SA: "SAU", IL: "ISR", TR: "TUR", ZA: "ZAF",
  EG: "EGY", NG: "NGA", KE: "KEN", MA: "MAR", AR: "ARG", CL: "CHL",
  CO: "COL", PE: "PER", VE: "VEN", RU: "RUS", UA: "UKR", QA: "QAT",
  KW: "KWT", BH: "BHR", OM: "OMN", JO: "JOR", LB: "LBN", PK: "PAK",
  BD: "BGD", LK: "LKA", NP: "NPL", MM: "MMR", KH: "KHM", LA: "LAO",
};

// Reverse mapping: ISO3 to ISO2
const iso3ToIso2: Record<string, string> = Object.fromEntries(
  Object.entries(iso2ToIso3).map(([iso2, iso3]) => [iso3, iso2])
);

// Country name to ISO2 mapping for fallback when ISO codes are missing (-99)
const nameToIso2: Record<string, string> = {
  "France": "FR",
  "Norway": "NO",
  "United States of America": "US",
  "United States": "US",
  "United Kingdom": "GB",
  "Germany": "DE",
  "Canada": "CA",
  "Australia": "AU",
  "Japan": "JP",
  "China": "CN",
  "India": "IN",
  "Brazil": "BR",
  "Mexico": "MX",
  "Italy": "IT",
  "Spain": "ES",
  "Netherlands": "NL",
  "Switzerland": "CH",
  "Sweden": "SE",
  "Denmark": "DK",
  "Finland": "FI",
  "Belgium": "BE",
  "Austria": "AT",
  "Ireland": "IE",
  "Portugal": "PT",
  "Poland": "PL",
  "Czech Republic": "CZ",
  "Czechia": "CZ",
  "Hungary": "HU",
  "Romania": "RO",
  "Bulgaria": "BG",
  "Croatia": "HR",
  "Slovakia": "SK",
  "Slovenia": "SI",
  "Estonia": "EE",
  "Latvia": "LV",
  "Lithuania": "LT",
  "Greece": "GR",
  "Cyprus": "CY",
  "Malta": "MT",
  "Luxembourg": "LU",
  "Iceland": "IS",
  "New Zealand": "NZ",
  "Singapore": "SG",
  "Hong Kong": "HK",
  "South Korea": "KR",
  "Republic of Korea": "KR",
  "Korea": "KR",
  "Taiwan": "TW",
  "Thailand": "TH",
  "Vietnam": "VN",
  "Viet Nam": "VN",
  "Philippines": "PH",
  "Indonesia": "ID",
  "Malaysia": "MY",
  "United Arab Emirates": "AE",
  "Saudi Arabia": "SA",
  "Israel": "IL",
  "Turkey": "TR",
  "South Africa": "ZA",
  "Egypt": "EG",
  "Nigeria": "NG",
  "Kenya": "KE",
  "Morocco": "MA",
  "Argentina": "AR",
  "Chile": "CL",
  "Colombia": "CO",
  "Peru": "PE",
  "Venezuela": "VE",
  "Russia": "RU",
  "Russian Federation": "RU",
  "Ukraine": "UA",
  "Qatar": "QA",
  "Kuwait": "KW",
  "Bahrain": "BH",
  "Oman": "OM",
  "Jordan": "JO",
  "Lebanon": "LB",
  "Pakistan": "PK",
  "Bangladesh": "BD",
  "Sri Lanka": "LK",
  "Nepal": "NP",
  "Myanmar": "MM",
  "Cambodia": "KH",
  "Laos": "LA",
  "Lao PDR": "LA",
  "Serbia": "RS",
  "Kosovo": "XK",
  "Montenegro": "ME",
  "Bosnia and Herzegovina": "BA",
  "North Macedonia": "MK",
  "Macedonia": "MK",
  "Albania": "AL",
  "Moldova": "MD",
  "Belarus": "BY",
  "Georgia": "GE",
  "Armenia": "AM",
  "Azerbaijan": "AZ",
};

interface AssessResult {
  entryType: string;
  required: boolean;
  headline: string;
  details: string | null;
  reason: string | null;
  maxStayDays: number;
  fee: { amount: number; currency: string; reimbursable: boolean } | null;
  processingTime: string | null;
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
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "CV", name: "Cabo Verde" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoros" },
  { code: "CG", name: "Congo" },
  { code: "CD", name: "Congo (DRC)" },
  { code: "CR", name: "Costa Rica" },
  { code: "CI", name: "Cote d'Ivoire" },
  { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "SZ", name: "Eswatini" },
  { code: "ET", name: "Ethiopia" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "GD", name: "Grenada" },
  { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "HN", name: "Honduras" },
  { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" },
  { code: "KP", name: "Korea (North)" },
  { code: "KR", name: "Korea (South)" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MH", name: "Marshall Islands" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "MX", name: "Mexico" },
  { code: "FM", name: "Micronesia" },
  { code: "MD", name: "Moldova" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "MK", name: "North Macedonia" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palau" },
  { code: "PS", name: "Palestine" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" },
  { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" },
  { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" },
  { code: "ST", name: "Sao Tome and Principe" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" },
  { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" },
  { code: "TW", name: "Taiwan" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" },
  { code: "TV", name: "Tuvalu" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VA", name: "Vatican City" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
];

export default function MapPage() {
  const [passport, setPassport] = useState("US");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [assessResult, setAssessResult] = useState<AssessResult | null>(null);
  const [showPanel, setShowPanel] = useState(false);

  const { data: configData, isLoading: configLoading } = useQuery<{ token: string }>({
    queryKey: ["/api/config/mapbox"],
  });

  const mapboxToken = configData?.token;

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
    const props = feature?.properties;
    // Try multiple property names - different GeoJSON sources use different conventions
    // Some use -99 for countries with complex territories (like France)
    let countryCode = props?.["ISO3166-1-Alpha-2"];
    // Fallback: try ISO_A2 (common in Natural Earth data)
    if (!countryCode || countryCode === "-99") {
      countryCode = props?.["ISO_A2"];
    }
    // Fallback: derive from ISO_A3 if available
    if (!countryCode || countryCode === "-99") {
      const iso3 = props?.["ISO3166-1-Alpha-3"] || props?.["ISO_A3"];
      if (iso3 && iso3ToIso2[iso3]) {
        countryCode = iso3ToIso2[iso3];
      }
    }
    // Final fallback: try to match by country name
    if (!countryCode || countryCode === "-99") {
      const name = props?.["ADMIN"] || props?.["name"];
      if (name && nameToIso2[name]) {
        countryCode = nameToIso2[name];
      }
    }
    if (countryCode && countryCode !== "-99") {
      setSelectedCountry(countryCode);
      setAssessResult(null);
      assessMutation.mutate(countryCode);
    }
  }, [assessMutation, passport]);

  const closePanel = () => {
    setSelectedCountry(null);
    setAssessResult(null);
    setShowPanel(false);
  };

  // Use ISO2 colors directly from API (Mapbox uses iso_3166_1_alpha_2)
  const colorsByIso2 = mapData?.colorsByIso2 ?? {};

  // GeoJSON uses "ISO3166-1-Alpha-2" for 2-letter country codes
  const fillColorExpression = [
    "match",
    ["get", "ISO3166-1-Alpha-2"],
    ...Object.entries(colorsByIso2).flatMap(([code, color]) => [
      code,
      colorMap[color],
    ]),
    "#d1d5db",
  ] as unknown as string;

  if (configLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        <p className="text-muted-foreground mt-4">Loading map...</p>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-semibold mb-2">Mapbox Token Required</h1>
        <p className="text-muted-foreground">
          Please configure the MAPBOX_PUBLIC_KEY secret to enable the map.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-8rem)]">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-md p-2 border">
        <label className="text-sm font-medium whitespace-nowrap">Your Passport:</label>
        <Select value={passport} onValueChange={setPassport}>
          <SelectTrigger className="w-44 bg-background" data-testid="select-passport">
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

      <Button
        size="icon"
        variant="secondary"
        className="absolute top-4 right-4 z-20 md:hidden"
        onClick={() => setShowPanel(!showPanel)}
        data-testid="button-toggle-panel"
      >
        {showPanel ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
      </Button>

      <AnimatePresence>
        {(showPanel || selectedCountry) && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 h-full w-72 md:w-80 bg-background/95 backdrop-blur-sm border-l overflow-y-auto z-10"
          >
            <AnimatePresence mode="wait">
              {!selectedCountry ? (
                <motion.div
                  key="destinations"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4"
                >
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-semibold">Top Destinations</h2>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="md:hidden"
                      onClick={() => setShowPanel(false)}
                      data-testid="button-close-destinations"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Popular business travel destinations. Click to see requirements for your passport.
                  </p>
                  <div className="space-y-1">
                    {topDestinations.map((dest) => {
                      const color = colorsByIso2[dest.code];
                      return (
                        <button
                          key={dest.code}
                          onClick={() => {
                            setSelectedCountry(dest.code);
                            setAssessResult(null);
                            assessMutation.mutate(dest.code);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-md hover-elevate text-left group"
                          data-testid={`button-destination-${dest.code}`}
                        >
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color ? colorMap[color] : "#d1d5db" }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{dest.name}</div>
                            <div className="text-xs text-muted-foreground">{dest.region}</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
            <motion.div
              key="assessment"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="p-4"
            >
              <div className="flex items-center justify-between gap-2 mb-4">
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
                        {assessResult.actions && assessResult.actions.length > 0 && 
                         ["VISA", "EVISA", "ETA"].includes(assessResult.entryType) ? (
                          <Button
                            size="sm"
                            className="gap-1 text-xs h-7 px-2"
                            asChild
                            data-testid="button-apply-visa"
                          >
                            <a href={assessResult.actions[0].url} target="_blank" rel="noopener noreferrer">
                              {assessResult.entryType === "ETA" ? "Apply for ETA" : "Apply for Visa"}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                        ) : (
                          <Badge variant={assessResult.required ? "destructive" : "secondary"}>
                            {assessResult.entryType}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium mb-1">{assessResult.headline}</p>
                      {assessResult.details && (
                        <p className="text-sm text-muted-foreground">{assessResult.details}</p>
                      )}
                    </CardContent>
                  </Card>

                  {(assessResult.maxStayDays > 0 || assessResult.processingTime) && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Timing
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {assessResult.maxStayDays > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Allowed Stay</span>
                            <span>Up to {assessResult.maxStayDays} days</span>
                          </div>
                        )}
                        {assessResult.processingTime && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Processing Time</span>
                            <span>{assessResult.processingTime}</span>
                          </div>
                        )}
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
                      {assessResult.actions.map((action, i) => {
                        const isApplyAction = action.label.toLowerCase().includes("apply");
                        return (
                          <Button
                            key={i}
                            variant={isApplyAction ? "default" : "outline"}
                            className="w-full"
                            asChild
                            data-testid={`button-action-${i}`}
                          >
                            <a href={action.url} target="_blank" rel="noopener noreferrer">
                              {isApplyAction ? "Apply for Visa" : action.label}
                            </a>
                          </Button>
                        );
                      })}
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
            </motion.div>
          )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
