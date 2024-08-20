#!/bin/bash

# Définissez vos chemins
dossierCourant=$(pwd)
root="$dossierCourant"  # La racine de votre site est le dossier courant
distFolder="$dossierCourant/frontend/dist"

# Supprimez le dossier dist dans frontend
rm -rf $distFolder

# Changez le répertoire courant dans le dossier frontend
cd frontend/

# Générez le build du frontend
npm run build

# Revenez dans le dossier courant
cd $dossierCourant

# Supprimez le dossier dist dans la racine du site
rm -rf $root/dist

# Copiez le dossier dist dans la racine du site
cp -r $distFolder $root/dist