# Helios Pro — app mobile de gestion freelance

Application mobile (iOS + Android) pour piloter l'activité HeliosDigital :
clients, devis, factures et suivi des encaissements.

Construite avec **Expo SDK 57**, **React Native 0.86**, **TypeScript** et
**expo-router**. Toutes les données sont stockées **localement sur le téléphone**
(AsyncStorage) : aucun serveur, aucun compte, rien qui sorte de l'appareil.

## Lancer l'app

```bash
cd mobile
npm install
npm start
```

Un QR code s'affiche dans le terminal. Installez **Expo Go** sur votre téléphone
([iOS](https://apps.apple.com/app/expo-go/id982107779) /
[Android](https://play.google.com/store/apps/details?id=host.exp.exponent)),
puis scannez-le : l'app se charge sur le téléphone, et chaque sauvegarde de
fichier la recharge automatiquement.

Aucun Xcode ni Android Studio n'est nécessaire à ce stade.

## Scripts

| Commande            | Effet                                        |
| ------------------- | -------------------------------------------- |
| `npm start`         | Serveur de développement + QR code           |
| `npm run ios`       | Ouvre sur un simulateur iOS (macOS requis)   |
| `npm run android`   | Ouvre sur un émulateur Android               |
| `npm run typecheck` | Vérifie les types TypeScript (`tsc --noEmit`) |

## Structure

```
app/                        Routes (expo-router : un fichier = un écran)
  _layout.tsx               Pile de navigation + fournisseur de données
  (tabs)/                   Les 4 onglets du bas
    index.tsx               Tableau de bord
    clients.tsx             Liste des clients
    documents.tsx           Liste des devis & factures
    reglages.tsx            Infos d'émetteur, TVA, délai de paiement
  clients/[id].tsx          Fiche d'un client
  clients/edition.tsx       Formulaire client (création et modification)
  documents/[id].tsx        Fiche d'un devis / d'une facture
  documents/edition.tsx     Éditeur avec lignes de prestation

src/
  types.ts                  Modèles de données et statuts
  store.tsx                 État global + opérations (contexte React)
  storage.ts                Lecture / écriture AsyncStorage
  format.ts                 Montants, dates, totaux, numérotation
  theme.ts                  Palette reprise du site (../style.css)
  components/ui.tsx         Composants partagés (Ecran, Carte, Champ, Badge…)
```

## Fonctionnement métier

- **Numérotation automatique** : `D-2026-001` pour les devis, `F-2026-001` pour
  les factures. La séquence est propre à chaque type et repart à 1 chaque année.
- **Statuts** — devis : brouillon → envoyé → accepté / refusé.
  Factures : brouillon → envoyé → payé.
- **Retard de paiement** : une facture envoyée dont l'échéance est dépassée
  remonte automatiquement sur le tableau de bord.
- **Devis accepté → facture** : un bouton reprend les lignes du devis dans une
  nouvelle facture, en gardant le lien entre les deux documents.
- **TVA** : désactivée par défaut (franchise micro-entreprise). Activable dans
  les réglages, avec un taux par défaut appliqué aux nouveaux documents.
- **Supprimer un client** supprime aussi ses devis et factures, pour ne pas
  laisser de documents orphelins.

## Limites connues

- Les données vivent sur un seul appareil : pas de synchronisation entre
  téléphones, et une désinstallation les efface. Une sauvegarde/export reste à
  faire.
- Les dates se saisissent au format `AAAA-MM-JJ` dans un champ texte (pas encore
  de sélecteur de calendrier).
- Pas encore d'export PDF ni d'envoi de devis/facture par email.
