import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Bouton, CarteBouton, Champ, Ecran, Vide } from '@/components/ui';
import { euros, totaux } from '@/format';
import { useDonnees } from '@/store';
import { couleurs, espace, typo } from '@/theme';

export default function EcranClients() {
  const { clients, documents } = useDonnees();
  const router = useRouter();
  const [recherche, setRecherche] = useState('');

  const resultats = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    return clients
      .filter((client) =>
        terme === ''
          ? true
          : [client.nom, client.contact, client.email].some((champ) =>
              champ.toLowerCase().includes(terme),
            ),
      )
      .sort((a, b) => a.nom.localeCompare(b.nom));
  }, [clients, recherche]);

  /** Montant déjà encaissé auprès d'un client, pour le situer d'un coup d'œil. */
  const encaisse = (clientId: string) =>
    documents
      .filter((doc) => doc.clientId === clientId && doc.type === 'facture' && doc.statut === 'paye')
      .reduce((somme, doc) => somme + totaux(doc).ttc, 0);

  const nombreDocuments = (clientId: string) =>
    documents.filter((doc) => doc.clientId === clientId).length;

  return (
    <Ecran titre="Clients" sousTitre={`${clients.length} client(s)`} hautSecurise>
      <Bouton titre="+ Nouveau client" onPress={() => router.push('/clients/edition')} />

      {clients.length > 0 ? (
        <Champ
          label="Rechercher"
          value={recherche}
          onChangeText={setRecherche}
          placeholder="Nom, contact ou email"
          autoCorrect={false}
        />
      ) : null}

      {clients.length === 0 ? (
        <Vide
          titre="Aucun client pour l'instant"
          texte="Ajoutez votre premier client pour pouvoir lui créer des devis et des factures."
        />
      ) : resultats.length === 0 ? (
        <Vide titre="Aucun résultat" texte="Aucun client ne correspond à cette recherche." />
      ) : (
        resultats.map((client) => (
          <CarteBouton key={client.id} onPress={() => router.push(`/clients/${client.id}`)}>
            <Text style={styles.nom}>{client.nom}</Text>
            {client.contact ? <Text style={styles.detail}>{client.contact}</Text> : null}
            {client.email ? <Text style={styles.detail}>{client.email}</Text> : null}
            <View style={styles.pied}>
              <Text style={styles.meta}>{nombreDocuments(client.id)} document(s)</Text>
              <Text style={styles.montant}>{euros(encaisse(client.id))} encaissés</Text>
            </View>
          </CarteBouton>
        ))
      )}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  nom: {
    ...typo.sousTitre,
    color: couleurs.texte,
  },
  detail: {
    ...typo.petit,
    color: couleurs.discret,
  },
  pied: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: espace.xs,
  },
  meta: {
    ...typo.petit,
    color: couleurs.discret,
  },
  montant: {
    ...typo.petit,
    fontWeight: '700',
    color: couleurs.accent,
  },
});
