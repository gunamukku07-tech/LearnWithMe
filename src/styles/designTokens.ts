/**
 * LearnWithMe — Design System Tokens (Part 1 Foundation)
 * Strict Light Theme Warm Pastel Editorial Palette
 */

export const COLORS = {
  warmCream: '#FFF8EF',
  secondaryCream: '#F9EFE8',
  blushPink: '#F7DDE1',
  dustyRose: '#D9A5A5',
  lightBrown: '#D9BFA9',
  softBeige: '#EADCCB',
  espressoBrown: '#594438',
  mutedBrown: '#887467',
  white: '#FFFFFF',
  warmBorder: '#EDE0D5',
} as const;

export const TYPOGRAPHY = {
  displayHeading: "'Playfair Display', Georgia, serif",
  sectionHeading: "'DM Serif Display', Georgia, serif",
  bodySans: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  codeMono: "'JetBrains Mono', monospace",
} as const;

export const SPACING = {
  sectionPadding: 'py-20 lg:py-24',
  containerWidth: 'max-w-7xl mx-auto px-6',
  readingWidth: 'max-w-[68ch]',
  cardRadius: 'rounded-[18px]',
  panelRadius: 'rounded-[22px]',
} as const;
