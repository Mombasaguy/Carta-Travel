# Carta Travel Requirements - Design Guidelines

## Design Approach

**Hybrid Approach**: Combine the clean, information-first approach of government portals (like GOV.UK) with the visual appeal of modern travel platforms (Kayak, Skyscanner). Prioritize clarity and scannability while maintaining visual interest through strategic imagery and modern card-based layouts.

## Core Design Elements

### Typography
- **Primary Font**: Inter (Google Fonts) - excellent for UI and data display
- **Headings**: Font weights 700-800, sizes from text-3xl to text-5xl
- **Body Text**: Font weight 400-500, text-base to text-lg
- **Data/Requirements**: Font weight 500-600 for emphasis, mono font for codes/numbers

### Layout System
**Tailwind Spacing Units**: Use 4, 6, 8, 12, 16 consistently
- Component padding: p-6 to p-8
- Section spacing: py-12 to py-20
- Card gaps: gap-6 to gap-8
- Container max-width: max-w-7xl

### Component Library

**Hero Section**:
- Large hero image (travel destination, passport stamps, or airport scene)
- Search bar overlay with country/destination selector
- Quick stats banner (e.g., "200+ countries • Real-time updates • Visa requirements")

**Country/Destination Cards**:
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Small flag/country image
- Country name + requirement status badge
- Quick facts: visa needed/not needed, vaccination requirements
- "View Details" CTA

**Requirements Display**:
- Accordion-style sections for different requirement categories
- Icon + label pattern for each requirement type
- Status indicators: checkmarks, warning icons, info icons
- Timeline view for multi-step processes

**Search & Filter**:
- Sticky search bar with autocomplete
- Filter chips for requirement types, regions, travel purpose
- Sort options: alphabetical, popular destinations, recent updates

**Information Cards**:
- Two-column layout for desktop: requirements list + helpful tips
- Color-coded severity indicators (required/recommended/optional)
- Document checklist with expandable details

**Navigation**:
- Clean horizontal nav with search prominent
- Quick links: Popular Destinations, Visa Guide, Travel Alerts
- User account/saved destinations in top-right

**Footer**:
- Multi-column: About, Resources, Support, Legal
- Newsletter signup for travel requirement updates
- Social links and data source attribution

### Images

**Hero Image**: Full-width, 70vh height - passport with stamps, international airport terminal, or world map with pins. Use overlay gradient (dark at bottom) for text readability.

**Country Cards**: Small rectangular thumbnails (aspect-ratio-video) showing iconic landmarks or flags - 200x120px optimal size.

**Requirement Icons**: Use Heroicons for consistent iconography - document, shield-check, calendar, exclamation-triangle, etc.

**Information Graphics**: Consider simple illustrations for document examples (passport pages, vaccination cards) - keep minimal and clean.

## Page-Specific Layouts

**Homepage**:
- Hero with search (70vh)
- Popular destinations grid (3-4 columns)
- Quick requirement checker tool
- Recent updates/alerts section
- Trust indicators: data sources, last updated

**Country Detail Page**:
- Header with country flag/image + name
- Requirements overview cards (2-3 column grid)
- Detailed accordion sections: Entry, Stay, Documents, Health, Customs
- Related countries sidebar
- Preparation checklist

**Search Results**:
- Filters sidebar (collapsible on mobile)
- Results grid with sorting options
- Comparison mode toggle

## Key Principles

- **Information Hierarchy**: Critical requirements stand out immediately
- **Scannability**: Use icons, badges, and color coding for quick comprehension
- **Progressive Disclosure**: Show overview first, expand for details
- **Trust**: Display data sources, update timestamps, official links
- **Mobile-First**: Collapsible sections, stacked layouts, sticky search