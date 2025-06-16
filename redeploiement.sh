#!/bin/bash

# Définir les chemins nécessaires
dossierRacine=$(pwd)  # Le dossier racine du site est le dossier courant
dossierDistRacine="$dossierRacine/dist"  # Dossier de destination à la racine

# Nom de l'application PM2 (défini dans ecosystem.config.js)
nomApplication="Safesec Formation"

# Mettre à jour le dépôt avec git en premier
git pull origin

# Supprimer les dossiers dist à la racine et dans frontend
rm -rf $dossierDistRacine
rm -rf $dossierRacine/frontend/dist  # On supprime tout le dossier dist dans frontend

# Se déplacer dans le dossier frontend pour le build
cd frontend/

# Gérer le build du frontend
npm run build

# Attendre la fin du processus de build
wait

# Revenir au dossier racine
cd $dossierRacine

# Trouver le dossier dans frontend/dist
dossierDistFrontend=$(find "$dossierRacine/frontend/dist" -mindepth 1 -maxdepth 1 -type d)

# Copier le dossier trouvé dans frontend/dist vers la racine et le renommer dist
if [ -d "$dossierDistFrontend" ]; then
    cp -r $dossierDistFrontend $dossierDistRacine
else
    echo "Erreur : Aucun dossier trouvé dans frontend/dist"
    exit 1
fi

# Redémarrer ou démarrer l'application avec PM2
if pm2 describe "$nomApplication" > /dev/null; then
    echo "Redémarrage de l'application '$nomApplication' avec PM2..."
    pm2 restart "$nomApplication"
else
    echo "L'application '$nomApplication' n'est pas en cours. Tentative de démarrage via ecosystem_production.config.js..."
    pm2 start ecosystem_production.config.js --only "$nomApplication"

    # Vérifier si le démarrage a réussi
    if pm2 describe "$nomApplication" > /dev/null; then
        echo "Application '$nomApplication' démarrée avec succès."
    else
        echo "Erreur : Impossible de démarrer l'application '$nomApplication'."
        exit 1
    fi
fi
