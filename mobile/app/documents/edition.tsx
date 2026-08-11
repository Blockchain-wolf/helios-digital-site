import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Bouton, Carte, Champ, Ecran, Pastilles, Separateur, SousTitre } from '@/components/ui';
import { ajouterJours, aujourdHui, euros, nouvelId, versNombre } from '@/format';
import { useDonnees } from '@/store';
import { couleurs, espace, rayon, typo } from '@/theme';
import type { Ligne, TypeDocument } from '@/types';

/**
 * Les montants sont tenus en texte pendant la saisie : cela laisse taper
 * « 1,5 » ou un champ vide sans que la valeur soit réécrite sous les doigts.
 */
interface LigneSaisie {
  id: string;
  designation: string;
  quantite: string;
  prixUnitaire: string;
}

const TYPES: TypeDocument[] = ['devis', 'facture'];

function ligneVide(): LigneSaisie {
  return { id: nouvelId(), designation: '', quantite: '1', prixUnitaire: '' };
}

export default function EditionDocument() {
  const params = useLocalSearchParams<{ id?: string; clientId?: string; type?: TypeDocument }>();
  const { clients, document, reglages, enregistrerDocument } = useDonnees();
  const router = useRouter();

  const existant = params.id ? document(params.id) : undefined;

  const [type, setType] = useState<TypeDocument>(existant?.type ?? params.type ?? 'devis');
  const [clientId, setClientId] = useState(existant?.clientId ?? params.clientId ?? clients[0]?.id ?? '');
  const [dateEmission, setDateEmission] = useState(existant?.dateEmission ?? aujourdHui());
  const [dateEcheance, setDateEcheance] = useState(
    existant?.dateEcheance ?? ajouterJours(aujourdHui(), reglages.delaiPaiementJours),
  );
  const [tauxTva, setTauxTva] = useState(
    String(existant?.tauxTva ?? (reglages.tvaApplicable ? reglages.tauxTvaDefaut : 0)),
  );
  const [notes, setNotes] = useState(existant?.notes ?? '');
  const [lignes, setLignes] = useState<LigneSaisie[]>(
    existant && existant.lignes.length > 0
      ? existant.lignes.map((ligne) => ({
          id: ligne.id,
          designation: ligne.designation,
          quantite: String(ligne.quantite),
          prixUnitaire: String(ligne.prixUnitaire),
        }))
      : [ligneVide()],
  );

  const totalHt = lignes.reduce(
    (somme, ligne) => somme + versNombre(ligne.quantite) * versNombre(ligne.prixUnitaire),
    0,
  );
  const montantTva = totalHt * (versNombre(tauxTva) / 100);

  const majLigne = (id: string, champ: keyof Omit<LigneSaisie, 'id'>, valeur: string) =>
    setLignes((actuel) =>
      actuel.map((ligne) => (ligne.id === id ? { ...ligne, [champ]: valeur } : ligne)),
    );

  const retirerLigne = (id: string) =>
    setLignes((actuel) => (actuel.length === 1 ? actuel : actuel.filter((l) => l.id !== id)));

  const enregistrer = () => {
    if (clientId === '') {
      Alert.alert('Client manquant', 'Choisissez le client concerné par ce document.');
      return;
    }

    const lignesValides: Ligne[] = lignes
      .filter((ligne) => ligne.designation.trim() !== '')
      .map((ligne) => ({
        id: ligne.id,
        designation: ligne.designation.trim(),
        quantite: versNombre(ligne.quantite),
        prixUnitaire: versNombre(ligne.prixUnitaire),
      }));

    if (lignesValides.length === 0) {
      Alert.alert('Aucune prestation', 'Renseignez au moins une ligne avec sa désignation.');
      return;
    }

    const identifiant = enregistrerDocument(
      {
        type,
        clientId,
        // Un document existant garde son statut ; un nouveau démarre en brouillon.
        statut: existant?.statut ?? 'brouillon',
        lignes: lignesValides,
        tauxTva: versNombre(tauxTva),
        dateEmission,
        dateEcheance: type === 'facture' ? dateEcheance : '',
        notes,
        ...(existant?.issuDuDevisId ? { issuDuDevisId: existant.issuDuDevisId } : {}),
      },
      params.id,
    );

    if (params.id) {
      router.back();
    } else {
      // Après création, on remplace l'écran d'édition par la fiche : le retour
      // ramène à la liste, pas à un formulaire déjà validé.
      router.replace(`/documents/${identifiant}`);
    }
  };

  return (
    <Ecran>
      <Stack.Screen
        options={{ title: params.id ? `Modifier ${existant?.numero ?? ''}`.trim() : 'Nouveau document' }}
      />

      <Carte>
        <Pastilles
          label="Type"
          options={TYPES}
          valeur={type}
          libelle={(option) => (option === 'devis' ? 'Devis' : 'Facture')}
          onChange={setType}
        />

        <Pastilles
          label="Client"
          options={clients.map((client) => client.id)}
          valeur={clientId}
          libelle={(id) => clients.find((client) => client.id === id)?.nom ?? 'Client'}
          onChange={setClientId}
        />

        <Champ
          label="Date d'émission (AAAA-MM-JJ)"
          value={dateEmission}
          onChangeText={setDateEmission}
          placeholder="2026-07-30"
          autoCorrect={false}
        />

        {type === 'facture' ? (
          <Champ
            label="Échéance (AAAA-MM-JJ)"
            value={dateEcheance}
            onChangeText={setDateEcheance}
            placeholder="2026-08-29"
            autoCorrect={false}
          />
        ) : null}

        <Champ
          label="Taux de TVA (%)"
          value={tauxTva}
          onChangeText={setTauxTva}
          keyboardType="decimal-pad"
          placeholder="0"
        />
      </Carte>

      <SousTitre>Prestations</SousTitre>

      {lignes.map((ligne, index) => (
        <Carte key={ligne.id}>
          <View style={styles.enteteLigne}>
            <Text style={styles.indexLigne}>Ligne {index + 1}</Text>
            {lignes.length > 1 ? (
              <Pressable onPress={() => retirerLigne(ligne.id)} hitSlop={8}>
                <Text style={styles.retirer}>Retirer</Text>
              </Pressable>
            ) : null}
          </View>

          <Champ
            label="Désignation"
            value={ligne.designation}
            onChangeText={(valeur) => majLigne(ligne.id, 'designation', valeur)}
            placeholder="Création du site vitrine"
          />

          <View style={styles.duo}>
            <View style={styles.moitie}>
              <Champ
                label="Quantité"
                value={ligne.quantite}
                onChangeText={(valeur) => majLigne(ligne.id, 'quantite', valeur)}
                keyboardType="decimal-pad"
                placeholder="1"
              />
            </View>
            <View style={styles.moitie}>
              <Champ
                label="Prix unitaire HT"
                value={ligne.prixUnitaire}
                onChangeText={(valeur) => majLigne(ligne.id, 'prixUnitaire', valeur)}
                keyboardType="decimal-pad"
                placeholder="250"
              />
            </View>
          </View>

          <Text style={styles.sousTotal}>
            Sous-total : {euros(versNombre(ligne.quantite) * versNombre(ligne.prixUnitaire))}
          </Text>
        </Carte>
      ))}

      <Bouton
        titre="+ Ajouter une ligne"
        variante="secondaire"
        onPress={() => setLignes((actuel) => [...actuel, ligneVide()])}
      />

      <Carte>
        <View style={styles.totalLigne}>
          <Text style={styles.totalLabel}>Total HT</Text>
          <Text style={styles.totalValeur}>{euros(totalHt)}</Text>
        </View>
        <View style={styles.totalLigne}>
          <Text style={styles.totalLabel}>TVA ({versNombre(tauxTva)} %)</Text>
          <Text style={styles.totalValeur}>{euros(montantTva)}</Text>
        </View>
        <Separateur />
        <View style={styles.totalLigne}>
          <Text style={styles.totalLabelFort}>Total TTC</Text>
          <Text style={styles.totalValeurFort}>{euros(totalHt + montantTva)}</Text>
        </View>
      </Carte>

      <Carte>
        <Champ
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Conditions, délais, mentions particulières…"
          multiline
        />
      </Carte>

      <Bouton titre="Enregistrer" onPress={enregistrer} />
      <Bouton titre="Annuler" variante="secondaire" onPress={() => router.back()} />
    </Ecran>
  );
}

const styles = StyleSheet.create({
  enteteLigne: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  indexLigne: {
    ...typo.etiquette,
    color: couleurs.discret,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  retirer: {
    ...typo.petit,
    fontWeight: '600',
    color: couleurs.danger,
  },
  duo: {
    flexDirection: 'row',
    gap: espace.md,
  },
  moitie: {
    flex: 1,
  },
  sousTotal: {
    ...typo.petit,
    color: couleurs.accent,
    fontWeight: '700',
    backgroundColor: couleurs.surfaceDouce,
    borderRadius: rayon.sm,
    paddingVertical: espace.sm,
    paddingHorizontal: espace.md,
    overflow: 'hidden',
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
});
