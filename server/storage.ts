import { type User, type InsertUser, type Country, type CountryDetails, type Requirement, type Notification, type InsertNotification } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllCountries(): Promise<Country[]>;
  getCountryById(id: string): Promise<CountryDetails | undefined>;
  searchCountries(query: string): Promise<Country[]>;
  getNotifications(): Promise<Notification[]>;
  getUnreadNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<Notification | undefined>;
  markAllNotificationsRead(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private countries: Map<string, CountryDetails>;
  private notifications: Map<string, Notification>;

  constructor() {
    this.users = new Map();
    this.countries = new Map();
    this.notifications = new Map();
    this.initializeCountries();
    this.initializeNotifications();
  }

  private initializeNotifications() {
    const sampleNotifications: Notification[] = [
      {
        id: "notif-1",
        type: "TRAVEL_ADVISORY",
        severity: "warning",
        title: "UK ETA Requirement Update",
        message: "Starting January 8, 2025, travelers from the US, Canada, and other visa-exempt countries will need an Electronic Travel Authorisation (ETA) to visit the UK.",
        countryCode: "GB",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: null,
        read: false,
        actionUrl: "/assess",
      },
      {
        id: "notif-2",
        type: "POLICY_CHANGE",
        severity: "info",
        title: "Carta Travel Policy Updated",
        message: "The advance booking requirement has been updated. Domestic flights now require 21 days notice, international flights require 35 days.",
        countryCode: null,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: null,
        read: false,
        actionUrl: null,
      },
      {
        id: "notif-3",
        type: "RULE_UPDATE",
        severity: "info",
        title: "Japan Entry Rules Verified",
        message: "Business travel rules for Japan have been reviewed and verified as current. No changes to visa-free entry for US passport holders.",
        countryCode: "JP",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: null,
        read: true,
        actionUrl: null,
      },
    ];

    for (const notif of sampleNotifications) {
      this.notifications.set(notif.id, notif);
    }
  }

  private initializeCountries() {
    const countriesData: CountryDetails[] = [
      {
        id: "japan",
        name: "Japan",
        code: "JP",
        region: "Asia",
        flagEmoji: "🇯🇵",
        visaRequired: false,
        visaOnArrival: false,
        eVisaAvailable: false,
        maxStayDays: 90,
        processingTime: "N/A",
        lastUpdated: "January 2026",
        requirements: [
          {
            id: "jp-entry-1",
            title: "Valid Passport",
            description: "Your passport must be valid for the duration of your stay in Japan.",
            type: "entry",
            severity: "required",
            details: [
              "Passport must be valid for entire stay",
              "At least one blank page for entry stamp",
              "Machine-readable passport recommended"
            ]
          },
          {
            id: "jp-entry-2",
            title: "Return or Onward Ticket",
            description: "Proof of departure from Japan within the visa-free period.",
            type: "entry",
            severity: "required",
            details: [
              "Flight ticket showing departure within 90 days",
              "Can be a connecting flight to another destination"
            ]
          },
          {
            id: "jp-doc-1",
            title: "Visit Japan Web Registration",
            description: "Complete the online immigration and customs declaration before arrival.",
            type: "document",
            severity: "recommended",
            details: [
              "Register at visit-japan.digital.go.jp",
              "Complete immigration, customs, and quarantine forms",
              "Receive QR code for faster processing"
            ]
          },
          {
            id: "jp-health-1",
            title: "Travel Insurance",
            description: "Comprehensive travel insurance is strongly recommended.",
            type: "health",
            severity: "recommended",
            details: [
              "Medical coverage of at least $50,000",
              "Should cover COVID-19 related expenses",
              "Emergency evacuation coverage recommended"
            ]
          },
          {
            id: "jp-stay-1",
            title: "Maximum Stay Duration",
            description: "Visa-free visitors can stay up to 90 days.",
            type: "stay",
            severity: "required",
            details: [
              "90 days maximum for tourism/business",
              "Extension possible in special circumstances",
              "Working during visit is prohibited"
            ]
          }
        ],
        tips: [
          "Learn basic Japanese phrases - it's appreciated by locals",
          "Get a Suica or Pasmo card for convenient public transport",
          "Cash is still widely used - many places don't accept cards",
          "Tipping is not customary and can be considered rude"
        ],
        emergencyContacts: {
          police: "110",
          ambulance: "119",
          embassy: "+81-3-3224-5000"
        }
      },
      {
        id: "france",
        name: "France",
        code: "FR",
        region: "Europe",
        flagEmoji: "🇫🇷",
        visaRequired: false,
        visaOnArrival: false,
        eVisaAvailable: false,
        maxStayDays: 90,
        processingTime: "N/A",
        lastUpdated: "January 2026",
        requirements: [
          {
            id: "fr-entry-1",
            title: "Valid Passport",
            description: "Passport must be valid for at least 3 months beyond your planned departure.",
            type: "entry",
            severity: "required",
            details: [
              "Valid for 3 months after departure date",
              "Issued within the last 10 years",
              "At least two blank pages"
            ]
          },
          {
            id: "fr-doc-1",
            title: "ETIAS Authorization",
            description: "Electronic travel authorization required for visa-free entry (coming 2025).",
            type: "document",
            severity: "recommended",
            details: [
              "Apply online before travel",
              "Valid for 3 years or until passport expires",
              "Costs approximately 7 EUR"
            ]
          },
          {
            id: "fr-health-1",
            title: "Health Insurance",
            description: "European Health Insurance Card (EHIC) for EU citizens, travel insurance for others.",
            type: "health",
            severity: "recommended",
            details: [
              "Minimum coverage of 30,000 EUR",
              "Should cover emergency medical treatment",
              "Repatriation coverage recommended"
            ]
          },
          {
            id: "fr-stay-1",
            title: "Schengen Area Rules",
            description: "90 days within any 180-day period in the Schengen Area.",
            type: "stay",
            severity: "required",
            details: [
              "90 days per 180-day period",
              "Time spent in other Schengen countries counts",
              "Cannot work on tourist visa"
            ]
          }
        ],
        tips: [
          "Learn a few French phrases - locals appreciate the effort",
          "Museums are often free on the first Sunday of each month",
          "Many shops close on Sundays",
          "Keep your Metro tickets until you exit the station"
        ],
        emergencyContacts: {
          police: "17",
          ambulance: "15",
          embassy: "+33-1-43-12-22-22"
        }
      },
      {
        id: "thailand",
        name: "Thailand",
        code: "TH",
        region: "Asia",
        flagEmoji: "🇹🇭",
        visaRequired: false,
        visaOnArrival: true,
        eVisaAvailable: true,
        maxStayDays: 60,
        processingTime: "1-3 business days",
        lastUpdated: "January 2026",
        requirements: [
          {
            id: "th-entry-1",
            title: "Valid Passport",
            description: "Passport must be valid for at least 6 months from entry date.",
            type: "entry",
            severity: "required",
            details: [
              "Valid for 6 months from arrival",
              "At least one blank page required",
              "Good condition without damage"
            ]
          },
          {
            id: "th-entry-2",
            title: "Proof of Accommodation",
            description: "Hotel booking or address where you'll be staying.",
            type: "entry",
            severity: "required",
            details: [
              "Hotel confirmation for first nights",
              "Or invitation letter if staying with friends/family"
            ]
          },
          {
            id: "th-doc-1",
            title: "Thailand Pass",
            description: "Digital entry registration may be required.",
            type: "document",
            severity: "recommended",
            details: [
              "Check current requirements before travel",
              "Complete online before arrival"
            ]
          },
          {
            id: "th-health-1",
            title: "Travel Insurance",
            description: "Health insurance covering medical expenses is strongly recommended.",
            type: "health",
            severity: "recommended",
            details: [
              "Minimum coverage of $50,000",
              "Should cover COVID-19 treatment",
              "Medical evacuation recommended"
            ]
          },
          {
            id: "th-customs-1",
            title: "Currency Declaration",
            description: "Amounts over 450,000 THB must be declared.",
            type: "customs",
            severity: "required",
            details: [
              "Declare amounts exceeding 450,000 THB",
              "No limit on bringing in foreign currency"
            ]
          }
        ],
        tips: [
          "Remove shoes before entering temples and homes",
          "Always show respect to the Thai Royal Family",
          "Bargaining is expected at markets",
          "Download Grab app for convenient transportation"
        ],
        emergencyContacts: {
          police: "191",
          ambulance: "1669",
          embassy: "+66-2-205-4000"
        }
      },
      {
        id: "italy",
        name: "Italy",
        code: "IT",
        region: "Europe",
        flagEmoji: "🇮🇹",
        visaRequired: false,
        visaOnArrival: false,
        eVisaAvailable: false,
        maxStayDays: 90,
        processingTime: "N/A",
        lastUpdated: "January 2026",
        requirements: [
          {
            id: "it-entry-1",
            title: "Valid Passport",
            description: "Passport valid for at least 3 months beyond your stay.",
            type: "entry",
            severity: "required",
            details: [
              "Valid for 3 months after departure",
              "Issued within last 10 years"
            ]
          },
          {
            id: "it-doc-1",
            title: "ETIAS Authorization",
            description: "Electronic authorization for visa-free travel (launching 2025).",
            type: "document",
            severity: "recommended",
            details: [
              "Apply online before travel",
              "Valid for 3 years"
            ]
          },
          {
            id: "it-stay-1",
            title: "Schengen Rules",
            description: "90 days per 180-day period in Schengen Area.",
            type: "stay",
            severity: "required",
            details: [
              "Combined time in all Schengen countries",
              "Business and tourism purposes only"
            ]
          }
        ],
        tips: [
          "Validate train tickets before boarding",
          "Many places close for afternoon siesta",
          "Tipping is appreciated but not mandatory",
          "Cover shoulders and knees when visiting churches"
        ],
        emergencyContacts: {
          police: "112",
          ambulance: "118",
          embassy: "+39-06-4674-1"
        }
      },
      {
        id: "spain",
        name: "Spain",
        code: "ES",
        region: "Europe",
        flagEmoji: "🇪🇸",
        visaRequired: false,
        visaOnArrival: false,
        eVisaAvailable: false,
        maxStayDays: 90,
        processingTime: "N/A",
        lastUpdated: "January 2026",
        requirements: [
          {
            id: "es-entry-1",
            title: "Valid Passport",
            description: "Passport valid for at least 3 months beyond stay.",
            type: "entry",
            severity: "required",
            details: [
              "Valid for 3 months post-departure",
              "Issued within last 10 years"
            ]
          },
          {
            id: "es-health-1",
            title: "Travel Insurance",
            description: "Health insurance recommended for non-EU citizens.",
            type: "health",
            severity: "recommended",
            details: [
              "Minimum 30,000 EUR coverage",
              "Should include medical repatriation"
            ]
          }
        ],
        tips: [
          "Lunch is typically 2-4 PM, dinner after 9 PM",
          "Most shops close on Sundays",
          "Siesta time is still observed in smaller towns",
          "Learn basic Spanish phrases"
        ],
        emergencyContacts: {
          police: "112",
          ambulance: "112",
          embassy: "+34-91-587-2200"
        }
      },
      {
        id: "australia",
        name: "Australia",
        code: "AU",
        region: "Oceania",
        flagEmoji: "🇦🇺",
        visaRequired: true,
        visaOnArrival: false,
        eVisaAvailable: true,
        maxStayDays: 90,
        processingTime: "24-48 hours",
        lastUpdated: "January 2026",
        requirements: [
          {
            id: "au-entry-1",
            title: "ETA or eVisitor Visa",
            description: "Electronic visa required for most visitors.",
            type: "entry",
            severity: "required",
            details: [
              "Apply through Australian ETA app",
              "Valid for 12 months",
              "Multiple entries allowed"
            ]
          },
          {
            id: "au-entry-2",
            title: "Valid Passport",
            description: "Passport must be valid for duration of stay.",
            type: "entry",
            severity: "required",
            details: [
              "Machine-readable passport required",
              "Good condition without damage"
            ]
          },
          {
            id: "au-customs-1",
            title: "Biosecurity Declaration",
            description: "Strict biosecurity rules - declare all food, plant, and animal products.",
            type: "customs",
            severity: "required",
            details: [
              "Complete Incoming Passenger Card",
              "Declare all food items",
              "Heavy fines for non-compliance"
            ]
          },
          {
            id: "au-health-1",
            title: "Travel Insurance",
            description: "Highly recommended as healthcare is expensive for visitors.",
            type: "health",
            severity: "recommended",
            details: [
              "Minimum $500,000 coverage recommended",
              "Should cover emergency evacuation"
            ]
          }
        ],
        tips: [
          "Apply for ETA before booking flights",
          "Download the Incoming Passenger Card app",
          "Respect sun safety - UV levels are extreme",
          "Drive on the left side of the road"
        ],
        emergencyContacts: {
          police: "000",
          ambulance: "000",
          embassy: "+61-2-6214-5600"
        }
      },
      {
        id: "brazil",
        name: "Brazil",
        code: "BR",
        region: "South America",
        flagEmoji: "🇧🇷",
        visaRequired: true,
        visaOnArrival: false,
        eVisaAvailable: true,
        maxStayDays: 90,
        processingTime: "5-10 business days",
        lastUpdated: "January 2026",
        requirements: [
          {
            id: "br-entry-1",
            title: "Tourist Visa or e-Visa",
            description: "Electronic visa available for US, Canadian, and Australian citizens.",
            type: "entry",
            severity: "required",
            details: [
              "Apply online at least 72 hours before travel",
              "Valid for 2 years",
              "90 days per year maximum stay"
            ]
          },
          {
            id: "br-entry-2",
            title: "Valid Passport",
            description: "Passport must be valid for at least 6 months.",
            type: "entry",
            severity: "required",
            details: [
              "Valid for 6 months from entry",
              "At least one blank page"
            ]
          },
          {
            id: "br-health-1",
            title: "Yellow Fever Vaccination",
            description: "Required if arriving from certain countries or visiting Amazon region.",
            type: "health",
            severity: "recommended",
            details: [
              "Get vaccinated at least 10 days before travel",
              "Bring International Certificate of Vaccination",
              "Recommended for Amazon region visits"
            ]
          }
        ],
        tips: [
          "Learn basic Portuguese phrases",
          "Be cautious with valuables in crowded areas",
          "Use registered taxis or rideshare apps",
          "Cash is preferred in smaller establishments"
        ],
        emergencyContacts: {
          police: "190",
          ambulance: "192",
          embassy: "+55-61-3312-7000"
        }
      },
      {
        id: "mexico",
        name: "Mexico",
        code: "MX",
        region: "North America",
        flagEmoji: "🇲🇽",
        visaRequired: false,
        visaOnArrival: false,
        eVisaAvailable: false,
        maxStayDays: 180,
        processingTime: "N/A",
        lastUpdated: "January 2026",
        requirements: [
          {
            id: "mx-entry-1",
            title: "Valid Passport",
            description: "Passport valid for duration of stay.",
            type: "entry",
            severity: "required",
            details: [
              "Must be valid for entire trip",
              "Machine-readable recommended"
            ]
          },
          {
            id: "mx-doc-1",
            title: "FMM Tourist Card",
            description: "Immigration form required for entry.",
            type: "document",
            severity: "required",
            details: [
              "Can be completed online before arrival",
              "Keep the form for departure",
              "Fee included in airline ticket"
            ]
          },
          {
            id: "mx-stay-1",
            title: "Maximum Stay",
            description: "Up to 180 days allowed for tourism.",
            type: "stay",
            severity: "required",
            details: [
              "Immigration officer determines exact stay",
              "Can be less than 180 days"
            ]
          }
        ],
        tips: [
          "Keep your FMM safe - you need it to leave",
          "Tap water is not safe to drink",
          "Use ATMs inside banks or stores",
          "Bargaining is expected at markets"
        ],
        emergencyContacts: {
          police: "911",
          ambulance: "911",
          embassy: "+52-55-5080-2000"
        }
      },
      {
        id: "germany",
        name: "Germany",
        code: "DE",
        region: "Europe",
        flagEmoji: "🇩🇪",
        visaRequired: false,
        visaOnArrival: false,
        eVisaAvailable: false,
        maxStayDays: 90,
        processingTime: "N/A",
        lastUpdated: "January 2026",
        requirements: [
          {
            id: "de-entry-1",
            title: "Valid Passport",
            description: "Passport valid for at least 3 months beyond stay.",
            type: "entry",
            severity: "required",
            details: [
              "Valid for 3 months post-departure",
              "Issued within last 10 years"
            ]
          },
          {
            id: "de-stay-1",
            title: "Schengen Rules",
            description: "90 days per 180-day period in Schengen Area.",
            type: "stay",
            severity: "required",
            details: [
              "Combined time in all Schengen countries",
              "No work allowed on tourist entry"
            ]
          }
        ],
        tips: [
          "Many shops are closed on Sundays",
          "Cash is still widely preferred",
          "Public transport is efficient and punctual",
          "Tipping 5-10% is customary at restaurants"
        ],
        emergencyContacts: {
          police: "110",
          ambulance: "112",
          embassy: "+49-30-8305-0"
        }
      },
      {
        id: "uk",
        name: "United Kingdom",
        code: "GB",
        region: "Europe",
        flagEmoji: "🇬🇧",
        visaRequired: false,
        visaOnArrival: false,
        eVisaAvailable: false,
        maxStayDays: 180,
        processingTime: "N/A",
        lastUpdated: "January 2026",
        requirements: [
          {
            id: "uk-entry-1",
            title: "Valid Passport",
            description: "Passport valid for duration of stay.",
            type: "entry",
            severity: "required",
            details: [
              "Valid for entire trip",
              "Machine-readable recommended"
            ]
          },
          {
            id: "uk-entry-2",
            title: "Electronic Travel Authorisation",
            description: "ETA required from 2024 for visa-free visitors.",
            type: "entry",
            severity: "required",
            details: [
              "Apply online before travel",
              "Valid for 2 years",
              "Allows multiple visits up to 6 months each"
            ]
          },
          {
            id: "uk-doc-1",
            title: "Proof of Return Ticket",
            description: "Evidence of onward or return travel.",
            type: "document",
            severity: "recommended",
            details: [
              "Return or onward flight ticket",
              "May be requested at immigration"
            ]
          }
        ],
        tips: [
          "UK uses pounds sterling, not euros",
          "Drive on the left side of the road",
          "Tipping 10-15% is customary at restaurants",
          "Carry an umbrella - weather is unpredictable"
        ],
        emergencyContacts: {
          police: "999",
          ambulance: "999",
          embassy: "+44-20-7499-9000"
        }
      },
      {
        id: "canada",
        name: "Canada",
        code: "CA",
        region: "North America",
        flagEmoji: "🇨🇦",
        visaRequired: false,
        visaOnArrival: false,
        eVisaAvailable: true,
        maxStayDays: 180,
        processingTime: "Minutes to days",
        lastUpdated: "January 2026",
        requirements: [
          {
            id: "ca-entry-1",
            title: "eTA (Electronic Travel Authorization)",
            description: "Required for visa-exempt foreign nationals flying to Canada.",
            type: "entry",
            severity: "required",
            details: [
              "Apply online before flight",
              "Valid for 5 years or until passport expires",
              "Costs CAD $7"
            ]
          },
          {
            id: "ca-entry-2",
            title: "Valid Passport",
            description: "Passport valid for duration of stay.",
            type: "entry",
            severity: "required",
            details: [
              "Valid for entire trip",
              "Machine-readable required for eTA"
            ]
          },
          {
            id: "ca-doc-1",
            title: "ArriveCAN App",
            description: "Optional digital submission of travel information.",
            type: "document",
            severity: "optional",
            details: [
              "Speeds up border processing",
              "Available on iOS and Android"
            ]
          }
        ],
        tips: [
          "Apply for eTA before booking flights",
          "Healthcare is expensive - get travel insurance",
          "Tipping 15-20% is expected at restaurants",
          "Check weather carefully - it varies greatly"
        ],
        emergencyContacts: {
          police: "911",
          ambulance: "911",
          embassy: "+1-613-238-5335"
        }
      },
      {
        id: "india",
        name: "India",
        code: "IN",
        region: "Asia",
        flagEmoji: "🇮🇳",
        visaRequired: true,
        visaOnArrival: false,
        eVisaAvailable: true,
        maxStayDays: 90,
        processingTime: "3-5 business days",
        lastUpdated: "January 2026",
        requirements: [
          {
            id: "in-entry-1",
            title: "e-Visa",
            description: "Electronic visa available for tourism, business, and medical visits.",
            type: "entry",
            severity: "required",
            details: [
              "Apply at indianvisaonline.gov.in",
              "Apply at least 4 days before travel",
              "Valid for 30 days to 5 years depending on type"
            ]
          },
          {
            id: "in-entry-2",
            title: "Valid Passport",
            description: "Passport must be valid for at least 6 months.",
            type: "entry",
            severity: "required",
            details: [
              "Valid for 6 months from arrival",
              "At least 2 blank pages required"
            ]
          },
          {
            id: "in-health-1",
            title: "Yellow Fever Certificate",
            description: "Required if arriving from a yellow fever endemic country.",
            type: "health",
            severity: "required",
            details: [
              "Applies to travelers from Africa and South America",
              "Must be vaccinated at least 10 days prior"
            ]
          },
          {
            id: "in-health-2",
            title: "Recommended Vaccinations",
            description: "Several vaccinations are recommended for travelers.",
            type: "health",
            severity: "recommended",
            details: [
              "Hepatitis A and B",
              "Typhoid",
              "Tetanus booster",
              "Malaria prophylaxis for some regions"
            ]
          }
        ],
        tips: [
          "Apply for e-Visa well in advance",
          "Carry copies of your visa approval",
          "Dress modestly when visiting temples",
          "Drink only bottled water"
        ],
        emergencyContacts: {
          police: "100",
          ambulance: "102",
          embassy: "+91-11-2419-8000"
        }
      }
    ];

    countriesData.forEach(country => {
      this.countries.set(country.id, country);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllCountries(): Promise<Country[]> {
    return Array.from(this.countries.values()).map((country) => ({
      id: country.id,
      name: country.name,
      code: country.code,
      region: country.region,
      flagEmoji: country.flagEmoji,
      visaRequired: country.visaRequired,
      visaOnArrival: country.visaOnArrival,
      eVisaAvailable: country.eVisaAvailable,
      maxStayDays: country.maxStayDays,
      processingTime: country.processingTime,
      requirements: null,
      healthReqs: country.healthReqs ?? null,
      customsInfo: country.customsInfo ?? null,
      lastUpdated: country.lastUpdated,
    }));
  }

  async getCountryById(id: string): Promise<CountryDetails | undefined> {
    return this.countries.get(id);
  }

  async searchCountries(query: string): Promise<Country[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.countries.values())
      .filter(country => 
        country.name.toLowerCase().includes(lowerQuery) ||
        country.code.toLowerCase().includes(lowerQuery) ||
        country.region.toLowerCase().includes(lowerQuery)
      )
      .map((country) => ({
        id: country.id,
        name: country.name,
        code: country.code,
        region: country.region,
        flagEmoji: country.flagEmoji,
        visaRequired: country.visaRequired,
        visaOnArrival: country.visaOnArrival,
        eVisaAvailable: country.eVisaAvailable,
        maxStayDays: country.maxStayDays,
        processingTime: country.processingTime,
        requirements: null,
        healthReqs: country.healthReqs ?? null,
        customsInfo: country.customsInfo ?? null,
        lastUpdated: country.lastUpdated,
      }));
  }

  async getNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => !n.expiresAt || new Date(n.expiresAt) > new Date())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    return (await this.getNotifications()).filter(n => !n.read);
  }

  async createNotification(insert: InsertNotification): Promise<Notification> {
    const id = `notif-${randomUUID()}`;
    const notification: Notification = {
      ...insert,
      id,
      createdAt: new Date().toISOString(),
      read: false,
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: string): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.read = true;
      this.notifications.set(id, notification);
    }
    return notification;
  }

  async markAllNotificationsRead(): Promise<void> {
    Array.from(this.notifications.entries()).forEach(([id, notification]) => {
      notification.read = true;
      this.notifications.set(id, notification);
    });
  }
}

export const storage = new MemStorage();
