import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Bouton, CarteBouton, Ecran, Pastilles, Vide } from '@/components/ui';
import { dateFr, enRetard, euros, totaux } from '@/format';
import { useDonnees } from '@/store';
import { couleurs, espace, typo } from '@/theme';

const FILTRES = ['tous', 'devis', 'factures', 'impayés'] as const;
type Filtre = (typeof FILTRES)[number];

const LIBELLES: Record<Filtre, string> = {
  tous: 'Tous',
  devis: 'Devis',
  factures: 'Factures',
  impayés: 'À encaisser',
};

export default function EcranDocuments() {
  const { documents, clients, client } = useDonnees();
  const router = useRouter();
  const [filtre, setFiltre] = useState<Filtre>('tous');

  const resultats = useMemo(() => {
    const garde = (doc: (typeof documents)[number]) => {
      switch (filtre) {
        case 'devis':
          return doc.type === 'devis';
        case 'factures':
          return doc.type === 'facture';
        case 'impayés':
          return doc.type === 'facture' && doc.statut !== 'paye';
        default:
          return true;
      }
    };
    // Les documents les plus récents en premier : c'est ce qu'on consulte.
    return documents.filter(garde).sort((a, b) => b.creeLe.localeCompare(a.creeLe));
  }, [documents, filtre]);

  const aucunClient = clients.length === 0;

  return (
    <Ecran titre="Devis & factures" sousTitre={`${documents.length} document(s)`} hautSecurise>
      <Bouton
        titre="+ Nouveau document"
        onPress={() => router.push('/documents/edition')}
        desactive={aucunClient}
      />
      {aucunClient ? (
        <Vide
          titre="Ajoutez d'abord un client"
          texte="Un devis ou une facture est toujours rattaché à un client."
        />
      ) : null}

      {documents.length > 0 ? (
        <Pastilles
          options={FILTRES}
          valeur={filtre}
          libelle={(option) => LIBELLES[option]}
          onChange={setFiltre}
        />
      ) : null}

      {documents.length === 0 ? (
        !aucunClient ? (
          <Vide
            titre="Aucun document"
            texte="Créez votre premier devis pour commencer le suivi."
          />
        ) : null
      ) : resultats.length === 0 ? (
        <Vide titre="Aucun résultat" texte="Aucun document ne correspond à ce filtre." />
      ) : (
        resultats.map((doc) => (
          <CarteBouton key={doc.id} onPress={() => router.push(`/documents/${doc.id}`)}>
            <View style={styles.entete}>
              <Text style={styles.numero}>{doc.numero}</Text>
              <Badge statut={doc.statut} retard={enRetard(doc)} />
            </View>
            <Text style={styles.client}>{client(doc.clientId)?.nom ?? 'Client supprimé'}</Text>
            <View style={styles.pied}>
              <Text style={styles.detail}>{dateFr(doc.dateEmission)}</Text>
              <Text style={styles.montant}>{euros(totaux(doc).ttc)}</Text>
            </View>
          </CarteBouton>
        ))
      )}
    </Ecran>
  );
}

const styles = StyleSheet.create({
  entete: {
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
  client: {
    ...typo.corps,
    color: couleurs.texte,
  },
  pied: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
