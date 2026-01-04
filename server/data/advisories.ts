import type { TravelAdvisory } from "@shared/schema";

// Curated travel advisories based on US State Department and CDC data
// Updated: January 2026
export const travelAdvisories: TravelAdvisory[] = [
  // Level 4 - Do Not Travel
  {
    id: "adv-afg-001",
    countryCode: "AF",
    countryName: "Afghanistan",
    level: "LEVEL_4",
    source: "STATE_DEPT",
    title: "Do Not Travel - Afghanistan",
    summary: "Do not travel to Afghanistan due to civil unrest, armed conflict, crime, terrorism, and kidnapping.",
    details: "Travel to all areas of Afghanistan is unsafe. The U.S. Embassy in Kabul suspended operations. U.S. citizens should not travel to Afghanistan.",
    issuedAt: "2024-01-15",
    updatedAt: "2025-12-01",
    url: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/afghanistan-travel-advisory.html",
    tags: ["terrorism", "civil unrest", "crime", "kidnapping"],
  },
  {
    id: "adv-ukr-001",
    countryCode: "UA",
    countryName: "Ukraine",
    level: "LEVEL_4",
    source: "STATE_DEPT",
    title: "Do Not Travel - Ukraine",
    summary: "Do not travel to Ukraine due to active armed conflict and the potential for airstrikes across the country.",
    details: "Russia's military invasion of Ukraine continues. Conditions are dangerous and unpredictable. There are limited options for departure.",
    issuedAt: "2024-02-01",
    updatedAt: "2025-12-15",
    url: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/ukraine-travel-advisory.html",
    tags: ["armed conflict", "airstrikes"],
  },
  {
    id: "adv-rus-001",
    countryCode: "RU",
    countryName: "Russia",
    level: "LEVEL_4",
    source: "STATE_DEPT",
    title: "Do Not Travel - Russia",
    summary: "Do not travel to Russia due to the potential for harassment against U.S. citizens and the arbitrary enforcement of local law.",
    details: "U.S. citizens may face arbitrary or wrongful detention. Limited flight options and banking restrictions exist. The U.S. Embassy has limited ability to assist citizens.",
    issuedAt: "2024-01-01",
    updatedAt: "2025-11-20",
    url: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/russia-travel-advisory.html",
    tags: ["detention risk", "harassment"],
  },
  {
    id: "adv-irn-001",
    countryCode: "IR",
    countryName: "Iran",
    level: "LEVEL_4",
    source: "STATE_DEPT",
    title: "Do Not Travel - Iran",
    summary: "Do not travel to Iran due to the risk of kidnapping and arbitrary arrest of U.S. citizens.",
    details: "Iran does not recognize dual nationality and will not allow the U.S. Embassy to provide consular services to dual nationals.",
    issuedAt: "2024-03-01",
    updatedAt: "2025-10-15",
    url: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/iran-travel-advisory.html",
    tags: ["kidnapping", "arbitrary arrest"],
  },
  {
    id: "adv-ven-001",
    countryCode: "VE",
    countryName: "Venezuela",
    level: "LEVEL_4",
    source: "STATE_DEPT",
    title: "Do Not Travel - Venezuela",
    summary: "Do not travel to Venezuela due to crime, civil unrest, kidnapping, and arbitrary enforcement of laws.",
    details: "Violent crime is pervasive. Political rallies can turn violent. Medical care is limited. The U.S. Embassy has limited ability to provide services.",
    issuedAt: "2024-02-15",
    updatedAt: "2025-11-01",
    url: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/venezuela-travel-advisory.html",
    tags: ["crime", "civil unrest", "kidnapping"],
  },

  // Level 3 - Reconsider Travel
  {
    id: "adv-mex-001",
    countryCode: "MX",
    countryName: "Mexico",
    level: "LEVEL_3",
    source: "STATE_DEPT",
    title: "Reconsider Travel - Mexico (Some Areas)",
    summary: "Reconsider travel to certain states in Mexico due to crime and kidnapping.",
    details: "Violent crime such as homicide, kidnapping, carjacking, and robbery is widespread. Do not travel to Colima, Guerrero, Michoacan, Sinaloa, Tamaulipas, and Zacatecas.",
    regions: ["Colima", "Guerrero", "Michoacan", "Sinaloa", "Tamaulipas", "Zacatecas"],
    issuedAt: "2024-05-01",
    updatedAt: "2025-12-10",
    url: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/mexico-travel-advisory.html",
    tags: ["crime", "kidnapping", "carjacking"],
  },
  {
    id: "adv-col-001",
    countryCode: "CO",
    countryName: "Colombia",
    level: "LEVEL_3",
    source: "STATE_DEPT",
    title: "Reconsider Travel - Colombia",
    summary: "Reconsider travel to Colombia due to crime, terrorism, and kidnapping.",
    details: "Exercise increased caution in Colombia due to violent crime. Some areas have increased risk including Norte de Santander and Arauca departments.",
    regions: ["Norte de Santander", "Arauca", "Cauca", "Choco"],
    issuedAt: "2024-04-15",
    updatedAt: "2025-11-25",
    url: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/colombia-travel-advisory.html",
    tags: ["crime", "terrorism", "kidnapping"],
  },
  {
    id: "adv-pak-001",
    countryCode: "PK",
    countryName: "Pakistan",
    level: "LEVEL_3",
    source: "STATE_DEPT",
    title: "Reconsider Travel - Pakistan",
    summary: "Reconsider travel to Pakistan due to terrorism and sectarian violence.",
    details: "Terrorist groups continue plotting attacks in Pakistan. Targets may include schools, hotels, airports, and government buildings.",
    issuedAt: "2024-06-01",
    updatedAt: "2025-10-20",
    url: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/pakistan-travel-advisory.html",
    tags: ["terrorism", "sectarian violence"],
  },

  // Level 2 - Exercise Increased Caution
  {
    id: "adv-bra-001",
    countryCode: "BR",
    countryName: "Brazil",
    level: "LEVEL_2",
    source: "STATE_DEPT",
    title: "Exercise Increased Caution - Brazil",
    summary: "Exercise increased caution in Brazil due to crime.",
    details: "Violent crime such as armed robbery and carjacking is common in urban areas. Gang activity and organized crime is widespread.",
    issuedAt: "2024-03-01",
    updatedAt: "2025-12-05",
    url: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/brazil-travel-advisory.html",
    tags: ["crime", "robbery"],
  },
  {
    id: "adv-ind-001",
    countryCode: "IN",
    countryName: "India",
    level: "LEVEL_2",
    source: "STATE_DEPT",
    title: "Exercise Increased Caution - India",
    summary: "Exercise increased caution in India due to crime, terrorism, and civil unrest.",
    details: "Do not travel to Jammu and Kashmir (except Ladakh) and within 10 km of the India-Pakistan border due to terrorism and armed conflict.",
    regions: ["Jammu and Kashmir (except Ladakh)", "India-Pakistan border areas"],
    issuedAt: "2024-07-01",
    updatedAt: "2025-11-15",
    url: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/india-travel-advisory.html",
    tags: ["crime", "terrorism", "civil unrest"],
  },
  {
    id: "adv-tur-001",
    countryCode: "TR",
    countryName: "Turkey",
    level: "LEVEL_2",
    source: "STATE_DEPT",
    title: "Exercise Increased Caution - Turkey",
    summary: "Exercise increased caution when traveling to Turkey due to terrorism and arbitrary detentions.",
    details: "Terrorist groups continue to plot attacks. Areas along the Syrian border have heightened risks.",
    regions: ["Syrian border areas"],
    issuedAt: "2024-05-15",
    updatedAt: "2025-12-01",
    url: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/turkey-travel-advisory.html",
    tags: ["terrorism", "arbitrary detention"],
  },
  {
    id: "adv-ken-001",
    countryCode: "KE",
    countryName: "Kenya",
    level: "LEVEL_2",
    source: "STATE_DEPT",
    title: "Exercise Increased Caution - Kenya",
    summary: "Exercise increased caution in Kenya due to crime, terrorism, and kidnapping.",
    details: "Terrorist attacks have occurred with little or no warning. Avoid travel to areas within 60 km of the Kenya-Somalia border.",
    regions: ["Kenya-Somalia border (60km zone)"],
    issuedAt: "2024-08-01",
    updatedAt: "2025-10-30",
    url: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/kenya-travel-advisory.html",
    tags: ["crime", "terrorism", "kidnapping"],
  },

  // Level 1 - Exercise Normal Precautions (popular business destinations)
  {
    id: "adv-gbr-001",
    countryCode: "GB",
    countryName: "United Kingdom",
    level: "LEVEL_1",
    source: "STATE_DEPT",
    title: "Exercise Normal Precautions - United Kingdom",
    summary: "Exercise normal precautions when traveling to the United Kingdom.",
    details: "The UK is generally safe. Be aware of your surroundings and follow local news for any developing situations.",
    issuedAt: "2024-01-01",
    updatedAt: "2025-09-15",
    url: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/united-kingdom-travel-advisory.html",
    tags: [],
  },
  {
    id: "adv-deu-001",
    countryCode: "DE",
    countryName: "Germany",
    level: "LEVEL_1",
    source: "STATE_DEPT",
    title: "Exercise Normal Precautions - Germany",
    summary: "Exercise normal precautions when traveling to Germany.",
    details: "Germany is generally safe. Standard safety precautions apply.",
    issuedAt: "2024-01-01",
    updatedAt: "2025-08-20",
    url: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/germany-travel-advisory.html",
    tags: [],
  },
  {
    id: "adv-jpn-001",
    countryCode: "JP",
    countryName: "Japan",
    level: "LEVEL_1",
    source: "STATE_DEPT",
    title: "Exercise Normal Precautions - Japan",
    summary: "Exercise normal precautions when traveling to Japan.",
    details: "Japan is generally safe with low crime rates. Be prepared for natural disasters including earthquakes.",
    issuedAt: "2024-01-01",
    updatedAt: "2025-07-10",
    url: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/japan-travel-advisory.html",
    tags: ["natural disasters"],
  },
  {
    id: "adv-can-001",
    countryCode: "CA",
    countryName: "Canada",
    level: "LEVEL_1",
    source: "STATE_DEPT",
    title: "Exercise Normal Precautions - Canada",
    summary: "Exercise normal precautions when traveling to Canada.",
    details: "Canada is generally safe. Standard safety precautions apply.",
    issuedAt: "2024-01-01",
    updatedAt: "2025-06-15",
    url: "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/canada-travel-advisory.html",
    tags: [],
  },

  // CDC Health Advisories
  {
    id: "adv-cdc-malaria",
    countryCode: "NG",
    countryName: "Nigeria",
    level: "LEVEL_2",
    source: "CDC",
    title: "Health Notice - Malaria Risk",
    summary: "Malaria is present throughout Nigeria. Antimalarial medication is recommended.",
    details: "All travelers should take prescription antimalarial medication before, during, and after travel. Use insect repellent and sleep under mosquito nets.",
    issuedAt: "2024-06-01",
    updatedAt: "2025-12-01",
    url: "https://wwwnc.cdc.gov/travel/destinations/traveler/none/nigeria",
    tags: ["health", "malaria"],
  },
  {
    id: "adv-cdc-yellow-fever",
    countryCode: "BR",
    countryName: "Brazil",
    level: "LEVEL_2",
    source: "CDC",
    title: "Health Notice - Yellow Fever Vaccination",
    summary: "Yellow fever vaccination is recommended for travelers to many areas of Brazil.",
    details: "Vaccination is recommended for travelers aged 9 months or older going to states of Acre, Amapa, Amazonas, Federal District, Goias, Maranhao, Mato Grosso, Mato Grosso do Sul, Minas Gerais, Para, Rondonia, Roraima, Tocantins, and designated areas of other states.",
    regions: ["Acre", "Amapa", "Amazonas", "Federal District", "Goias", "Maranhao", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Para", "Rondonia", "Roraima", "Tocantins"],
    issuedAt: "2024-01-15",
    updatedAt: "2025-11-01",
    url: "https://wwwnc.cdc.gov/travel/destinations/traveler/none/brazil",
    tags: ["health", "vaccination", "yellow fever"],
  },

  // Carta Internal Policy Advisory
  {
    id: "adv-carta-001",
    countryCode: "CN",
    countryName: "China",
    level: "LEVEL_2",
    source: "CARTA",
    title: "Carta Policy - Additional Approval Required",
    summary: "Travel to China requires VP-level approval due to enhanced data security protocols.",
    details: "All Carta employees traveling to China must obtain VP-level approval at least 30 days in advance. Device policies and data handling procedures apply. Contact Security team for pre-travel briefing.",
    issuedAt: "2025-01-01",
    updatedAt: "2025-12-15",
    tags: ["carta policy", "approval required", "data security"],
  },
  {
    id: "adv-carta-002",
    countryCode: "IL",
    countryName: "Israel",
    level: "LEVEL_3",
    source: "CARTA",
    title: "Carta Policy - Travel Restricted",
    summary: "Non-essential travel to Israel is currently restricted pending security review.",
    details: "Due to ongoing regional tensions, Carta has temporarily restricted non-essential business travel to Israel. Essential travel requires C-suite approval. Contact People Operations for guidance.",
    issuedAt: "2025-10-01",
    updatedAt: "2025-12-20",
    tags: ["carta policy", "restricted", "approval required"],
  },
];

// Helper to get advisories by country code
export function getAdvisoriesByCountry(countryCode: string): TravelAdvisory[] {
  return travelAdvisories.filter(a => a.countryCode === countryCode.toUpperCase());
}

// Helper to get highest severity advisory for a country
export function getHighestAdvisory(countryCode: string): TravelAdvisory | null {
  const advisories = getAdvisoriesByCountry(countryCode);
  if (advisories.length === 0) return null;
  
  const levelOrder = { "LEVEL_4": 4, "LEVEL_3": 3, "LEVEL_2": 2, "LEVEL_1": 1 };
  return advisories.sort((a, b) => levelOrder[b.level] - levelOrder[a.level])[0];
}

// Get all advisories sorted by severity
export function getAllAdvisoriesSorted(): TravelAdvisory[] {
  const levelOrder = { "LEVEL_4": 4, "LEVEL_3": 3, "LEVEL_2": 2, "LEVEL_1": 1 };
  return [...travelAdvisories].sort((a, b) => levelOrder[b.level] - levelOrder[a.level]);
}

// Get advisories by level
export function getAdvisoriesByLevel(level: TravelAdvisory["level"]): TravelAdvisory[] {
  return travelAdvisories.filter(a => a.level === level);
}

// Get advisory level color for UI
export function getAdvisoryLevelColor(level: TravelAdvisory["level"]): string {
  switch (level) {
    case "LEVEL_4": return "red";
    case "LEVEL_3": return "orange";
    case "LEVEL_2": return "yellow";
    case "LEVEL_1": return "green";
    default: return "gray";
  }
}

// Get advisory level label
export function getAdvisoryLevelLabel(level: TravelAdvisory["level"]): string {
  switch (level) {
    case "LEVEL_4": return "Do Not Travel";
    case "LEVEL_3": return "Reconsider Travel";
    case "LEVEL_2": return "Exercise Increased Caution";
    case "LEVEL_1": return "Exercise Normal Precautions";
    default: return "Unknown";
  }
}

// Get source label
export function getSourceLabel(source: TravelAdvisory["source"]): string {
  switch (source) {
    case "STATE_DEPT": return "US State Department";
    case "CDC": return "CDC";
    case "CARTA": return "Carta Policy";
    default: return source;
  }
}
