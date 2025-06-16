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

# Nettoyage
echo "Suppression des anciens builds..."
rm -rf "$dossierDistRacine"
rm -rf "$dossierRacine/frontend/dist"

# Build frontend
echo "Lancement du build frontend..."
cd frontend || exit 1
$NPM_CMD run build

# Copier le résultat
cd "$dossierRacine"
dossierDistFrontend=$(find "$dossierRacine/frontend/dist" -mindepth 1 -maxdepth 1 -type d)

if [ -d "$dossierDistFrontend" ]; then
    echo "Copie du build vers $dossierDistRacine"
    cp -r "$dossierDistFrontend" "$dossierDistRacine"
else
    echo "Erreur : Aucun dossier trouvé dans frontend/dist"
    exit 1
fi

# Lancement/redémarrage avec PM2
echo "(Re)démarrage de l'application '$nomApplication' via PM2..."
$PM2_CMD startOrRestart ecosystem_production.config.js --only "$nomApplication"

if $PM2_CMD describe "$nomApplication" > /dev/null; then
    echo "Application '$nomApplication' active après startOrRestart."
else
    echo "Erreur : L'application '$nomApplication' n'a pas pu être lancée."
    exit 1
fi

echo "======== Déploiement Safesec Formation terminé avec succès ========"
