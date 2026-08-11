import AsyncStorage from '@react-native-async-storage/async-storage';

import { DONNEES_VIDES, REGLAGES_PAR_DEFAUT, type Donnees } from './types';

const CLE = 'helios-pro/donnees/v1';

/**
 * Relit les données du téléphone. Toute donnée illisible est traitée comme
 * une première utilisation plutôt que de faire planter l'app au démarrage.
 */
export async function lire(): Promise<Donnees> {
  try {
    const brut = await AsyncStorage.getItem(CLE);
    if (!brut) return DONNEES_VIDES;

    const analyse = JSON.parse(brut) as Partial<Donnees>;
    return {
      clients: Array.isArray(analyse.clients) ? analyse.clients : [],
      documents: Array.isArray(analyse.documents) ? analyse.documents : [],
      // Fusion avec les valeurs par défaut : un réglage ajouté dans une
      // version ultérieure reste défini pour les installations existantes.
      reglages: { ...REGLAGES_PAR_DEFAUT, ...(analyse.reglages ?? {}) },
    };
  } catch (erreur) {
    console.warn('Lecture des données impossible, démarrage à vide.', erreur);
    return DONNEES_VIDES;
  }
}

export async function ecrire(donnees: Donnees): Promise<void> {
  try {
    await AsyncStorage.setItem(CLE, JSON.stringify(donnees));
  } catch (erreur) {
    console.warn('Enregistrement des données impossible.', erreur);
  }
}

export async function effacerTout(): Promise<void> {
  await AsyncStorage.removeItem(CLE);
}
