/**
 * Palette reprise du site HeliosDigital (voir style.css à la racine du dépôt)
 * pour que l'app et le site se ressemblent.
 */
export const couleurs = {
  accent: '#47705a',
  accentSombre: '#345143',
  accentClair: '#e3ede6',
  fond: '#eaf6df',
  surface: '#ffffff',
  surfaceDouce: '#f6faf2',
  texte: '#1f2937',
  discret: '#57606f',
  bordure: '#dce5d5',
  succes: '#2f7a4d',
  succesFond: '#e4f3e9',
  attente: '#9a6b13',
  attenteFond: '#fdf2dc',
  danger: '#b3261e',
  dangerFond: '#fbe8e6',
  neutre: '#57606f',
  neutreFond: '#eef0f2',
} as const;

export const espace = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const rayon = {
  sm: 8,
  md: 12,
  lg: 16,
  plein: 999,
} as const;

export const typo = {
  titre: { fontSize: 26, fontWeight: '700' },
  sousTitre: { fontSize: 19, fontWeight: '700' },
  corps: { fontSize: 15, fontWeight: '400' },
  petit: { fontSize: 13, fontWeight: '400' },
  etiquette: { fontSize: 12, fontWeight: '600' },
} as const;
