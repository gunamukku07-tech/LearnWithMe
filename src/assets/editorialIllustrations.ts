/**
 * LearnWithMe — Editorial Visual Asset Registry (Part 1 Foundation)
 * Maps topic keys to curated warm-pastel editorial illustration presets.
 */

export interface EditorialAssetPreset {
  key: string;
  label: string;
  accentColor: string;
  surfaceColor: string;
}

export const EDITORIAL_ASSET_PRESETS: EditorialAssetPreset[] = [
  {
    key: 'editorial:java',
    label: 'Java & JVM Architecture',
    accentColor: '#D9A5A5',
    surfaceColor: '#FFF8EF',
  },
  {
    key: 'editorial:arrays',
    label: 'Arrays & Contiguous Memory',
    accentColor: '#D9BFA9',
    surfaceColor: '#F9EFE8',
  },
  {
    key: 'editorial:oop',
    label: 'Object-Oriented Programming',
    accentColor: '#D9A5A5',
    surfaceColor: '#F7DDE1',
  },
  {
    key: 'editorial:dsa',
    label: 'Data Structures & Algorithms',
    accentColor: '#594438',
    surfaceColor: '#EADCCB',
  },
  {
    key: 'editorial:graphs',
    label: 'Graphs & Network Traversal',
    accentColor: '#D9A5A5',
    surfaceColor: '#FFF8EF',
  },
];
