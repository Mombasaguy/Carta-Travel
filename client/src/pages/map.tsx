import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Map, { Source, Layer, type MapMouseEvent, type MapRef } from "react-map-gl/mapbox";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plane, FileText, Clock, AlertCircle, ChevronRight, ExternalLink, FileSignature, Download, Globe } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import cartaLogo from "@assets/image_1767998973366.png";
import "mapbox-gl/dist/mapbox-gl.css";

const LETTER_SUPPORTED_COUNTRIES = ["US", "GB", "CA", "BR", "DE", "JP"];

type MapColor = "green" | "yellow" | "orange" | "red" | "gray";

interface MapColorResponse {
  passport: string;
  generatedAt: string;
  colorsByIso2: Record<string, MapColor>;
  legend: Record<MapColor, string>;
}

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

const iso3ToIso2: Record<string, string> = Object.fromEntries(
  Object.entries(iso2ToIso3).map(([iso2, iso3]) => [iso3, iso2])
);

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
  green: "#66BB6A",
  yellow: "#FFD54F",
  orange: "#FFB74D",
  red: "#E57373",
  gray: "#9E9E9E",
};

const countryCentroids: Record<string, [number, number]> = {
  US: [-98.5, 39.5], GB: [-2, 54], DE: [10.5, 51], FR: [2.5, 46.5], CA: [-106, 56],
  AU: [134, -25], JP: [138, 36], CN: [105, 35], IN: [78, 22], BR: [-53, -10],
  MX: [-102, 23], IT: [12.5, 42.5], ES: [-3.5, 40], NL: [5.5, 52], CH: [8, 47],
  SE: [18, 62], NO: [10, 62], DK: [10, 56], FI: [26, 64], BE: [4.5, 50.5],
  AT: [14, 47.5], IE: [-8, 53], PT: [-8, 39.5], PL: [19, 52], CZ: [15, 49.5],
  HU: [19.5, 47], RO: [25, 46], BG: [25, 42.5], HR: [16, 45.5], SK: [19.5, 48.5],
  SI: [14.5, 46], EE: [25, 59], LV: [24.5, 57], LT: [24, 55.5], GR: [22, 39],
  CY: [33, 35], MT: [14.5, 35.9], LU: [6, 49.8], IS: [-18, 65], NZ: [174, -41],
  SG: [103.8, 1.35], HK: [114.15, 22.25], KR: [127.5, 36], TW: [121, 24],
  TH: [101, 15], MY: [102, 4], ID: [120, -2], PH: [122, 12], VN: [108, 16],
  AE: [54, 24], SA: [45, 24], IL: [35, 31.5], TR: [35, 39], ZA: [-25, 29],
  EG: [30, 27], NG: [8, 10], KE: [38, 1], AR: [-64, -34], CL: [-71, -33],
  CO: [-74, 4], PE: [-76, -10], RU: [100, 60], UA: [32, 49], QA: [51.5, 25.5],
  KW: [47.5, 29.5], BH: [50.5, 26], OM: [57, 21], JO: [36, 31], LB: [35.8, 33.9],
  PK: [69, 30], BD: [90, 24], LK: [81, 8], NP: [84, 28], MM: [96, 21],
  KH: [105, 13], LA: [103, 18],
};

function generateFlightArc(start: [number, number], end: [number, number], numPoints = 50): GeoJSON.Feature<GeoJSON.LineString> {
  const [startLng, startLat] = start;
  const [endLng, endLat] = end;
  
  const coordinates: [number, number][] = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lng = startLng + t * (endLng - startLng);
    const lat = startLat + t * (endLat - startLat);
    const arcHeight = Math.sin(t * Math.PI) * Math.min(30, Math.abs(endLng - startLng) * 0.15);
    coordinates.push([lng, lat + arcHeight]);
  }
  
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates,
    },
  };
}

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

const destinationOptions = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "CH", name: "Switzerland" },
  { code: "NL", name: "Netherlands" },
  { code: "IE", name: "Ireland" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "SE", name: "Sweden" },
  { code: "DK", name: "Denmark" },
  { code: "NO", name: "Norway" },
  { code: "FI", name: "Finland" },
  { code: "BE", name: "Belgium" },
  { code: "AT", name: "Austria" },
  { code: "PT", name: "Portugal" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "HU", name: "Hungary" },
  { code: "GR", name: "Greece" },
  { code: "NZ", name: "New Zealand" },
  { code: "HK", name: "Hong Kong" },
  { code: "KR", name: "South Korea" },
  { code: "TW", name: "Taiwan" },
  { code: "TH", name: "Thailand" },
  { code: "MY", name: "Malaysia" },
  { code: "ID", name: "Indonesia" },
  { code: "PH", name: "Philippines" },
  { code: "VN", name: "Vietnam" },
  { code: "IN", name: "India" },
  { code: "CN", name: "China" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "IL", name: "Israel" },
  { code: "TR", name: "Turkey" },
  { code: "ZA", name: "South Africa" },
  { code: "EG", name: "Egypt" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "PE", name: "Peru" },
];

export default function MapPage() {
  const [passport, setPassport] = useState("US");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [assessResult, setAssessResult] = useState<AssessResult | null>(null);
  const [letterOpen, setLetterOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [userInteracting, setUserInteracting] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mergeData, setMergeData] = useState({
    FULL_NAME: "",
    EMPLOYEE_EMAIL: "",
    EMPLOYEE_TITLE: "",
  });

  const handleInteractionStart = () => {
    setUserInteracting(true);
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
  };

  const handleInteractionEnd = () => {
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = setTimeout(() => {
      setUserInteracting(false);
    }, 5000);
  };

  useEffect(() => {
    if (!mapRef.current || isHovering || userInteracting) return;
    
    const map = mapRef.current.getMap();
    let animationFrame: number;
    
    const rotate = () => {
      if (isHovering || userInteracting) return;
      const center = map.getCenter();
      map.setCenter({ lng: center.lng + 0.03, lat: center.lat });
      animationFrame = requestAnimationFrame(rotate);
    };
    
    animationFrame = requestAnimationFrame(rotate);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isHovering, userInteracting]);

  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  const handleDownloadLetter = async () => {
    if (!selectedCountry) return;
    
    setIsDownloading(true);
    try {
      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      
      const today = new Date();
      const returnDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
      
      const response = await fetch("/api/letters/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedCountry,
          merge: {
            FULL_NAME: mergeData.FULL_NAME || "Employee Name",
            EMPLOYEE_EMAIL: mergeData.EMPLOYEE_EMAIL || "employee@carta.com",
            EMPLOYEE_TITLE: mergeData.EMPLOYEE_TITLE || "Team Member",
            CITIZENSHIP: passport,
            DEPARTURE_DATE: today.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long", 
              day: "numeric"
            }),
            RETURN_DATE: returnDate.toLocaleDateString("en-US", {
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
        a.download = `Carta_Invitation_Letter_${selectedCountry}.docx`;
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
            destinationCountry: selectedCountry,
            citizenship: passport,
            departureDate: today.toISOString().split("T")[0],
            returnDate: returnDate.toISOString().split("T")[0],
            purpose: "BUSINESS",
            template: selectedCountry
          })
        });
        
        const data = await fallbackResponse.json();
        const textBlob = new Blob([data.content], { type: "text/plain" });
        const url = URL.createObjectURL(textBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invitation_letter_${selectedCountry}.txt`;
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
    let countryCode = props?.["ISO3166-1-Alpha-2"];
    if (!countryCode || countryCode === "-99") {
      countryCode = props?.["ISO_A2"];
    }
    if (!countryCode || countryCode === "-99") {
      const iso3 = props?.["ISO3166-1-Alpha-3"] || props?.["ISO_A3"];
      if (iso3 && iso3ToIso2[iso3]) {
        countryCode = iso3ToIso2[iso3];
      }
    }
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

  const handleDestinationSelect = (code: string) => {
    if (code) {
      setSelectedCountry(code);
      setAssessResult(null);
      assessMutation.mutate(code);
    }
  };

  const closePanel = () => {
    setSelectedCountry(null);
    setAssessResult(null);
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

  const passportName = passportOptions.find(p => p.code === passport)?.name || passport;

  if (configLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground mt-4">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-semibold mb-2">Mapbox Token Required</h1>
          <p className="text-muted-foreground">
            Please configure the MAPBOX_PUBLIC_KEY secret to enable the map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="flex flex-col items-center pt-4 pb-2">
          <Link href="/" className="flex flex-col items-center hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2">
              <img 
                src={cartaLogo} 
                alt="Carta" 
                className="h-7 w-auto"
              />
              <h1 className="text-xl font-semibold text-gray-900">
                Travel
              </h1>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5">
              Global Mobility Platform
            </p>
          </Link>
          <p className="text-sm text-gray-600 mt-2">
            Select your passport to view visa requirements worldwide
          </p>
        </div>
      </div>

      <div className="absolute top-24 left-4 z-20 flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-3 w-48">
          <label className="text-[10px] uppercase tracking-wider text-gray-500 font-medium block mb-1.5">
            Your Passport
          </label>
          <Select value={passport} onValueChange={setPassport}>
            <SelectTrigger className="h-9 text-sm border-gray-200" data-testid="select-passport">
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

        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-3 w-48">
          <label className="text-[10px] uppercase tracking-wider text-gray-500 font-medium block mb-1.5">
            Destination
          </label>
          <Select value={selectedCountry || ""} onValueChange={handleDestinationSelect}>
            <SelectTrigger className="h-9 text-sm border-gray-200" data-testid="select-destination">
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
      </div>

      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: 0,
          latitude: 20,
          zoom: 1.8,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        projection={{ name: "globe" }}
        interactiveLayerIds={["country-fills"]}
        onClick={handleCountryClick}
        onDragStart={handleInteractionStart}
        onDragEnd={handleInteractionEnd}
        onZoomStart={handleInteractionStart}
        onZoomEnd={handleInteractionEnd}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setHoveredCountry(null);
        }}
        onMouseMove={(e) => {
          const feature = e.features?.[0];
          if (feature) {
            const props = feature.properties;
            let countryCode = props?.["ISO3166-1-Alpha-2"];
            if (!countryCode || countryCode === "-99") {
              countryCode = props?.["ISO_A2"];
            }
            if (!countryCode || countryCode === "-99") {
              const iso3 = props?.["ISO3166-1-Alpha-3"] || props?.["ISO_A3"];
              if (iso3 && iso3ToIso2[iso3]) {
                countryCode = iso3ToIso2[iso3];
              }
            }
            if (!countryCode || countryCode === "-99") {
              const name = props?.["ADMIN"] || props?.["name"];
              if (name && nameToIso2[name]) {
                countryCode = nameToIso2[name];
              }
            }
            if (countryCode && countryCode !== "-99" && countryCode !== passport) {
              setHoveredCountry(countryCode);
            } else {
              setHoveredCountry(null);
            }
          } else {
            setHoveredCountry(null);
          }
        }}
        cursor="pointer"
        fog={{
          color: "rgb(252, 253, 255)",
          "high-color": "rgb(50, 176, 160)",
          "horizon-blend": 0.04,
          "space-color": "rgb(248, 250, 252)",
          "star-intensity": 0
        }}
        onLoad={(e) => {
          const map = e.target;
          const labelLayers = ['country-label', 'state-label', 'settlement-label', 'settlement-major-label', 'settlement-minor-label'];
          labelLayers.forEach(layerId => {
            if (map.getLayer(layerId)) {
              map.setPaintProperty(layerId, 'text-halo-color', '#ffffff');
              map.setPaintProperty(layerId, 'text-halo-width', 2);
              map.setPaintProperty(layerId, 'text-halo-blur', 0);
              map.setPaintProperty(layerId, 'text-color', '#2d3748');
              map.setLayoutProperty(layerId, 'text-allow-overlap', false);
              map.setLayoutProperty(layerId, 'text-ignore-placement', false);
              map.setLayoutProperty(layerId, 'text-padding', 3);
              map.setLayoutProperty(layerId, 'text-optional', true);
              map.setLayoutProperty(layerId, 'text-size', [
                'interpolate', ['linear'], ['zoom'],
                1, 8,
                3, 10,
                5, 12,
                8, 14
              ]);
            }
          });
        }}
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
              "fill-color": mapLoading ? "#e5e7eb" : fillColorExpression,
              "fill-opacity": 0.85,
            }}
          />
          <Layer
            id="country-borders"
            type="line"
            paint={{
              "line-color": "#ffffff",
              "line-width": 0.5,
              "line-opacity": 0.8,
            }}
          />
        </Source>
        
        {hoveredCountry && countryCentroids[passport] && countryCentroids[hoveredCountry] && (
          <Source
            key={`flight-arc-${passport}-${hoveredCountry}`}
            id={`flight-arc-${hoveredCountry}`}
            type="geojson"
            data={generateFlightArc(countryCentroids[passport], countryCentroids[hoveredCountry])}
          >
            <Layer
              id={`flight-arc-glow-${hoveredCountry}`}
              type="line"
              beforeId="country-fills"
              paint={{
                "line-color": "#32B0A0",
                "line-width": 6,
                "line-opacity": 0.3,
                "line-blur": 3,
              }}
            />
            <Layer
              id={`flight-arc-line-${hoveredCountry}`}
              type="line"
              beforeId="country-fills"
              paint={{
                "line-color": "#32B0A0",
                "line-width": 2,
                "line-opacity": 0.9,
              }}
            />
            <Layer
              id={`flight-arc-dash-${hoveredCountry}`}
              type="line"
              beforeId="country-fills"
              paint={{
                "line-color": "#ffffff",
                "line-width": 2,
                "line-dasharray": [0, 2, 2],
                "line-opacity": 0.8,
              }}
            />
          </Source>
        )}
      </Map>

      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-gray-200/50 px-6 py-3">
          <div className="flex items-center gap-6">
            {mapData?.legend && Object.entries(mapData.legend).map(([color, label]) => (
              <div key={color} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: colorMap[color as MapColor] }} 
                />
                <span className="text-gray-600 whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <p className="text-xs text-gray-400">
          Built for <span className="text-emerald-600 font-medium">Carta</span> · Visa data updated daily
        </p>
      </div>

      <AnimatePresence>
        {selectedCountry && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 md:w-[360px] bg-white shadow-2xl border-l border-gray-200 overflow-y-auto z-30"
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {countryNameMap[selectedCountry] || selectedCountry}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Entry requirements for {passportName} citizens
                  </p>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="flex-shrink-0 -mt-1 -mr-2"
                  onClick={closePanel}
                  data-testid="button-close-panel"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {assessMutation.isPending && (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                </div>
              )}

              {assessResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Card className="border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Plane className="w-4 h-4 text-emerald-600" />
                          Entry Requirements
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={assessResult.required ? "destructive" : "secondary"}
                            className={!assessResult.required ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}
                          >
                            {assessResult.entryType}
                          </Badge>
                          {assessResult.actions && assessResult.actions.length > 0 && (
                            <a 
                              href={assessResult.actions[0].url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                              data-testid="link-apply-portal"
                            >
                              Apply
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium text-gray-900">{assessResult.headline}</p>
                      {assessResult.details && (
                        <p className="text-sm text-gray-500 mt-1">{assessResult.details}</p>
                      )}
                      {assessResult.actions && assessResult.actions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <a 
                            href={assessResult.actions[0].url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium rounded-lg transition-colors w-full justify-center"
                            data-testid="button-apply-visa-top"
                          >
                            <ExternalLink className="w-4 h-4" />
                            {assessResult.actions[0].label}
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {(assessResult.maxStayDays > 0 || assessResult.processingTime) && (
                    <Card className="border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          Timing
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {assessResult.maxStayDays > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Allowed Stay</span>
                            <span className="font-medium">Up to {assessResult.maxStayDays} days</span>
                          </div>
                        )}
                        {assessResult.processingTime && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Processing Time</span>
                            <span className="font-medium">{assessResult.processingTime}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {assessResult.fee && (
                    <Card className="border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Fee</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          <span className="font-medium">{assessResult.fee.currency} {assessResult.fee.amount}</span>
                          {assessResult.fee.reimbursable && (
                            <span className="text-emerald-600 ml-2">(Reimbursable)</span>
                          )}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {assessResult.reason && (
                    <Card className="border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          Policy Basis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">{assessResult.reason}</p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="pt-2">
                    <Link href={`/assess?passport=${passport}&destination=${selectedCountry}`}>
                      <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg">
                        View Full Requirements
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>

                  {assessResult.actions && assessResult.actions.length > 0 && 
                   ["VISA", "EVISA", "ETA"].includes(assessResult.entryType) && (
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                      data-testid="button-apply-visa"
                    >
                      <a href={assessResult.actions[0].url} target="_blank" rel="noopener noreferrer">
                        {assessResult.entryType === "ETA" ? "Apply for ETA" : "Apply for Visa"}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}

                  {selectedCountry && LETTER_SUPPORTED_COUNTRIES.includes(selectedCountry) && (
                    <Card className="border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileSignature className="w-4 h-4 text-emerald-600" />
                          Invitation Letter
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Official Carta business letter
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-gray-500 mb-3">
                          Present to immigration only if requested.
                        </p>
                        <Sheet open={letterOpen} onOpenChange={setLetterOpen}>
                          <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full" data-testid="button-generate-letter">
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
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="title">Job Title</Label>
                                <Input
                                  id="title"
                                  placeholder="e.g. Software Engineer"
                                  value={mergeData.EMPLOYEE_TITLE}
                                  onChange={(e) => setMergeData({ ...mergeData, EMPLOYEE_TITLE: e.target.value })}
                                />
                              </div>
                            </div>
                            <SheetFooter>
                              <Button
                                onClick={handleDownloadLetter}
                                disabled={isDownloading}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                {isDownloading ? "Generating..." : "Download Letter"}
                              </Button>
                            </SheetFooter>
                          </SheetContent>
                        </Sheet>
                      </CardContent>
                    </Card>
                  )}

                  {assessResult.governance && (
                    <div className="text-xs text-gray-400 border-t border-gray-100 pt-4 mt-4">
                      <p>Data source: {assessResult.dataSource}</p>
                      <p>Status: {assessResult.governance.status}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {assessMutation.isError && (
                <div className="text-center py-12">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">Could not load requirements for this destination.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
