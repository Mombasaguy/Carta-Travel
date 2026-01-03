# Carta Travel Requirements - Design Guidelines

## Brand Context

Carta positions itself as **modern, elegant, customer-centric, and design-forward** while remaining **trustworthy and professional**. This internal travel tool should feel like it belongs in the Carta ecosystem - refined, not playful, not trendy-for-trend's-sake.

## Design Principles

### Core Aesthetic
- **Clean, minimal, and modern** - no visual clutter
- **High-trust professional tone** - calm and confident
- **Generous whitespace** - let content breathe
- **Readable, calm typography** - Inter font family
- **Clarity over cleverness** - prioritize information hierarchy
- **Polished interactions without gimmicks** - purposeful motion

### What to Avoid
- Bold, neon, or overly saturated colors
- Heavy shadows, gradients, or "gamified" visuals
- Decorative animations that don't serve clarity
- Trendy design patterns that feel temporary
- Dense, cramped layouts

## Color Palette

### Light Mode
- **Background**: Pure white (`hsl(0 0% 100%)`)
- **Surface**: Soft off-white (`hsl(0 0% 98%)`)
- **Surface 2**: Light gray (`hsl(0 0% 96%)`)
- **Foreground**: Near-black (`hsl(0 0% 9%)`)
- **Subtle text**: Medium gray (`hsl(0 0% 45%)`)
- **Border**: Soft gray (`hsl(0 0% 90%)`)

### Accent Color
- **Primary accent**: Deep teal/navy (`hsl(195 75% 28%)`)
- Derived from Carta's brand palette
- Used sparingly for primary actions, key highlights, and links
- Avoid overuse - let it stand out when it appears

### Status Colors (Restrained)
- **Success**: Muted green (`hsl(145 55% 42%)`)
- **Warning**: Warm amber (`hsl(38 85% 52%)`)
- **Danger**: Calm red (`hsl(0 70% 50%)`)

## Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Fallback**: system-ui, sans-serif
- **Mono**: "Fira Code" for codes, reference numbers

### Type Scale
- **Page titles**: text-3xl, font-semibold, tracking-tightish
- **Section headings**: text-xl, font-medium
- **Body**: text-base (16px), 1.6 line-height
- **Supporting text**: text-sm, text-muted-foreground
- **Subtle/tertiary**: text-xs, text-subtle

### Character
- Slightly tightened letter-spacing on headings (`-0.015em`)
- Generous line-height for readability
- Never use all-caps for body text

## Spacing & Layout

### Rhythm
- Use multiples of 4px: 4, 8, 12, 16, 24, 32, 48
- **Tight**: gap-2, p-3 (within dense components)
- **Standard**: gap-4, p-6 (cards, sections)
- **Generous**: gap-6, p-8, py-12 (page sections)

### Whitespace
- Generous padding around content areas
- Clear visual separation between sections
- Let important elements breathe

### Container
- max-w-3xl for focused content (forms, results)
- max-w-5xl for broader layouts
- Centered with generous horizontal margin

## Components

### Cards
- Subtle background (`bg-card/70` with backdrop-blur)
- Soft border radius (`rounded-2xl`)
- Minimal border (`border border-border/50`)
- Soft shadow only when needed (`shadow-soft`)

### Buttons
- Primary: accent background, white text
- Secondary/Ghost: subtle, no strong visual weight
- Consistent height with `size` variants
- Never add custom hover states - use built-in

### Form Controls
- Clean, minimal borders
- Clear focus states with ring
- Generous padding for touch targets

### Badges/Status
- Small, subtle, informative
- Use variant to convey meaning
- Never overwhelming or flashy

## Motion & Interactions

### Philosophy
Motion should **support clarity of state**, not decoration.

### Transitions
- **Form → Results**: Smooth crossfade with slight y-offset
- **Card stacks**: Staggered entrance animation
- **State changes**: 200-300ms duration

### Motion Curves
- Use **spring physics** (stiffness: 260, damping: 28)
- Avoid linear or harsh ease-in-out
- Natural, physical feel

### Micro-interactions
- Subtle scale on button tap (`active:scale-[0.98]`)
- Smooth opacity transitions
- No jarring layout shifts

### Implementation
```tsx
// Framer Motion spring config
transition={{ type: "spring", stiffness: 260, damping: 28 }}

// Content transitions
initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
```

## Page Structure

### Assess Page
1. **Header**: Page title + description
2. **Main card**: Form or results (animated swap)
3. **Form state**: Clean inputs, clear labels
4. **Results state**: 
   - Summary row (trip details + Edit button)
   - Stacked result cards with staggered entrance

### Visual Hierarchy
- Most important info (entry type) at top
- Supporting details follow
- Governance/meta info last, subdued

## Dark Mode

- Invert surfaces appropriately
- Maintain same accent hue, adjust lightness
- Keep contrast ratios accessible
- Status colors slightly more saturated

## Quality Checklist

Before shipping, verify:
- [ ] Generous whitespace throughout
- [ ] No harsh colors or saturated accents
- [ ] Typography is calm and readable
- [ ] Animations feel natural, not decorative
- [ ] Interactions provide clear feedback
- [ ] Layout is clean on mobile and desktop
- [ ] Dark mode maintains the same refined feel
