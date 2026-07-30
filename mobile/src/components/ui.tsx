import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { couleurs, espace, rayon, typo } from '../theme';
import { LIBELLES_STATUT, type Statut } from '../types';

/**
 * Conteneur d'écran : fond de marque, titre optionnel, défilement.
 * `hautSecurise` réserve la place de la barre d'état ; à activer sur les
 * écrans sans en-tête de navigation (les onglets), sinon le titre passe
 * sous l'encoche.
 */
export function Ecran({
  titre,
  sousTitre,
  children,
  hautSecurise = false,
}: {
  titre?: string;
  sousTitre?: string;
  children: ReactNode;
  hautSecurise?: boolean;
}) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.ecran}
      contentContainerStyle={[
        styles.contenu,
        hautSecurise && { paddingTop: insets.top + espace.md },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {titre ? (
        <View style={styles.entete}>
          <Text style={styles.titre}>{titre}</Text>
          {sousTitre ? <Text style={styles.sousTitreEntete}>{sousTitre}</Text> : null}
        </View>
      ) : null}
      {children}
    </ScrollView>
  );
}

export function Carte({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.carte, style]}>{children}</View>;
}

/** Carte cliquable, utilisée pour les éléments de liste. */
export function CarteBouton({ children, onPress }: { children: ReactNode; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.carte, pressed && styles.pressee]}
    >
      {children}
    </Pressable>
  );
}

export function SousTitre({ children }: { children: ReactNode }) {
  return <Text style={styles.sousTitre}>{children}</Text>;
}

export type VarianteBouton = 'principal' | 'secondaire' | 'danger';

export function Bouton({
  titre,
  onPress,
  variante = 'principal',
  desactive = false,
}: {
  titre: string;
  onPress: () => void;
  variante?: VarianteBouton;
  desactive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desactive}
      style={({ pressed }) => [
        styles.bouton,
        variante === 'principal' && styles.boutonPrincipal,
        variante === 'secondaire' && styles.boutonSecondaire,
        variante === 'danger' && styles.boutonDanger,
        pressed && styles.pressee,
        desactive && styles.boutonDesactive,
      ]}
    >
      <Text
        style={[
          styles.boutonTexte,
          variante === 'principal' && styles.boutonTextePrincipal,
          variante === 'secondaire' && styles.boutonTexteSecondaire,
          variante === 'danger' && styles.boutonTexteDanger,
        ]}
      >
        {titre}
      </Text>
    </Pressable>
  );
}

interface ChampProps extends TextInputProps {
  label: string;
}

export function Champ({ label, style, ...props }: ChampProps) {
  return (
    <View style={styles.champ}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.saisie, style]}
        placeholderTextColor={couleurs.discret}
        {...props}
      />
    </View>
  );
}

/** Sélecteur en pastilles, pour un choix parmi quelques options. */
export function Pastilles<T extends string>({
  label,
  options,
  valeur,
  libelle,
  onChange,
}: {
  label?: string;
  options: readonly T[];
  valeur: T;
  libelle?: (option: T) => string;
  onChange: (option: T) => void;
}) {
  return (
    <View style={styles.champ}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.pastilles}>
        {options.map((option) => {
          const actif = option === valeur;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              style={({ pressed }) => [
                styles.pastille,
                actif && styles.pastilleActive,
                pressed && styles.pressee,
              ]}
            >
              <Text style={[styles.pastilleTexte, actif && styles.pastilleTexteActif]}>
                {libelle ? libelle(option) : option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function Badge({ statut, retard = false }: { statut: Statut; retard?: boolean }) {
  const ton = retard ? 'danger' : tonDuStatut(statut);
  return (
    <View style={[styles.badge, styles[`badge_${ton}`]]}>
      <Text style={[styles.badgeTexte, styles[`badgeTexte_${ton}`]]}>
        {retard ? 'En retard' : LIBELLES_STATUT[statut]}
      </Text>
    </View>
  );
}

type Ton = 'succes' | 'attente' | 'danger' | 'neutre';

function tonDuStatut(statut: Statut): Ton {
  switch (statut) {
    case 'paye':
    case 'accepte':
      return 'succes';
    case 'envoye':
      return 'attente';
    case 'refuse':
      return 'danger';
    default:
      return 'neutre';
  }
}

/** Message affiché quand une liste est vide. */
export function Vide({ titre, texte }: { titre: string; texte: string }) {
  return (
    <Carte style={styles.vide}>
      <Text style={styles.videTitre}>{titre}</Text>
      <Text style={styles.videTexte}>{texte}</Text>
    </Carte>
  );
}

/** Couple libellé / valeur, pour les fiches de détail. */
export function LigneInfo({ label, valeur }: { label: string; valeur: string }) {
  return (
    <View style={styles.ligneInfo}>
      <Text style={styles.ligneInfoLabel}>{label}</Text>
      <Text style={styles.ligneInfoValeur}>{valeur || '—'}</Text>
    </View>
  );
}

export function Separateur() {
  return <View style={styles.separateur} />;
}

const styles = StyleSheet.create({
  ecran: {
    flex: 1,
    backgroundColor: couleurs.fond,
  },
  contenu: {
    padding: espace.lg,
    paddingBottom: espace.xxl * 2,
    gap: espace.md,
  },
  entete: {
    marginBottom: espace.xs,
  },
  titre: {
    ...typo.titre,
    color: couleurs.texte,
  },
  sousTitreEntete: {
    ...typo.petit,
    color: couleurs.discret,
    marginTop: espace.xs,
  },
  sousTitre: {
    ...typo.sousTitre,
    color: couleurs.texte,
    marginTop: espace.sm,
  },
  carte: {
    backgroundColor: couleurs.surface,
    borderRadius: rayon.lg,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    padding: espace.lg,
    gap: espace.sm,
  },
  pressee: {
    opacity: 0.7,
  },
  bouton: {
    borderRadius: rayon.plein,
    paddingVertical: espace.md,
    paddingHorizontal: espace.xl,
    alignItems: 'center',
    borderWidth: 1,
  },
  boutonPrincipal: {
    backgroundColor: couleurs.accent,
    borderColor: couleurs.accent,
  },
  boutonSecondaire: {
    backgroundColor: couleurs.surface,
    borderColor: couleurs.accent,
  },
  boutonDanger: {
    backgroundColor: couleurs.dangerFond,
    borderColor: couleurs.danger,
  },
  boutonDesactive: {
    opacity: 0.45,
  },
  boutonTexte: {
    ...typo.corps,
    fontWeight: '700',
  },
  boutonTextePrincipal: {
    color: '#ffffff',
  },
  boutonTexteSecondaire: {
    color: couleurs.accent,
  },
  boutonTexteDanger: {
    color: couleurs.danger,
  },
  champ: {
    gap: espace.xs,
  },
  label: {
    ...typo.etiquette,
    color: couleurs.discret,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  saisie: {
    backgroundColor: couleurs.surface,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    borderRadius: rayon.md,
    paddingHorizontal: espace.md,
    paddingVertical: espace.md,
    ...typo.corps,
    color: couleurs.texte,
  },
  pastilles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espace.sm,
  },
  pastille: {
    borderRadius: rayon.plein,
    borderWidth: 1,
    borderColor: couleurs.bordure,
    backgroundColor: couleurs.surface,
    paddingVertical: espace.sm,
    paddingHorizontal: espace.lg,
  },
  pastilleActive: {
    backgroundColor: couleurs.accentClair,
    borderColor: couleurs.accent,
  },
  pastilleTexte: {
    ...typo.petit,
    fontWeight: '600',
    color: couleurs.discret,
  },
  pastilleTexteActif: {
    color: couleurs.accentSombre,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: rayon.plein,
    paddingVertical: espace.xs,
    paddingHorizontal: espace.md,
  },
  badge_succes: { backgroundColor: couleurs.succesFond },
  badge_attente: { backgroundColor: couleurs.attenteFond },
  badge_danger: { backgroundColor: couleurs.dangerFond },
  badge_neutre: { backgroundColor: couleurs.neutreFond },
  badgeTexte: {
    ...typo.etiquette,
  },
  badgeTexte_succes: { color: couleurs.succes },
  badgeTexte_attente: { color: couleurs.attente },
  badgeTexte_danger: { color: couleurs.danger },
  badgeTexte_neutre: { color: couleurs.neutre },
  vide: {
    alignItems: 'center',
    paddingVertical: espace.xl,
  },
  videTitre: {
    ...typo.corps,
    fontWeight: '700',
    color: couleurs.texte,
    textAlign: 'center',
  },
  videTexte: {
    ...typo.petit,
    color: couleurs.discret,
    textAlign: 'center',
  },
  ligneInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: espace.lg,
  },
  ligneInfoLabel: {
    ...typo.petit,
    color: couleurs.discret,
  },
  ligneInfoValeur: {
    ...typo.petit,
    color: couleurs.texte,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  separateur: {
    height: 1,
    backgroundColor: couleurs.bordure,
  },
});
