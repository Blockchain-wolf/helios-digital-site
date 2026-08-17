# Playbook — Vibe coder comme un pro

Objectif : produire du logiciel (et à terme du SaaS) de qualité professionnelle
en travaillant avec une IA, sans que la vitesse se paie en dette technique.

---

## 0. Le principe central

> Le vibe coding amateur délègue **l'écriture**.
> Le vibe coding pro délègue l'écriture mais garde **la spécification et la vérification**.

Tu ne lis pas moins de code : tu déplaces ton attention.

| Amateur | Pro |
|---|---|
| « fais-moi un dashboard » | spec + critères d'acceptation écrits avant |
| accepte le diff s'il « a l'air bon » | fait tourner les tests, ouvre l'app, lit le diff |
| corrige quand ça casse en prod | des garde-fous automatiques bloquent avant le merge |
| une session = une grosse feature | une session = 3-5 tranches vérifiables |
| se souvient des conventions | les conventions sont dans `CLAUDE.md` |

**Règle d'or** : la qualité ne vient jamais de ta discipline. Elle vient de
garde-fous automatiques qui te disent non. Ta discipline sert à *installer* les
garde-fous, une fois.

---

## 1. La boucle : Spec → Plan → Tranche → Vérif → Commit

### 1.1 Spec (5 min, avant tout prompt)

Écris trois choses. Toujours. Même pour une petite feature.

```
CONTEXTE   : qui utilise ça, dans quel écran, pourquoi
COMPORTEMENT : ce qui doit se passer, y compris les cas d'erreur
FAIT QUAND : critères d'acceptation observables
             ex. "un user non connecté sur /app est redirigé vers /login"
                 "un email déjà pris renvoie 409 avec un message affiché"
                 "le test d'intégration checkout passe"
```

Un prompt sans critères d'acceptation produit du code que tu ne peux pas juger.
C'est là que 90 % de la dette « vibe » se crée.

### 1.2 Plan (avant d'écrire une ligne)

Demande le plan, pas le code : *« quels fichiers, quelle approche, quels
compromis ? Ne code pas encore. »*

Tu cherches trois signaux :
- est-ce que l'IA a compris **où** ça se branche dans l'existant ?
- est-ce qu'elle réutilise le code déjà là, ou réinvente à côté ?
- est-ce que le découpage est incrémental (chaque étape mergeable) ?

Un plan mauvais coûte 30 secondes à corriger. Le code correspondant coûte 2 h.

### 1.3 Tranche (le découpage est LA compétence)

**Un changement = un diff que tu peux relire en entier.** Vise < 300 lignes.

Au-delà, tu passes en mode « ça a l'air bon » — et à partir de là tu ne
contrôles plus rien. Découpe :

```
❌ "implémente la facturation Stripe"
✅ 1. modèle + migration (subscription, plan, statut)     → mergeable
   2. checkout session + redirect                          → mergeable
   3. webhook + réconciliation d'état                      → mergeable
   4. portail client + gestion annulation                  → mergeable
```

Chaque tranche part de `main` à jour, part sur sa branche, et se termine par un
commit vert.

### 1.4 Vérif (non négociable)

Trois niveaux, dans l'ordre, à chaque tranche :

1. **La machine** : lint + types + tests. Vert, sans exception ignorée.
2. **Toi, sur le diff** : `git diff`. Tu lis *tout*. Tu cherches surtout :
   - autorisation manquante (l'endpoint vérifie-t-il *qui* appelle ?)
   - dépendance ajoutée dont tu n'as pas besoin
   - secret, clé, ou URL en dur
   - `TODO` / `any` / `catch {}` vide laissés derrière
   - test qui a été *modifié* pour passer au lieu que le code soit corrigé
3. **L'app réelle** : tu ouvres, tu cliques, tu casses volontairement.
   Un test vert ne prouve pas qu'une feature est utilisable.

> Si l'IA dit « c'est terminé et testé » et que tu n'as pas vu la sortie des
> tests toi-même — ce n'est pas testé.

### 1.5 Commit

Un commit = une idée. Message qui explique le **pourquoi**, pas le quoi
(le quoi est dans le diff).

```
❌ update files
❌ fix bug
✅ Corrige la double-facturation quand le webhook Stripe est rejoué

   Stripe renvoie le même event jusqu'à réception d'un 2xx. On stockait
   la souscription sans clé d'idempotence → doublon. On déduplique sur
   event.id avant traitement.
```

---

## 2. Les 4 garde-fous à installer AVANT la première feature

Sur un vrai projet SaaS, ceci se met en place le jour 1, pas « quand on aura le
temps ». C'est ce qui rend le vibe coding sûr : l'IA peut aller vite parce que
quelque chose la rattrape.

1. **Types stricts** — TypeScript `strict: true`, ou Python + `mypy`/`pyright`.
   Sans ça, l'IA produit du code plausible mais faux et rien ne le signale.
2. **Lint + format automatiques** — ESLint + Prettier (ou Ruff). Zéro débat de
   style, zéro bruit dans les diffs.
3. **Tests** — pas 100 % de couverture. Couvre :
   - chaque endpoint qui touche à l'argent ou aux permissions
   - chaque bug corrigé (test de non-régression, écrit *avant* le fix)
   - les parcours critiques en E2E (inscription → paiement → usage)
4. **CI qui bloque le merge** — GitHub Actions qui rejoue 1-3 sur chaque PR.
   Une CI qui n'empêche pas de merger ne sert à rien.

Bonus qui change tout au bout de 3 mois : **hooks pre-commit** (lint + types
sur les fichiers modifiés) et **Dependabot**.

---

## 3. `CLAUDE.md` : ta mémoire de projet

L'IA repart de zéro à chaque session. Les conventions que tu répètes à l'oral
sont perdues à chaque fois. Écris-les une fois, dans `CLAUDE.md` à la racine :
commandes du projet, architecture, conventions, pièges connus.

Règle : **chaque fois que tu corriges l'IA deux fois sur la même chose, c'est
une ligne à ajouter dans `CLAUDE.md`.** Ce fichier est un actif, il grossit avec
le projet. Voir celui de ce repo.

---

## 4. Comment prompter (ce qui marche vraiment)

**Donne du contexte, pas des ordres.** « Ajoute un cache » → l'IA devine tout.
« Cette requête met 800 ms parce qu'elle N+1 sur `orders.items`, sous charge on
attend 500 req/s » → l'IA résout le vrai problème.

**Pointe les fichiers.** `src/auth/session.ts:42` vaut mieux que « le truc
d'auth ».

**Impose la réutilisation.** « Suis le pattern de `UserRepository`, ne crée pas
une nouvelle abstraction. » Sans ça, l'IA a un biais fort pour créer du neuf à
côté de l'existant — c'est la principale source d'incohérence dans un codebase
vibe-codé.

**Fais-la travailler contre elle-même.** Après une grosse feature :
*« relis ce diff comme un reviewer senior hostile : cherche les cas limites, les
failles d'autorisation, ce qui casse sous concurrence. »* Extrêmement rentable.

**Refuse les réponses vagues.** « Ça devrait marcher » n'est pas une réponse.
Demande la preuve : sortie de test, capture, log.

---

## 5. Les pièges spécifiques au code généré

À chercher systématiquement dans un diff produit par IA :

- **Autorisation absente** — le code vérifie l'authentification (« es-tu
  connecté ? ») mais pas l'autorisation (« as-tu le droit sur *cette*
  ressource ? »). N°1 des failles en SaaS multi-tenant.
- **Fuite entre tenants** — une requête sans `WHERE org_id = ?`. Impose le
  filtrage au niveau du repository, jamais laissé à l'appelant.
- **Secrets en dur** — clés API, URLs de prod, tokens. Rien de sensible hors
  variables d'environnement, et `.env` dans `.gitignore` dès le premier commit.
- **Dépendances inventées ou superflues** — vérifie que chaque package ajouté
  existe, est maintenu, et est vraiment nécessaire.
- **Requêtes N+1** — l'IA écrit du code correct mais lent en boucle.
- **Migrations destructives** — un `DROP COLUMN` généré sans plan de rollback.
- **Gestion d'erreur décorative** — `try/catch` qui avale l'erreur en silence.
- **Tests qui testent le mock** — vert, mais ne prouvent rien.

---

## 6. Checklist « prêt pour un vrai SaaS payant »

Avant le premier client qui paie :

**Sécurité**
- [ ] auth solide (hash Argon2/bcrypt, sessions expirantes, rate limit sur login)
- [ ] autorisation testée par endpoint, y compris cas « autre tenant »
- [ ] toutes les entrées validées côté serveur (Zod/Pydantic), jamais confiance au client
- [ ] secrets en variables d'env, rotation possible
- [ ] HTTPS partout, headers de sécurité (CSP, HSTS)

**Données**
- [ ] backups automatiques + **une restauration testée pour de vrai**
- [ ] migrations versionnées et réversibles
- [ ] RGPD : export et suppression de compte réellement implémentés

**Paiement**
- [ ] webhooks idempotents (les events sont rejoués)
- [ ] états gérés : essai, actif, impayé, annulé, remboursé
- [ ] que se passe-t-il quand la carte est refusée ? (testé)

**Exploitation**
- [ ] logs structurés + tracking d'erreurs (Sentry)
- [ ] tu es alerté d'une panne avant tes clients
- [ ] déploiement automatisé et rollback en une commande
- [ ] environnement de staging distinct de la prod

**Produit**
- [ ] parcours d'onboarding testé sur un vrai utilisateur qui n'est pas toi
- [ ] états vides, chargement et erreur dessinés (pas juste le cas nominal)
- [ ] utilisable au clavier, contrastes suffisants
- [ ] mesuré : Lighthouse > 90, LCP < 2,5 s

---

## 7. Stack conseillée pour démarrer un SaaS

Choisis ennuyeux et bien documenté — l'IA est bien meilleure sur les stacks
matures.

- **Front + back** : Next.js (App Router) + TypeScript strict
- **Base** : Postgres (Supabase ou Neon) + Prisma ou Drizzle
- **Auth** : une brique existante (Clerk, Supabase Auth, Auth.js). N'écris
  jamais ton propre système d'auth pour un premier SaaS.
- **Paiement** : Stripe (Checkout + Customer Portal, pas une intégration maison)
- **Emails** : Resend
- **Hébergement** : Vercel / Railway / Fly.io
- **Qualité** : Vitest + Playwright, ESLint, Prettier, GitHub Actions
- **Observabilité** : Sentry + PostHog

Moins de pièces = moins de surface de bug. Ajoute quand le besoin est prouvé.

---

## 8. Exercice appliqué : ce repo

Ce site est un bon terrain d'entraînement. Ce qu'un œil pro y voit aujourd'hui :

1. **`images/Setup.exe` (5,2 Mo) n'est référencé nulle part** — un binaire mort
   versionné dans git. Il sera cloné par tout le monde, pour toujours. Leçon :
   *on ne commit jamais un binaire sans savoir pourquoi il est là.*
2. **Le favicon affiche la lettre « K », la marque est « HeliosDigital »** —
   incohérence qui survit parce que personne ne relit le diff en entier.
3. **~2 Mo de JPEG non optimisés** — aucun WebP/AVIF, aucun `srcset`.
   C'est le principal levier de performance du site.
4. **Aucun garde-fou** — pas de lint HTML, pas de vérif de liens morts, pas de
   CI. Rien ne t'empêche de casser le site en poussant.
5. **Le listener de scroll** (`script.js`) recalcule la mise en page à chaque
   événement — à passer en `requestAnimationFrame`.

Ordre de traitement conseillé, une tranche = une PR : 1 → 2 → 4 → 3 → 5.
Fais-en une chacune en appliquant la boucle du §1. C'est l'entraînement.

---

## 9. Les 5 phrases à retenir

1. Écris les critères d'acceptation avant le prompt.
2. Demande le plan avant le code.
3. Si le diff est trop gros pour être lu, il est trop gros pour être mergé.
4. « Ça devrait marcher » ne compte pas — seule la sortie des tests compte.
5. Chaque correction répétée deux fois devient une ligne de `CLAUDE.md`.
