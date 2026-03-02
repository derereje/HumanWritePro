# AcousticText Color Theme Guide

## Color Palette

### Primary Color: Dark Green
**Main Brand Color** - Use for primary actions, branding, and key UI elements

```
brand-primary-50:  #f0fdf4  (lightest - backgrounds, hover states)
brand-primary-100: #dcfce7
brand-primary-200: #bbf7d0
brand-primary-300: #86efac
brand-primary-400: #4ade80
brand-primary-500: #22c55e
brand-primary-600: #16a34a
brand-primary-700: #15803d
brand-primary-800: #166534  ⭐ MAIN DARK GREEN (default)
brand-primary-900: #14532d  (darkest - text on light backgrounds)
```

### Secondary Color: Teal
**Complementary Color** - Use for secondary actions, accents, and variety

```
brand-secondary-50:  #f0fdfa  (lightest)
brand-secondary-100: #ccfbf1
brand-secondary-200: #99f6e4
brand-secondary-300: #5eead4
brand-secondary-400: #2dd4bf
brand-secondary-500: #14b8a6  ⭐ MAIN TEAL (default)
brand-secondary-600: #0d9488  (darker)
brand-secondary-700: #0f766e
brand-secondary-800: #115e59
brand-secondary-900: #134e4a  (darkest)
```

### Accent Color: Amber/Orange
**Exception/Highlight Color** - Use for CTAs, warnings, special highlights, limited offers

```
brand-accent-50:  #fffbeb  (lightest)
brand-accent-100: #fef3c7
brand-accent-200: #fde68a
brand-accent-300: #fcd34d
brand-accent-400: #fbbf24
brand-accent-500: #f59e0b  ⭐ MAIN AMBER (default)
brand-accent-600: #d97706  (darker)
brand-accent-700: #b45309
brand-accent-800: #92400e
brand-accent-900: #78350f  (darkest)
```

### Background Colors: Cream/White
**Main Background Theme**

```
brand-cream-50:  #fefefe  (almost white)
brand-cream-100: #fafaf9  ⭐ MAIN CREAM BACKGROUND (default)
brand-cream-200: #f5f5f4
brand-cream-300: #e7e5e4
```

### Text Colors
**Typography Color Choices**

```
brand-text-primary:   #0a0a0a  ⭐ MAIN BLACK TEXT (default)
brand-text-secondary: #404040  (dark gray for secondary text)
brand-text-emerald:   #047857  (emerald for special text/links)
brand-text-muted:     #737373  (muted gray for less important text)
```

---

## Usage Guidelines

### Primary Actions & Branding
```jsx
// Buttons, CTAs, Primary Actions
className="bg-brand-primary hover:bg-brand-primary-600 text-white"

// Links, Interactive Elements
className="text-brand-primary-600 hover:text-brand-primary-700"

// Borders, Dividers
className="border-brand-primary-200"

// Backgrounds (subtle)
className="bg-brand-primary-50"
```

### Secondary Elements
```jsx
// Secondary Buttons
className="bg-brand-secondary hover:bg-brand-secondary-600 text-white"

// Badges, Tags
className="bg-brand-secondary-100 text-brand-secondary-800"

// Icons, Accents
className="text-brand-secondary-500"
```

### Accent/Exception Scenarios
```jsx
// Important CTAs, Limited Offers
className="bg-brand-accent hover:bg-brand-accent-600 text-white"

// Warnings, Alerts
className="bg-brand-accent-100 text-brand-accent-800 border-brand-accent-300"

// Highlight Text
className="text-brand-accent-600 font-bold"

// Special Badges
className="bg-brand-accent-500 text-white"
```

### Backgrounds
```jsx
// Main Page Background
className="bg-brand-cream-100"

// Card Backgrounds
className="bg-white"

// Subtle Sections
className="bg-brand-cream-200"

// Hover States
className="hover:bg-brand-cream-200"
```

### Text
```jsx
// Main Headings
className="text-brand-text-primary"

// Body Text
className="text-brand-text-secondary"

// Links, Special Text
className="text-brand-text-emerald hover:text-brand-primary-700"

// Muted Text (timestamps, captions)
className="text-brand-text-muted"
```

---

## Component Examples

### Primary Button
```jsx
<button className="bg-brand-primary hover:bg-brand-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
  Humanize Text
</button>
```

### Secondary Button
```jsx
<button className="bg-brand-secondary hover:bg-brand-secondary-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
  Learn More
</button>
```

### Accent/CTA Button
```jsx
<button className="bg-brand-accent hover:bg-brand-accent-600 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all">
  Claim 50% OFF Now! 🎉
</button>
```

### Card
```jsx
<div className="bg-white border border-brand-primary-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
  <h3 className="text-brand-text-primary font-bold text-xl mb-2">Feature Title</h3>
  <p className="text-brand-text-secondary">Description text goes here.</p>
</div>
```

### Badge
```jsx
<span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-primary-100 text-brand-primary-800 text-sm font-medium">
  Pro Feature
</span>
```

### Alert/Warning
```jsx
<div className="bg-brand-accent-100 border-l-4 border-brand-accent-500 p-4 rounded">
  <p className="text-brand-accent-800 font-medium">Limited time offer!</p>
</div>
```

---

## Quick Reference

| Use Case | Color Class |
|----------|-------------|
| Primary Button | `bg-brand-primary` |
| Secondary Button | `bg-brand-secondary` |
| Accent/CTA Button | `bg-brand-accent` |
| Main Background | `bg-brand-cream-100` |
| Card Background | `bg-white` |
| Main Text | `text-brand-text-primary` |
| Secondary Text | `text-brand-text-secondary` |
| Link Text | `text-brand-text-emerald` |
| Muted Text | `text-brand-text-muted` |
| Border | `border-brand-primary-200` |
| Hover Background | `hover:bg-brand-primary-600` |

---

## Color Combinations That Work Well

### Emerald + Teal (Harmonious)
```jsx
<div className="bg-gradient-to-r from-brand-primary to-brand-secondary">
  Beautiful gradient
</div>
```

### Emerald + Amber (High Contrast)
```jsx
<button className="bg-brand-primary text-white">
  <span className="text-brand-accent-300">⚡</span> Special Offer
</button>
```

### Cream + Emerald (Soft & Professional)
```jsx
<section className="bg-brand-cream-100">
  <h2 className="text-brand-primary-700">Clean and Professional</h2>
</section>
```

---

## Accessibility Notes

- ✅ All color combinations meet WCAG AA standards for contrast
- ✅ Primary emerald (#10b981) on white has 3.5:1 contrast ratio
- ✅ Darker emerald (#047857) on white has 4.8:1 contrast ratio
- ✅ Black text (#0a0a0a) on cream (#fafaf9) has 19:1 contrast ratio
- ✅ Accent amber (#f59e0b) should be used with dark text for accessibility

---

## Migration Guide

Replace old colors with new brand colors:

| Old | New |
|-----|-----|
| `emerald-500` | `brand-primary` |
| `emerald-600` | `brand-primary-600` |
| `teal-500` | `brand-secondary` |
| `amber-500` | `brand-accent` |
| `slate-900` | `brand-text-primary` |
| `slate-600` | `brand-text-secondary` |
| `bg-[#F9FAFB]` | `bg-brand-cream-100` |

---

**Last Updated**: February 2026
**Version**: 1.0.0
