export interface VisaLinkEntry {
  country: string;
  iso2: string;
  officialVisaUrl: string;
  eVisaUrl?: string;
  etaUrl?: string;
  notes?: string;
}

export const curatedVisaLinks: Record<string, VisaLinkEntry> = {
  US: {
    country: "United States",
    iso2: "US",
    officialVisaUrl: "https://travel.state.gov/content/travel/en/us-visas.html",
    eVisaUrl: "https://esta.cbp.dhs.gov/",
    notes: "ESTA for VWP countries, B-1/B-2 visa for others"
  },
  GB: {
    country: "United Kingdom",
    iso2: "GB",
    officialVisaUrl: "https://www.gov.uk/check-uk-visa",
    etaUrl: "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta",
    notes: "ETA required from Jan 2025 for visa-exempt nationals"
  },
  CA: {
    country: "Canada",
    iso2: "CA",
    officialVisaUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html",
    etaUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html",
    notes: "eTA for visa-exempt air travelers"
  },
  AU: {
    country: "Australia",
    iso2: "AU",
    officialVisaUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-finder",
    eVisaUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/evisitor-651",
    etaUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601",
    notes: "ETA or eVisitor depending on nationality"
  },
  NZ: {
    country: "New Zealand",
    iso2: "NZ",
    officialVisaUrl: "https://www.immigration.govt.nz/new-zealand-visas",
    etaUrl: "https://www.immigration.govt.nz/new-zealand-visas/apply-for-a-visa/about-visa/nzeta",
    notes: "NZeTA required for visa waiver countries"
  },
  DE: {
    country: "Germany",
    iso2: "DE",
    officialVisaUrl: "https://www.auswaertiges-amt.de/en/visa-service",
    notes: "Schengen visa for non-EU nationals"
  },
  FR: {
    country: "France",
    iso2: "FR",
    officialVisaUrl: "https://france-visas.gouv.fr/",
    notes: "Schengen visa for non-EU nationals"
  },
  IT: {
    country: "Italy",
    iso2: "IT",
    officialVisaUrl: "https://vistoperitalia.esteri.it/",
    notes: "Schengen visa for non-EU nationals"
  },
  ES: {
    country: "Spain",
    iso2: "ES",
    officialVisaUrl: "https://www.exteriores.gob.es/en/ServiciosAlCiudadano/Paginas/Visados.aspx",
    notes: "Schengen visa for non-EU nationals"
  },
  NL: {
    country: "Netherlands",
    iso2: "NL",
    officialVisaUrl: "https://www.netherlandsworldwide.nl/visa-the-netherlands",
    notes: "Schengen visa for non-EU nationals"
  },
  BE: {
    country: "Belgium",
    iso2: "BE",
    officialVisaUrl: "https://diplomatie.belgium.be/en/services/travel-belgium/visa-belgium",
    notes: "Schengen visa for non-EU nationals"
  },
  CH: {
    country: "Switzerland",
    iso2: "CH",
    officialVisaUrl: "https://www.sem.admin.ch/sem/en/home/themen/einreise.html",
    notes: "Schengen visa for non-EU nationals"
  },
  AT: {
    country: "Austria",
    iso2: "AT",
    officialVisaUrl: "https://www.bmeia.gv.at/en/travel-stay/entry-and-residence-in-austria/",
    notes: "Schengen visa for non-EU nationals"
  },
  JP: {
    country: "Japan",
    iso2: "JP",
    officialVisaUrl: "https://www.mofa.go.jp/j_info/visit/visa/index.html",
    notes: "Visa-free for many nationalities up to 90 days"
  },
  KR: {
    country: "South Korea",
    iso2: "KR",
    officialVisaUrl: "https://www.visa.go.kr/",
    etaUrl: "https://www.k-eta.go.kr/",
    notes: "K-ETA required for visa-exempt travelers"
  },
  CN: {
    country: "China",
    iso2: "CN",
    officialVisaUrl: "https://www.visaforchina.cn/",
    notes: "Visa required for most nationalities"
  },
  IN: {
    country: "India",
    iso2: "IN",
    officialVisaUrl: "https://indianvisaonline.gov.in/",
    eVisaUrl: "https://indianvisaonline.gov.in/evisa/tvoa.html",
    notes: "e-Visa available for many nationalities"
  },
  SG: {
    country: "Singapore",
    iso2: "SG",
    officialVisaUrl: "https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements",
    notes: "Visa-free for many nationalities"
  },
  TH: {
    country: "Thailand",
    iso2: "TH",
    officialVisaUrl: "https://www.mfa.go.th/en/page/visa-and-travel-documents",
    eVisaUrl: "https://www.thaievisa.go.th/",
    notes: "e-Visa and visa on arrival available"
  },
  MY: {
    country: "Malaysia",
    iso2: "MY",
    officialVisaUrl: "https://www.imi.gov.my/index.php/en/main-services/visa/",
    eVisaUrl: "https://malaysiavisa.imi.gov.my/evisa/evisa.jsp",
    notes: "eVisa for eligible nationalities"
  },
  VN: {
    country: "Vietnam",
    iso2: "VN",
    officialVisaUrl: "https://evisa.xuatnhapcanh.gov.vn/",
    eVisaUrl: "https://evisa.xuatnhapcanh.gov.vn/",
    notes: "e-Visa available for most nationalities"
  },
  ID: {
    country: "Indonesia",
    iso2: "ID",
    officialVisaUrl: "https://molina.imigrasi.go.id/",
    eVisaUrl: "https://molina.imigrasi.go.id/",
    notes: "e-VOA available on arrival"
  },
  PH: {
    country: "Philippines",
    iso2: "PH",
    officialVisaUrl: "https://consular.dfa.gov.ph/",
    notes: "Visa-free for many nationalities up to 30 days"
  },
  AE: {
    country: "United Arab Emirates",
    iso2: "AE",
    officialVisaUrl: "https://smartservices.icp.gov.ae/echannels/web/client/default.html",
    notes: "Visa on arrival for many nationalities"
  },
  SA: {
    country: "Saudi Arabia",
    iso2: "SA",
    officialVisaUrl: "https://visa.visitsaudi.com/",
    eVisaUrl: "https://visa.visitsaudi.com/",
    notes: "e-Visa for tourism available"
  },
  QA: {
    country: "Qatar",
    iso2: "QA",
    officialVisaUrl: "https://www.moi.gov.qa/",
    notes: "Visa-free or visa on arrival for many nationalities"
  },
  IL: {
    country: "Israel",
    iso2: "IL",
    officialVisaUrl: "https://www.gov.il/en/departments/topics/visas-for-israel",
    etaUrl: "https://israel-entry.piba.gov.il/",
    notes: "ETA-IL required from certain countries"
  },
  TR: {
    country: "Turkey",
    iso2: "TR",
    officialVisaUrl: "https://www.evisa.gov.tr/",
    eVisaUrl: "https://www.evisa.gov.tr/",
    notes: "e-Visa available for eligible nationalities"
  },
  BR: {
    country: "Brazil",
    iso2: "BR",
    officialVisaUrl: "https://www.gov.br/mre/pt-br/assuntos/portal-consular/vistos",
    eVisaUrl: "https://brazil.vfsevisa.com/",
    notes: "e-Visa required for US, Canada, Australia citizens as of April 2025"
  },
  MX: {
    country: "Mexico",
    iso2: "MX",
    officialVisaUrl: "https://www.gob.mx/sre/acciones-y-programas/visa-para-mexico",
    notes: "Visa-free for many nationalities"
  },
  AR: {
    country: "Argentina",
    iso2: "AR",
    officialVisaUrl: "https://www.argentina.gob.ar/interior/migraciones/visas",
    notes: "Visa-free for many nationalities"
  },
  CL: {
    country: "Chile",
    iso2: "CL",
    officialVisaUrl: "https://www.chile.gob.cl/",
    notes: "Visa-free for many nationalities"
  },
  CO: {
    country: "Colombia",
    iso2: "CO",
    officialVisaUrl: "https://www.cancilleria.gov.co/tramites_servicios/visa",
    notes: "Visa-free for many nationalities up to 90 days"
  },
  ZA: {
    country: "South Africa",
    iso2: "ZA",
    officialVisaUrl: "http://www.dha.gov.za/index.php/immigration-services/types-of-visas",
    notes: "Visa required for many nationalities"
  },
  EG: {
    country: "Egypt",
    iso2: "EG",
    officialVisaUrl: "https://visa2egypt.gov.eg/",
    eVisaUrl: "https://visa2egypt.gov.eg/",
    notes: "e-Visa available"
  },
  KE: {
    country: "Kenya",
    iso2: "KE",
    officialVisaUrl: "https://evisa.go.ke/",
    eVisaUrl: "https://evisa.go.ke/",
    notes: "e-Visa required for most nationalities"
  },
  NG: {
    country: "Nigeria",
    iso2: "NG",
    officialVisaUrl: "https://immigration.gov.ng/",
    notes: "Visa required for most nationalities"
  },
  MA: {
    country: "Morocco",
    iso2: "MA",
    officialVisaUrl: "https://www.consulat.ma/",
    notes: "Visa-free for many nationalities"
  },
  RU: {
    country: "Russia",
    iso2: "RU",
    officialVisaUrl: "https://electronic-visa.kdmid.ru/",
    eVisaUrl: "https://electronic-visa.kdmid.ru/",
    notes: "e-Visa available for some nationalities"
  },
  UA: {
    country: "Ukraine",
    iso2: "UA",
    officialVisaUrl: "https://mfa.gov.ua/en/consular-affairs/entry-and-stay-foreigners-ukraine",
    notes: "Visa-free for many nationalities"
  },
  PL: {
    country: "Poland",
    iso2: "PL",
    officialVisaUrl: "https://www.gov.pl/web/diplomacy/visas",
    notes: "Schengen visa for non-EU nationals"
  },
  CZ: {
    country: "Czechia",
    iso2: "CZ",
    officialVisaUrl: "https://www.mzv.cz/jnp/en/information_for_aliens/index.html",
    notes: "Schengen visa for non-EU nationals"
  },
  HU: {
    country: "Hungary",
    iso2: "HU",
    officialVisaUrl: "https://konzuliszolgalat.kormany.hu/en",
    notes: "Schengen visa for non-EU nationals"
  },
  SE: {
    country: "Sweden",
    iso2: "SE",
    officialVisaUrl: "https://www.migrationsverket.se/English/Private-individuals/Visiting-Sweden.html",
    notes: "Schengen visa for non-EU nationals"
  },
  NO: {
    country: "Norway",
    iso2: "NO",
    officialVisaUrl: "https://www.udi.no/en/want-to-apply/visit-and-holiday/",
    notes: "Schengen visa for non-EU nationals"
  },
  DK: {
    country: "Denmark",
    iso2: "DK",
    officialVisaUrl: "https://www.nyidanmark.dk/en-GB",
    notes: "Schengen visa for non-EU nationals"
  },
  FI: {
    country: "Finland",
    iso2: "FI",
    officialVisaUrl: "https://um.fi/visa-to-visit-finland",
    notes: "Schengen visa for non-EU nationals"
  },
  IE: {
    country: "Ireland",
    iso2: "IE",
    officialVisaUrl: "https://www.irishimmigration.ie/coming-to-visit-ireland/",
    notes: "Not part of Schengen, separate visa"
  },
  PT: {
    country: "Portugal",
    iso2: "PT",
    officialVisaUrl: "https://www.sef.pt/en/Pages/homepage.aspx",
    notes: "Schengen visa for non-EU nationals"
  },
  GR: {
    country: "Greece",
    iso2: "GR",
    officialVisaUrl: "https://www.mfa.gr/en/visas/",
    notes: "Schengen visa for non-EU nationals"
  },
};

export function getVisaLink(iso2: string): VisaLinkEntry | undefined {
  return curatedVisaLinks[iso2];
}

export function getVisaApplicationUrl(iso2: string, entryType?: string): string | undefined {
  const entry = curatedVisaLinks[iso2];
  if (!entry) return undefined;
  
  if (entryType === "ETA" && entry.etaUrl) {
    return entry.etaUrl;
  }
  if (entryType === "EVISA" && entry.eVisaUrl) {
    return entry.eVisaUrl;
  }
  return entry.eVisaUrl || entry.etaUrl || entry.officialVisaUrl;
}
