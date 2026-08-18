# J1 — Remonter l'établi (Windows)

À faire devant le PC, pas au téléphone. Compte 2 à 3 h la première fois.
Chaque étape a une **vérification** : tant qu'elle ne passe pas, tu n'avances pas.

---

## Pourquoi WSL2 et pas Windows directement

Tu vas travailler avec Node, Postgres et des outils en ligne de commande conçus
pour Linux. Sur Windows natif, tu passeras un temps considérable sur des
problèmes de chemins, de fins de ligne et de permissions qui n'existent pas
ailleurs — et l'aide que tu trouveras en ligne supposera Linux ou macOS.

WSL2 te donne un vrai Ubuntu dans Windows, sans machine virtuelle à gérer et
sans quitter tes fenêtres habituelles. C'est ce qu'utilisent la plupart des
développeurs web sous Windows.

> Si WSL2 est bloqué sur ta machine (virtualisation désactivée en BIOS,
> Windows Famille ancien), tout le reste fonctionne en natif : installe Git,
> Node et VS Code avec `winget`, et utilise Windows Terminal + PowerShell.

---

## 1. Installer WSL2

Ouvre **PowerShell en administrateur** (clic droit sur le menu Démarrer →
Terminal (admin)) :

```powershell
wsl --install
```

Redémarre le PC. Au redémarrage, une fenêtre Ubuntu s'ouvre et demande un nom
d'utilisateur et un mot de passe : ce sont ceux de ta session Linux, sans
rapport avec ton compte Windows. Le mot de passe ne s'affiche pas quand tu le
tapes — c'est normal.

**Vérification** — dans PowerShell :

```powershell
wsl -l -v
```

Tu dois voir `Ubuntu` avec `VERSION 2`. Si tu vois `1`, corrige :
`wsl --set-version Ubuntu 2`.

À partir d'ici, **tout se passe dans le terminal Ubuntu**, plus dans PowerShell.

---

## 2. Mettre Ubuntu à jour

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential curl git
```

**Vérification** : `git --version` affiche un numéro.

---

## 3. Installer Node avec nvm

N'installe **pas** Node avec `apt` : tu ne pourras pas changer de version, et
tu en auras besoin.

La commande d'installation de nvm contient un numéro de version qui change
régulièrement. Prends la ligne à jour sur
<https://github.com/nvm-sh/nvm#install--update-script> (section « Install &
Update Script »), colle-la, puis ferme et rouvre le terminal.

```bash
nvm install --lts
nvm use --lts
```

**Vérification** :

```bash
node -v   # doit afficher v20 ou plus
npm -v
```

Si `nvm: command not found` après réouverture du terminal, c'est que le script
n'a pas écrit dans `~/.bashrc` — relis la sortie de l'installation.

---

## 4. Configurer git

```bash
git config --global user.name "Ton Prénom Nom"
git config --global user.email "ton@email.com"
git config --global init.defaultBranch main
git config --global pull.rebase false
```

Utilise l'adresse email associée à ton compte GitHub, sinon tes commits ne te
seront pas attribués.

**Vérification** : `git config --global --list` montre tes quatre lignes.

---

## 5. Clé SSH pour GitHub

Le mot de passe GitHub ne fonctionne plus pour git en ligne de commande.

```bash
ssh-keygen -t ed25519 -C "ton@email.com"
```

Appuie sur Entrée trois fois (emplacement par défaut, pas de phrase secrète pour
commencer). Puis affiche la clé **publique** :

```bash
cat ~/.ssh/id_ed25519.pub
```

Copie toute la ligne, et colle-la sur GitHub :
Settings → SSH and GPG keys → New SSH key.

> La clé publique (`.pub`) se partage. Le fichier sans `.pub` est ta clé
> privée : elle ne sort jamais de ta machine, ne se colle nulle part, ne se
> commit jamais.

**Vérification** :

```bash
ssh -T git@github.com
```

Réponds `yes` à la question de confiance. Tu dois lire
`Hi <ton-pseudo>! You've successfully authenticated`.

---

## 6. VS Code

Installe VS Code côté **Windows** (pas dans Ubuntu) depuis code.visualstudio.com,
puis ajoute l'extension **WSL** de Microsoft.

**Vérification** — dans le terminal Ubuntu :

```bash
cd ~
code .
```

VS Code s'ouvre et affiche `WSL: Ubuntu` en bas à gauche. C'est le signe que tu
édites bien les fichiers Linux, et pas une copie côté Windows.

---

## 7. Créer le dépôt du fil rouge

Un seul projet traversera les dix jours. Range-le dans le système de fichiers
Linux (`~/projets`), **jamais** dans `/mnt/c/...` : les performances y sont
mauvaises et les permissions cassent.

```bash
mkdir -p ~/projets && cd ~/projets
mkdir fil-rouge && cd fil-rouge
git init
npm init -y
```

Crée un `.gitignore` tout de suite — avant le premier commit, jamais après :

```bash
cat > .gitignore <<'GITIGNORE'
node_modules/
.env
.env.local
dist/
*.log
GITIGNORE
```

Un fichier `index.js` minimal, écrit à la main :

```js
console.log("Le fil rouge démarre.");
```

Ajoute le script de lancement dans `package.json` :

```json
"scripts": {
  "dev": "node index.js"
}
```

**Vérification** : `npm run dev` affiche ta phrase.

---

## 8. Premier commit poussé

```bash
git add .
git commit -m "Initialise le projet fil rouge"
```

Crée un dépôt **vide** sur GitHub (sans README, sans .gitignore), puis :

```bash
git remote add origin git@github.com:<ton-pseudo>/fil-rouge.git
git branch -M main
git push -u origin main
```

**Vérification finale du J1** : tu ouvres la page GitHub du dépôt depuis ton
téléphone et tu vois ton code. Le J1 est validé.

---

## Ce que tu dois savoir répondre avant de passer au J2

- Où sont physiquement tes fichiers : côté Windows ou côté Linux ? Comment le
  vérifies-tu ?
- Que contient `node_modules` et pourquoi il n'est jamais commité ?
- Quelle est la différence entre ta clé SSH publique et ta clé privée ?
- À quoi sert `git remote`, et que se passerait-il si tu te trompais d'URL ?

Si une réponse ne vient pas, note la question dans `je-ne-comprends-pas.md` à la
racine du projet. Ce fichier est le vrai livrable des dix jours.
