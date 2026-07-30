/** Modèles de données de l'app. Tout est stocké en local sur le téléphone. */

export interface Client {
  id: string;
  nom: string;
  contact: string;
  email: string;
  telephone: string;
  adresse: string;
  siret: string;
  notes: string;
  creeLe: string;
}

export type TypeDocument = 'devis' | 'facture';

/** Statuts possibles d'un devis. */
export type StatutDevis = 'brouillon' | 'envoye' | 'accepte' | 'refuse';
/** Statuts possibles d'une facture. */
export type StatutFacture = 'brouillon' | 'envoye' | 'paye';

export type Statut = StatutDevis | StatutFacture;

export const STATUTS_DEVIS: StatutDevis[] = ['brouillon', 'envoye', 'accepte', 'refuse'];
export const STATUTS_FACTURE: StatutFacture[] = ['brouillon', 'envoye', 'paye'];

export function statutsPour(type: TypeDocument): Statut[] {
  return type === 'devis' ? STATUTS_DEVIS : STATUTS_FACTURE;
}

export const LIBELLES_STATUT: Record<Statut, string> = {
  brouillon: 'Brouillon',
  envoye: 'Envoyé',
  accepte: 'Accepté',
  refuse: 'Refusé',
  paye: 'Payé',
};

export interface Ligne {
  id: string;
  designation: string;
  quantite: number;
  prixUnitaire: number;
}

export interface Document {
  id: string;
  type: TypeDocument;
  numero: string;
  clientId: string;
  statut: Statut;
  lignes: Ligne[];
  /** Taux de TVA en pourcentage (0 si non applicable). */
  tauxTva: number;
  dateEmission: string;
  dateEcheance: string;
  notes: string;
  /** Renseigné quand la facture provient d'un devis accepté. */
  issuDuDevisId?: string;
  creeLe: string;
}

export interface Reglages {
  entreprise: string;
  email: string;
  telephone: string;
  adresse: string;
  siret: string;
  tvaApplicable: boolean;
  tauxTvaDefaut: number;
  delaiPaiementJours: number;
}

export interface Donnees {
  clients: Client[];
  documents: Document[];
  reglages: Reglages;
}

export const REGLAGES_PAR_DEFAUT: Reglages = {
  entreprise: 'HeliosDigital',
  email: '',
  telephone: '',
  adresse: '',
  siret: '',
  tvaApplicable: false,
  tauxTvaDefaut: 20,
  delaiPaiementJours: 30,
};

export const DONNEES_VIDES: Donnees = {
  clients: [],
  documents: [],
  reglages: REGLAGES_PAR_DEFAUT,
};
