import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { ajouterJours, aujourdHui, nouvelId, numeroSuivant } from './format';
import { ecrire, effacerTout, lire } from './storage';
import {
  DONNEES_VIDES,
  type Client,
  type Document,
  type Donnees,
  type Reglages,
  type Statut,
} from './types';

export type SaisieClient = Omit<Client, 'id' | 'creeLe'>;
export type SaisieDocument = Omit<Document, 'id' | 'creeLe' | 'numero'>;

interface Store {
  /** Faux tant que les données du téléphone n'ont pas été relues. */
  pret: boolean;
  clients: Client[];
  documents: Document[];
  reglages: Reglages;

  client: (id: string) => Client | undefined;
  document: (id: string) => Document | undefined;
  /** Documents d'un client, du plus récent au plus ancien. */
  documentsDuClient: (clientId: string) => Document[];

  enregistrerClient: (saisie: SaisieClient, id?: string) => string;
  /** Supprime le client et tous ses devis/factures. */
  supprimerClient: (id: string) => void;

  enregistrerDocument: (saisie: SaisieDocument, id?: string) => string;
  supprimerDocument: (id: string) => void;
  changerStatut: (id: string, statut: Statut) => void;
  /** Crée une facture reprenant les lignes du devis. Renvoie son id. */
  convertirEnFacture: (devisId: string) => string;

  majReglages: (reglages: Reglages) => void;
  reinitialiser: () => void;
}

const Contexte = createContext<Store | null>(null);

export function FournisseurDonnees({ children }: { children: ReactNode }) {
  const [donnees, setDonnees] = useState<Donnees>(DONNEES_VIDES);
  const [pret, setPret] = useState(false);

  // Les mutations lisent l'état le plus frais via cette référence, ce qui
  // permet d'enchaîner plusieurs écritures sans perdre la précédente.
  const courant = useRef(donnees);
  courant.current = donnees;

  useEffect(() => {
    let annule = false;
    lire().then((chargees) => {
      if (annule) return;
      setDonnees(chargees);
      setPret(true);
    });
    return () => {
      annule = true;
    };
  }, []);

  useEffect(() => {
    // On n'écrit qu'après le chargement initial, sinon le premier rendu
    // écraserait les données existantes avec un état vide.
    if (pret) void ecrire(donnees);
  }, [donnees, pret]);

  const store = useMemo<Store>(() => {
    const modifier = (transformation: (actuel: Donnees) => Donnees) => {
      const suivant = transformation(courant.current);
      courant.current = suivant;
      setDonnees(suivant);
    };

    return {
      pret,
      clients: donnees.clients,
      documents: donnees.documents,
      reglages: donnees.reglages,

      client: (id) => donnees.clients.find((item) => item.id === id),
      document: (id) => donnees.documents.find((item) => item.id === id),
      documentsDuClient: (clientId) =>
        donnees.documents
          .filter((doc) => doc.clientId === clientId)
          .sort((a, b) => b.creeLe.localeCompare(a.creeLe)),

      enregistrerClient: (saisie, id) => {
        const identifiant = id ?? nouvelId();
        modifier((actuel) => ({
          ...actuel,
          clients: id
            ? actuel.clients.map((item) => (item.id === id ? { ...item, ...saisie } : item))
            : [...actuel.clients, { ...saisie, id: identifiant, creeLe: new Date().toISOString() }],
        }));
        return identifiant;
      },

      supprimerClient: (id) => {
        modifier((actuel) => ({
          ...actuel,
          clients: actuel.clients.filter((item) => item.id !== id),
          documents: actuel.documents.filter((doc) => doc.clientId !== id),
        }));
      },

      enregistrerDocument: (saisie, id) => {
        const identifiant = id ?? nouvelId();
        modifier((actuel) => ({
          ...actuel,
          documents: id
            ? actuel.documents.map((item) => (item.id === id ? { ...item, ...saisie } : item))
            : [
                ...actuel.documents,
                {
                  ...saisie,
                  id: identifiant,
                  numero: numeroSuivant(saisie.type, actuel.documents),
                  creeLe: new Date().toISOString(),
                },
              ],
        }));
        return identifiant;
      },

      supprimerDocument: (id) => {
        modifier((actuel) => ({
          ...actuel,
          documents: actuel.documents.filter((item) => item.id !== id),
        }));
      },

      changerStatut: (id, statut) => {
        modifier((actuel) => ({
          ...actuel,
          documents: actuel.documents.map((item) => (item.id === id ? { ...item, statut } : item)),
        }));
      },

      convertirEnFacture: (devisId) => {
        const devis = courant.current.documents.find((item) => item.id === devisId);
        if (!devis) return '';

        const identifiant = nouvelId();
        const emission = aujourdHui();
        modifier((actuel) => ({
          ...actuel,
          documents: [
            ...actuel.documents,
            {
              ...devis,
              id: identifiant,
              type: 'facture',
              numero: numeroSuivant('facture', actuel.documents),
              statut: 'brouillon',
              dateEmission: emission,
              dateEcheance: ajouterJours(emission, actuel.reglages.delaiPaiementJours),
              issuDuDevisId: devis.id,
              creeLe: new Date().toISOString(),
            },
          ],
        }));
        return identifiant;
      },

      majReglages: (reglages) => {
        modifier((actuel) => ({ ...actuel, reglages }));
      },

      reinitialiser: () => {
        void effacerTout();
        modifier(() => DONNEES_VIDES);
      },
    };
  }, [donnees, pret]);

  return <Contexte.Provider value={store}>{children}</Contexte.Provider>;
}

export function useDonnees(): Store {
  const store = useContext(Contexte);
  if (!store) throw new Error('useDonnees doit être utilisé dans <FournisseurDonnees>.');
  return store;
}
