import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import {
  Badge,
  Bouton,
  Carte,
  CarteBouton,
  Ecran,
  LigneInfo,
  Separateur,
  SousTitre,
  Vide,
} from '@/components/ui';
import { dateFr, enRetard, euros, totaux } from '@/format';
import { useDonnees } from '@/store';
import { couleurs, espace, typo } from '@/theme';

export default function FicheClient() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client, documentsDuClient, supprimerClient } = useDonnees();
  const router = useRouter();

  const fiche = client(id);

  if (!fiche) {
    return (
      <Ecran>
        <Vide titre="Client introuvable" texte="Ce client a peut-être été supprimé." />
        <Bouton titre="Retour" variante="secondaire" onPress={() => router.back()} />
      </Ecran>
    );
  }

  const documents = documentsDuClient(fiche.id);

  const confirmerSuppression = () => {
    Alert.alert(
      'Supprimer ce client ?',
      documents.length > 0
        ? `Ses ${documents.length} devis/facture(s) seront également supprimés. Cette action est définitive.`
        : 'Cette action est définitive.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            supprimerClient(fiche.id);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <Ecran>
      <Stack.Screen options={{ title: fiche.nom }} />

      <Carte>
        <Text style={styles.nom}>{fiche.nom}</Text>
        <Separateur />
        <LigneInfo label="Contact" valeur={fiche.contact} />
        <LigneInfo label="Email" valeur={fiche.email} />
        <LigneInfo label="Téléphone" valeur={fiche.telephone} />
        <LigneInfo label="Adresse" valeur={fiche.adresse} />
        <LigneInfo label="SIRET" valeur={fiche.siret} />
        {fiche.notes ? (
          <>
            <Separateur />
            <Text style={styles.notes}>{fiche.notes}</Text>
          </>
        ) : null}
      </Carte>

      <Bouton
        titre="Modifier"
        variante="secondaire"
        onPress={() => router.push({ pathname: '/clients/edition', params: { id: fiche.id } })}
      />

      <SousTitre>Devis & factures</SousTitre>

      <Bouton
        titre="+ Nouveau document"
        onPress={() =>
          router.push({ pathname: '/documents/edition', params: { clientId: fiche.id } })
        }
      />

      {documents.length === 0 ? (
        <Vide
          titre="Aucun document"
          texte="Créez un devis ou une facture pour ce client."
        />
      ) : (
        documents.map((doc) => (
          <CarteBouton key={doc.id} onPress={() => router.push(`/documents/${doc.id}`)}>
            <View style={styles.enteteDoc}>
              <Text style={styles.numero}>{doc.numero}</Text>
              <Badge statut={doc.statut} retard={enRetard(doc)} />
            </View>
            <Text style={styles.detail}>
              {doc.type === 'devis' ? 'Devis' : 'Facture'} · émis le {dateFr(doc.dateEmission)}
            </Text>
            <Text style={styles.montant}>{euros(totaux(doc).ttc)}</Text>
          </CarteBouton>
        ))
      )}

      <Bouton titre="Supprimer le client" variante="danger" onPress={confirmerSuppression} />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  nom: {
    ...typo.sousTitre,
    color: couleurs.texte,
  },
  notes: {
    ...typo.petit,
    color: couleurs.discret,
    fontStyle: 'italic',
  },
  enteteDoc: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: espace.sm,
  },
  numero: {
    ...typo.corps,
    fontWeight: '700',
    color: couleurs.texte,
  },
  detail: {
    ...typo.petit,
    color: couleurs.discret,
  },
  montant: {
    ...typo.corps,
    fontWeight: '700',
    color: couleurs.accent,
  },
});
