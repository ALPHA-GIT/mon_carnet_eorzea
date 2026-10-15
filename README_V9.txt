Mon Carnet d’Éorzéa v0.0.9

Le workflow GitHub Actions lit le profil public et publie data/lodestone.json. Le bouton Synchroniser charge le JSON publié et met à jour le nom et les 8 niveaux d’artisanat après confirmation. Les données locales sont conservées si la récupération échoue.

Installation : copier tous les fichiers y compris .github, lancer Actions > Actualiser le Lodestone > Run workflow, attendre le commit de données et le déploiement GitHub Pages, puis cliquer Charger les données Lodestone.

Si le workflow échoue : ouvrir les logs de Lire le profil public. Le parseur du Lodestone peut nécessiter un ajustement si Square Enix change la structure HTML.
