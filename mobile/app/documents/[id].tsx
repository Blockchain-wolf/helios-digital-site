import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import {
  Badge,
  Bouton,
  Carte,
  Ecran,
  LigneInfo,
  Pastilles,
  Separateur,
  SousTitre,
  Vide,
} from '@/components/ui';
import { dateFr, enRetard, euros, totalLigne, totaux } from '@/format';
import { useDonnees } from '@/store';
import { couleurs, espace, typo } from '@/theme';
import { LIBELLES_STATUT, statutsPour, type Statut } from '@/types';

export default function FicheDocument() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { document, documents, client, changerStatut, convertirEnFacture, supprimerDocument } =
    useDonnees();
  const router = useRouter();

  const doc = document(id);

  if (!doc) {
    return (
      <Ecran>
        <Vide titre="Document introuvable" texte="Ce document a peut-être été supprimé." />
        <Bouton titre="Retour" variante="secondaire" onPress={() => router.back()} />
      </Ecran>
    );
  }

  const proprietaire = client(doc.clientId);
  const montants = totaux(doc);
  const retard = enRetard(doc);
  /** Facture déjà générée depuis ce devis, s'il y en a une. */
  const factureLiee = documents.find((autre) => autre.issuDuDevisId === doc.id);

  const confirmerSuppression = () => {
    Alert.alert('Supprimer ce document ?', 'Cette action est définitive.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          supprimerDocument(doc.id);
          router.back();
        },
      },
    ]);
  };

  const creerLaFacture = () => {
    const identifiant = convertirEnFacture(doc.id);
    if (identifiant === '') return;
    router.replace(`/documents/${identifiant}`);
  };

  return (
    <Ecran>
      <Stack.Screen options={{ title: doc.numero }} />

      <Carte>
        <View style={styles.entete}>
          <View style={styles.enteteTexte}>
            <Text style={styles.type}>{doc.type === 'devis' ? 'Devis' : 'Facture'}</Text>
            <Text style={styles.numero}>{doc.numero}</Text>
          </View>
          <Badge statut={doc.statut} retard={retard} />
        </View>

        <Separateur />

        <LigneInfo label="Client" valeur={proprietaire?.nom ?? 'Client supprimé'} />
        <LigneInfo label="Émis le" valeur={dateFr(doc.dateEmission)} />
        {doc.type === 'facture' ? (
          <LigneInfo label="Échéance" valeur={dateFr(doc.dateEcheance)} />
        ) : null}
        {doc.issuDuDevisId ? (
          <LigneInfo
            label="Issu du devis"
            valeur={document(doc.issuDuDevisId)?.numero ?? 'devis supprimé'}
          />
        ) : null}
      </Carte>

      <SousTitre>Prestations</SousTitre>

      <Carte>
        {doc.lignes.map((ligne, index) => (
          <View key={ligne.id}>
            {index > 0 ? <Separateur /> : null}
            <View style={styles.ligne}>
              <Text style={styles.designation}>{ligne.designation}</Text>
              <View style={styles.ligneDetail}>
                <Text style={styles.quantite}>
                  {ligne.quantite} × {euros(ligne.prixUnitaire)}
                </Text>
                <Text style={styles.sousTotal}>{euros(totalLigne(ligne))}</Text>
              </View>
            </View>
          </View>
        ))}

        <Separateur />

        <View style={styles.totalLigne}>
          <Text style={styles.totalLabel}>Total HT</Text>
          <Text style={styles.totalValeur}>{euros(montants.ht)}</Text>
        </View>
        <View style={styles.totalLigne}>
          <Text style={styles.totalLabel}>TVA ({doc.tauxTva} %)</Text>
          <Text style={styles.totalValeur}>{euros(montants.tva)}</Text>
        </View>
        <View style={styles.totalLigne}>
          <Text style={styles.totalLabelFort}>Total TTC</Text>
          <Text style={styles.totalValeurFort}>{euros(montants.ttc)}</Text>
        </View>
      </Carte>

      {doc.notes ? (
        <Carte>
          <Text style={styles.notesLabel}>Notes</Text>
          <Text style={styles.notes}>{doc.notes}</Text>
        </Carte>
      ) : null}

      <Carte>
        <Pastilles
          label="Statut"
          options={statutsPour(doc.type)}
          valeur={doc.statut}
          libelle={(statut: Statut) => LIBELLES_STATUT[statut]}
          onChange={(statut) => changerStatut(doc.id, statut)}
        />
        {retard ? (
          <Text style={styles.alerte}>
            Échéance dépassée depuis le {dateFr(doc.dateEcheance)} — pensez à relancer.
          </Text>
        ) : null}
      </Carte>

      {doc.type === 'devis' && doc.statut === 'accepte' && !factureLiee ? (
        <Bouton titre="Créer la facture depuis ce devis" onPress={creerLaFacture} />
      ) : null}

      {factureLiee ? (
        <Bouton
          titre={`Voir la facture ${factureLiee.numero}`}
          variante="secondaire"
          onPress={() => router.push(`/documents/${factureLiee.id}`)}
        />
      ) : null}

      <Bouton
        titre="Modifier"
        variante="secondaire"
        onPress={() => router.push({ pathname: '/documents/edition', params: { id: doc.id } })}
      />
      <Bouton titre="Supprimer" variante="danger" onPress={confirmerSuppression} />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  entete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: espace.sm,
  },
  enteteTexte: {
    gap: 2,
  },
  type: {
    ...typo.etiquette,
    color: couleurs.discret,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  numero: {
    ...typo.sousTitre,
    color: couleurs.texte,
  },
  ligne: {
    paddingVertical: espace.sm,
    gap: espace.xs,
  },
  designation: {
    ...typo.corps,
    color: couleurs.texte,
    fontWeight: '600',
  },
  ligneDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quantite: {
    ...typo.petit,
    color: couleurs.discret,
  },
  sousTotal: {
    ...typo.petit,
    color: couleurs.texte,
    fontWeight: '600',
  },
  totalLigne: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...typo.corps,
    color: couleurs.discret,
  },
  totalValeur: {
    ...typo.corps,
    color: couleurs.texte,
    fontWeight: '600',
  },
  totalLabelFort: {
    ...typo.sousTitre,
    color: couleurs.texte,
  },
  totalValeurFort: {
    ...typo.sousTitre,
    color: couleurs.accent,
  },
  notesLabel: {
    ...typo.etiquette,
    color: couleurs.discret,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notes: {
    ...typo.petit,
    color: couleurs.texte,
  },
  alerte: {
    ...typo.petit,
    color: couleurs.danger,
    fontWeight: '600',
  },
});
