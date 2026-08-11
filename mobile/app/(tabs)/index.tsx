import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Bouton, Carte, CarteBouton, Ecran, SousTitre, Vide } from '@/components/ui';
import { dateFr, enRetard, euros, totaux } from '@/format';
import { useDonnees } from '@/store';
import { couleurs, espace, typo } from '@/theme';

export default function TableauDeBord() {
  const { pret, documents, clients, reglages, client } = useDonnees();
  const router = useRouter();

  const indicateurs = useMemo(() => {
    const anneeCourante = String(new Date().getFullYear());
    const factures = documents.filter((doc) => doc.type === 'facture');

    const encaisse = factures
      .filter((doc) => doc.statut === 'paye' && doc.dateEmission.startsWith(anneeCourante))
      .reduce((somme, doc) => somme + totaux(doc).ttc, 0);

    const aEncaisser = factures
      .filter((doc) => doc.statut === 'envoye')
      .reduce((somme, doc) => somme + totaux(doc).ttc, 0);

    const devisEnAttente = documents.filter(
      (doc) => doc.type === 'devis' && doc.statut === 'envoye',
    );

    const retards = factures.filter(enRetard);

    return { encaisse, aEncaisser, devisEnAttente, retards, anneeCourante };
  }, [documents]);

  const recents = useMemo(
    () => [...documents].sort((a, b) => b.creeLe.localeCompare(a.creeLe)).slice(0, 5),
    [documents],
  );

  if (!pret) {
    return (
      <Ecran hautSecurise>
        <Text style={styles.chargement}>Chargement…</Text>
      </Ecran>
    );
  }

  const premierDemarrage = clients.length === 0 && documents.length === 0;

  return (
    <Ecran
      titre={reglages.entreprise || 'Tableau de bord'}
      sousTitre="Votre activité en un coup d'œil"
      hautSecurise
    >
      {premierDemarrage ? (
        <>
          <Vide
            titre="Bienvenue 👋"
            texte="Commencez par créer un client, puis établissez son premier devis. Tout reste enregistré sur votre téléphone."
          />
          <Bouton titre="Créer mon premier client" onPress={() => router.push('/clients/edition')} />
        </>
      ) : null}

      <View style={styles.grille}>
        <Carte style={styles.tuile}>
          <Text style={styles.tuileLabel}>Encaissé en {indicateurs.anneeCourante}</Text>
          <Text style={styles.tuileValeur}>{euros(indicateurs.encaisse)}</Text>
        </Carte>
        <Carte style={styles.tuile}>
          <Text style={styles.tuileLabel}>À encaisser</Text>
          <Text style={[styles.tuileValeur, styles.tuileValeurAttente]}>
            {euros(indicateurs.aEncaisser)}
          </Text>
        </Carte>
      </View>

      <View style={styles.grille}>
        <Carte style={styles.tuile}>
          <Text style={styles.tuileLabel}>Devis en attente</Text>
          <Text style={styles.tuileValeur}>{indicateurs.devisEnAttente.length}</Text>
        </Carte>
        <Carte style={styles.tuile}>
          <Text style={styles.tuileLabel}>Clients</Text>
          <Text style={styles.tuileValeur}>{clients.length}</Text>
        </Carte>
      </View>

      {indicateurs.retards.length > 0 ? (
        <>
          <SousTitre>Factures en retard</SousTitre>
          {indicateurs.retards.map((doc) => (
            <CarteBouton key={doc.id} onPress={() => router.push(`/documents/${doc.id}`)}>
              <View style={styles.ligneCarte}>
                <Text style={styles.numero}>{doc.numero}</Text>
                <Badge statut={doc.statut} retard />
              </View>
              <Text style={styles.detail}>
                {client(doc.clientId)?.nom ?? 'Client supprimé'} · échéance{' '}
                {dateFr(doc.dateEcheance)}
              </Text>
              <Text style={styles.montant}>{euros(totaux(doc).ttc)}</Text>
            </CarteBouton>
          ))}
        </>
      ) : null}

      {indicateurs.devisEnAttente.length > 0 ? (
        <>
          <SousTitre>Devis à relancer</SousTitre>
          {indicateurs.devisEnAttente.map((doc) => (
            <CarteBouton key={doc.id} onPress={() => router.push(`/documents/${doc.id}`)}>
              <View style={styles.ligneCarte}>
                <Text style={styles.numero}>{doc.numero}</Text>
                <Badge statut={doc.statut} />
              </View>
              <Text style={styles.detail}>
                {client(doc.clientId)?.nom ?? 'Client supprimé'} · envoyé le{' '}
                {dateFr(doc.dateEmission)}
              </Text>
              <Text style={styles.montant}>{euros(totaux(doc).ttc)}</Text>
            </CarteBouton>
          ))}
        </>
      ) : null}

      {recents.length > 0 ? (
        <>
          <SousTitre>Activité récente</SousTitre>
          {recents.map((doc) => (
            <CarteBouton key={doc.id} onPress={() => router.push(`/documents/${doc.id}`)}>
              <View style={styles.ligneCarte}>
                <Text style={styles.numero}>{doc.numero}</Text>
                <Badge statut={doc.statut} retard={enRetard(doc)} />
              </View>
              <Text style={styles.detail}>{client(doc.clientId)?.nom ?? 'Client supprimé'}</Text>
              <Text style={styles.montant}>{euros(totaux(doc).ttc)}</Text>
            </CarteBouton>
          ))}
        </>
      ) : null}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  chargement: {
    ...typo.corps,
    color: couleurs.discret,
    textAlign: 'center',
    marginTop: espace.xxl,
  },
  grille: {
    flexDirection: 'row',
    gap: espace.md,
  },
  tuile: {
    flex: 1,
    gap: espace.xs,
  },
  tuileLabel: {
    ...typo.etiquette,
    color: couleurs.discret,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tuileValeur: {
    ...typo.sousTitre,
    color: couleurs.accent,
  },
  tuileValeurAttente: {
    color: couleurs.attente,
  },
  ligneCarte: {
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
