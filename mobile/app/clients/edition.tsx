import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { Bouton, Carte, Champ, Ecran } from '@/components/ui';
import { useDonnees, type SaisieClient } from '@/store';

const VIDE: SaisieClient = {
  nom: '',
  contact: '',
  email: '',
  telephone: '',
  adresse: '',
  siret: '',
  notes: '',
};

/** Formulaire de création (sans `id`) ou de modification (avec `id`) d'un client. */
export default function EditionClient() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { client, enregistrerClient } = useDonnees();
  const router = useRouter();

  const existant = id ? client(id) : undefined;
  const [saisie, setSaisie] = useState<SaisieClient>(
    existant
      ? {
          nom: existant.nom,
          contact: existant.contact,
          email: existant.email,
          telephone: existant.telephone,
          adresse: existant.adresse,
          siret: existant.siret,
          notes: existant.notes,
        }
      : VIDE,
  );

  const majChamp = (champ: keyof SaisieClient) => (valeur: string) =>
    setSaisie((actuel) => ({ ...actuel, [champ]: valeur }));

  const enregistrer = () => {
    if (saisie.nom.trim() === '') {
      Alert.alert('Nom manquant', 'Le nom du client est nécessaire pour l’enregistrer.');
      return;
    }
    enregistrerClient({ ...saisie, nom: saisie.nom.trim() }, id);
    router.back();
  };

  return (
    <Ecran>
      <Stack.Screen options={{ title: id ? 'Modifier le client' : 'Nouveau client' }} />
      <Carte>
        <Champ
          label="Nom ou société *"
          value={saisie.nom}
          onChangeText={majChamp('nom')}
          placeholder="Boulangerie Martin"
          autoFocus={!id}
        />
        <Champ
          label="Personne de contact"
          value={saisie.contact}
          onChangeText={majChamp('contact')}
          placeholder="Sophie Martin"
        />
        <Champ
          label="Email"
          value={saisie.email}
          onChangeText={majChamp('email')}
          placeholder="contact@exemple.fr"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Champ
          label="Téléphone"
          value={saisie.telephone}
          onChangeText={majChamp('telephone')}
          placeholder="06 12 34 56 78"
          keyboardType="phone-pad"
        />
        <Champ
          label="Adresse"
          value={saisie.adresse}
          onChangeText={majChamp('adresse')}
          placeholder="12 rue des Lilas, 75011 Paris"
          multiline
        />
        <Champ
          label="SIRET"
          value={saisie.siret}
          onChangeText={majChamp('siret')}
          placeholder="123 456 789 00012"
        />
        <Champ
          label="Notes"
          value={saisie.notes}
          onChangeText={majChamp('notes')}
          placeholder="Préférences, historique, points d'attention…"
          multiline
        />
      </Carte>

      <Bouton titre="Enregistrer" onPress={enregistrer} />
      <Bouton titre="Annuler" variante="secondaire" onPress={() => router.back()} />
    </Ecran>
  );
}
