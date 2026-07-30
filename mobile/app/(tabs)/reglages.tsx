import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { Bouton, Carte, Champ, Ecran, Pastilles, SousTitre } from '@/components/ui';
import { versNombre } from '@/format';
import { useDonnees } from '@/store';
import { couleurs, typo } from '@/theme';

const TVA_OPTIONS = ['non', 'oui'] as const;

export default function EcranReglages() {
  const { reglages, majReglages, reinitialiser } = useDonnees();

  const [entreprise, setEntreprise] = useState(reglages.entreprise);
  const [email, setEmail] = useState(reglages.email);
  const [telephone, setTelephone] = useState(reglages.telephone);
  const [adresse, setAdresse] = useState(reglages.adresse);
  const [siret, setSiret] = useState(reglages.siret);
  const [tvaApplicable, setTvaApplicable] = useState(reglages.tvaApplicable);
  const [tauxTvaDefaut, setTauxTvaDefaut] = useState(String(reglages.tauxTvaDefaut));
  const [delaiPaiementJours, setDelaiPaiementJours] = useState(String(reglages.delaiPaiementJours));

  const enregistrer = () => {
    majReglages({
      entreprise: entreprise.trim(),
      email: email.trim(),
      telephone: telephone.trim(),
      adresse: adresse.trim(),
      siret: siret.trim(),
      tvaApplicable,
      tauxTvaDefaut: versNombre(tauxTvaDefaut),
      delaiPaiementJours: Math.max(0, Math.round(versNombre(delaiPaiementJours))),
    });
    Alert.alert('Réglages enregistrés');
  };

  const confirmerReinitialisation = () => {
    Alert.alert(
      'Tout effacer ?',
      'Clients, devis et factures seront définitivement supprimés de cet appareil.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Tout effacer', style: 'destructive', onPress: reinitialiser },
      ],
    );
  };

  return (
    <Ecran titre="Réglages" sousTitre="Vos informations d'émetteur" hautSecurise>
      <Carte>
        <Champ
          label="Nom de l'entreprise"
          value={entreprise}
          onChangeText={setEntreprise}
          placeholder="HeliosDigital"
        />
        <Champ
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="contact@heliosdigital.fr"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Champ
          label="Téléphone"
          value={telephone}
          onChangeText={setTelephone}
          placeholder="06 12 34 56 78"
          keyboardType="phone-pad"
        />
        <Champ
          label="Adresse"
          value={adresse}
          onChangeText={setAdresse}
          placeholder="12 rue des Lilas, 75011 Paris"
          multiline
        />
        <Champ label="SIRET" value={siret} onChangeText={setSiret} placeholder="123 456 789 00012" />
      </Carte>

      <SousTitre>Facturation</SousTitre>

      <Carte>
        <Pastilles
          label="TVA applicable"
          options={TVA_OPTIONS}
          valeur={tvaApplicable ? 'oui' : 'non'}
          libelle={(option) => (option === 'oui' ? 'Oui' : 'Non')}
          onChange={(option) => setTvaApplicable(option === 'oui')}
        />
        <Text style={styles.aide}>
          En franchise de TVA (micro-entreprise), laissez « Non » : les nouveaux documents partiront
          avec un taux de 0 %.
        </Text>

        {tvaApplicable ? (
          <Champ
            label="Taux de TVA par défaut (%)"
            value={tauxTvaDefaut}
            onChangeText={setTauxTvaDefaut}
            keyboardType="decimal-pad"
            placeholder="20"
          />
        ) : null}

        <Champ
          label="Délai de paiement (jours)"
          value={delaiPaiementJours}
          onChangeText={setDelaiPaiementJours}
          keyboardType="number-pad"
          placeholder="30"
        />
        <Text style={styles.aide}>
          Sert à proposer l'échéance des nouvelles factures.
        </Text>
      </Carte>

      <Bouton titre="Enregistrer" onPress={enregistrer} />

      <SousTitre>Données</SousTitre>
      <Carte>
        <Text style={styles.aide}>
          Toutes les données restent sur cet appareil : rien n'est envoyé sur internet. Elles
          disparaissent si l'application est désinstallée.
        </Text>
      </Carte>
      <Bouton titre="Tout effacer" variante="danger" onPress={confirmerReinitialisation} />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  aide: {
    ...typo.petit,
    color: couleurs.discret,
  },
});
