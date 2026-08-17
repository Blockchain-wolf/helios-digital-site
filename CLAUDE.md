# HeliosDigital — instructions projet

Site vitrine de l'agence HeliosDigital. Ce fichier est lu automatiquement au
début de chaque session : il évite de répéter les mêmes consignes.

## Nature du projet

Site **statique**, sans build ni framework : HTML + CSS + JavaScript vanilla,
servi tel quel. Pas de bundler, pas de `node_modules`, pas d'étape de compilation.
**Ne pas introduire de framework, de bundler ou de dépendance npm** sans que ce
soit demandé explicitement.

## Structure

| Fichier | Rôle |
|---|---|
| `index.html` | page principale (hero, offres, process, contact) |
| `projets.html` | portfolio |
| `cgv.html`, `mentions-legales.html` | pages légales (pas de menu de nav) |
| `404.html` | page d'erreur |
| `style.css` | toutes les styles, versionné par `?v=N` dans les `<link>` |
| `script.js` | menu, barre de progression, carrousel, apparition des sections |
| `testimonials.js` | avis clients, rendus depuis un tableau JS |
| `sitemap.xml`, `robots.txt` | SEO |

Déploiement : GitHub Pages sur `master`.

## Lancer en local

```bash
python3 -m http.server 8000   # puis http://localhost:8000
```

## Conventions à respecter

- **Langue** : tout le contenu visible et les commentaires de code sont en
  français. Le tutoiement est utilisé dans les textes du site.
- **JS défensif** : chaque script s'exécute sur plusieurs pages. Toujours
  vérifier l'existence d'un élément avant de brancher un listener
  (`if (element) { ... }`) — les pages légales n'ont ni menu ni carrousel.
- **Cache CSS** : toute modification de `style.css` impose d'incrémenter `?v=N`
  dans **tous** les fichiers HTML qui le référencent, sinon les visiteurs
  gardent l'ancienne feuille de style.
- **Accessibilité** — acquis à ne pas casser : skip-link, `aria-label` sur les
  contrôles, `aria-current` sur les points du carrousel, respect de
  `prefers-reduced-motion` (pas de défilement auto si l'utilisateur le refuse).
- **Pas de contenu inventé** : jamais de faux avis, faux chiffres, fausses
  références clients — y compris dans les données structurées JSON-LD, où c'est
  sanctionné par Google. `testimonials.js` masque la section tant que le tableau
  est vide : conserver ce comportement.
- **Images** : optimiser avant d'ajouter (viser < 200 Ko). Aucun binaire non
  utilisé par le site ne doit être commité.
- **SEO** : toute nouvelle page doit être ajoutée à `sitemap.xml` et porter
  `<title>`, `<meta name="description">` et `<link rel="canonical">`.

## Vérifications avant de proposer un changement

Pas de CI sur ce repo pour l'instant — les vérifications sont manuelles :

1. Ouvrir la page modifiée en local, en desktop **et** en mobile (devtools).
2. Naviguer au clavier : le skip-link et le menu restent utilisables.
3. Vérifier qu'aucun lien interne n'est cassé.
4. Relire le diff : pas de secret, pas de binaire, pas de `console.log` oublié.

## Dette connue (à traiter, une PR par point)

- `images/Setup.exe` (5,2 Mo) n'est référencé par aucune page — à supprimer.
- Le favicon inline affiche la lettre « K » alors que la marque est
  « HeliosDigital ».
- Les JPEG du hero et des projets ne sont ni optimisés ni servis en WebP/AVIF,
  et il n'y a pas de `srcset`.
- Le listener de scroll de `script.js` recalcule la mise en page à chaque
  événement : à passer en `requestAnimationFrame`.
- Aucune CI : ni vérification de liens morts, ni lint HTML.

## Méthode de travail

Voir `docs/playbook-vibe-coding.md` — spec avec critères d'acceptation, plan
avant code, tranches < 300 lignes, vérification avant commit.
