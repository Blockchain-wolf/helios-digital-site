import type { Document, Ligne } from './types';

/** Identifiant court, suffisant pour des données locales à un seul appareil. */
export function nouvelId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Formate un montant en euros. Intl est disponible sur Hermes, mais on garde
 * un repli manuel pour ne jamais casser l'affichage d'un montant.
 */
export function euros(montant: number): string {
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2,
    }).format(montant);
  } catch {
    return `${montant.toFixed(2).replace('.', ',')} €`;
  }
}

/** Convertit une saisie utilisateur (« 1 200,50 ») en nombre. */
export function versNombre(saisie: string): number {
  const nettoye = saisie.replace(/\s/g, '').replace(',', '.');
  const valeur = Number.parseFloat(nettoye);
  return Number.isFinite(valeur) ? valeur : 0;
}

/** Date ISO (AAAA-MM-JJ) du jour. */
export function aujourdHui(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Ajoute des jours à une date ISO et renvoie une date ISO. */
export function ajouterJours(dateIso: string, jours: number): string {
  const date = new Date(`${dateIso}T00:00:00`);
  date.setDate(date.getDate() + jours);
  return date.toISOString().slice(0, 10);
}

/** Affiche une date ISO au format français, ou « — » si vide/invalide. */
export function dateFr(dateIso: string): string {
  if (!dateIso) return '—';
  const [annee, mois, jour] = dateIso.split('-');
  if (!annee || !mois || !jour) return dateIso;
  return `${jour}/${mois}/${annee}`;
}

export interface Totaux {
  ht: number;
  tva: number;
  ttc: number;
}

export function totalLigne(ligne: Ligne): number {
  return ligne.quantite * ligne.prixUnitaire;
}

export function totaux(document: Document): Totaux {
  const ht = document.lignes.reduce((somme, ligne) => somme + totalLigne(ligne), 0);
  const tva = ht * (document.tauxTva / 100);
  return { ht, tva, ttc: ht + tva };
}

/**
 * Numéro suivant du type demandé, sous la forme D-2026-001 / F-2026-001.
 * La séquence repart à 1 chaque année civile.
 */
export function numeroSuivant(type: 'devis' | 'facture', documents: Document[]): string {
  const prefixe = type === 'devis' ? 'D' : 'F';
  const annee = new Date().getFullYear();
  const debut = `${prefixe}-${annee}-`;

  const dernier = documents
    .filter((doc) => doc.numero.startsWith(debut))
    .map((doc) => Number.parseInt(doc.numero.slice(debut.length), 10))
    .filter((numero) => Number.isFinite(numero))
    .reduce((max, numero) => Math.max(max, numero), 0);

  return `${debut}${String(dernier + 1).padStart(3, '0')}`;
}

/** Une facture envoyée dont l'échéance est dépassée est en retard de paiement. */
export function enRetard(document: Document): boolean {
  return (
    document.type === 'facture' &&
    document.statut === 'envoye' &&
    document.dateEcheance !== '' &&
    document.dateEcheance < aujourdHui()
  );
}
