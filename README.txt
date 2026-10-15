MON CARNET D'ÉORZÉA — V7

Nouveau : synchronisation des niveaux publics Lodestone via GitHub Actions.

1. Décompresse le ZIP à la racine du dépôt GitHub, en incluant le dossier caché .github.
2. Commit/push tous les fichiers (en particulier .github/workflows/lodestone.yml et scripts/sync_lodestone.py).
3. Dans GitHub : Settings > Actions > General > Workflow permissions > Read and write permissions.
4. Dans Actions > Actualiser le Lodestone > Run workflow, lance la première synchronisation.
5. Vérifie qu'un commit met à jour data/lodestone.json, puis attends la publication GitHub Pages.
6. Ouvre l'application et clique « Charger les données Lodestone ».

Actualisation prévue toutes les 6 heures, selon la disponibilité de GitHub Actions et du Lodestone.
Aucun mot de passe requis. L'application ne modifie pas les niveaux si la synchronisation échoue.
Les niveaux sont confirmés avant import et enregistrés localement.
La fiche utilisée est Lenea Silvari (orthographe sur Lodestone), Raiden, ID 61850504.

LIMITES : la récupération dépend du HTML du Lodestone et peut nécessiter une adaptation du parseur.
Cette version n'a pas pu être testée en direct contre le Lodestone depuis l'environnement de génération.
GitHub Pages seul ne peut pas exécuter le script Python : GitHub Actions est indispensable.
