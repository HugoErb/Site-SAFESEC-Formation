#!/bin/bash

# Charger NVM et rendre npm/pm2 disponibles dans un contexte systemd
export NVM_DIR="/home/ubuntu/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PATH="$NVM_DIR/versions/node/$(nvm version)/bin:$PATH"

# Sortie console + fichier log
exec > >(tee -a /home/ubuntu/Site-SAFESEC-Formation/redeploy.log) 2>&1
echo "======== $(date) | Déploiement SAFESec démarré ========"

# Aller dans le bon dossier
cd /home/ubuntu/Site-SAFESEC-Formation || exit 1

# Chemins
dossierRacine=$(pwd)
dossierDistRacine="$dossierRacine/dist"
dossierDistTemp="$dossierRacine/dist-next"
nomApplication="SafesecFormation"

# Déterminer les chemins dynamiques
NPM_CMD=$(which npm)
PM2_CMD=$(which pm2)

if [ -z "$NPM_CMD" ] || [ -z "$PM2_CMD" ]; then
    echo "Erreur : npm ou pm2 est introuvable dans l'environnement NVM"
    exit 1
fi

# Git pull
echo "Récupération des dernières modifications Git..."
git pull origin

# Installation reproductible et build du frontend
cd frontend || exit 1
echo "Installation des dépendances frontend..."
if ! $NPM_CMD ci; then
    echo "Erreur : L'installation des dépendances frontend a échoué. L'ancien site reste en ligne."
    exit 1
fi

echo "Lancement du build frontend..."
if ! $NPM_CMD run build; then
    echo "Erreur : Le build frontend a échoué. L'ancien site reste en ligne."
    exit 1
fi

# Préparer le nouveau build sans interrompre la version en ligne
cd "$dossierRacine"
dossierDistFrontend=$(find "$dossierRacine/frontend/dist" -mindepth 1 -maxdepth 1 -type d)
dossierNavigateur="$dossierDistFrontend/browser"

if [ -d "$dossierNavigateur" ]; then
    echo "Préparation du build dans $dossierDistTemp"
    rm -rf "$dossierDistTemp"
    mkdir -p "$dossierDistTemp"
    cp -r "$dossierNavigateur"/. "$dossierDistTemp"/
elif [ -d "$dossierDistFrontend" ]; then
    # Compatibilité avec l'ancien format de sortie Angular.
    echo "Préparation du build Angular classique dans $dossierDistTemp"
    rm -rf "$dossierDistTemp"
    mkdir -p "$dossierDistTemp"
    cp -r "$dossierDistFrontend"/. "$dossierDistTemp"/
else
    echo "Erreur : Aucun build exploitable trouvé. L'ancien site reste en ligne."
    exit 1
fi

# Le remplacement n'a lieu qu'une fois le nouveau build entièrement prêt.
echo "Mise en ligne du nouveau build..."
rm -rf "$dossierDistRacine"
mv "$dossierDistTemp" "$dossierDistRacine"

# Lancement/redémarrage avec PM2
echo "(Re)démarrage de l'application '$nomApplication' via PM2..."
$PM2_CMD startOrRestart ecosystem_production.config.js --only "$nomApplication"

applicationPid=$($PM2_CMD pid "$nomApplication")
if [[ "$applicationPid" =~ ^[1-9][0-9]*$ ]]; then
    echo "Application '$nomApplication' active après startOrRestart."
else
    echo "Erreur : L'application '$nomApplication' n'a pas pu être lancée."
    exit 1
fi

echo "======== Déploiement Safesec Formation terminé avec succès ========"
