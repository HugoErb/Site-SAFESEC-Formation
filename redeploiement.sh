#!/bin/bash

# Définir les chemins nécessaires
dossierRacine=$(pwd)  # Le dossier racine du site est le dossier courant
dossierDistFrontend="$dossierRacine/frontend/dist"
dossierDistRacine="$dossierRacine/dist"

# Supprimer le dossier dist à la racine
rm -rf $dossierDistRacine

# Mettre à jour le dépôt avec git
git pull origin

# Se déplacer dans le dossier frontend pour le build
cd frontend/

# Gérer le build du frontend
npm run build

# Attendre la fin du processus de build
wait

# Revenir au dossier racine
cd $dossierRacine

# Copier le dossier frontend/dist vers la racine et le renommer dist
cp -r $dossierDistFrontend $dossierDistRacine

# Redémarrer l'application avec PM2 (id 0 dans cet exemple)
pm2 restart 0
