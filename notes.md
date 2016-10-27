# Quésaco ?

SCRIPT js qui s'exécute en arrière-plan.
Le but étant de séparer l'UI et les tâches lourdes qui pourraient ralentir l'UI.
Le contexte d'exécution est séparé de l'UI : objet global `window` inaccessible, pas de manipulation du DOM, etc.

Communication entre le worker et le process princiapl à base de "message" et le de listeners.

- shared workers : utilisables par différentes fenêtres (voire iframe) ayant le même domaine que le worker
- service worker : agit en tant que proxy entre l'app et le navigateur/réseau (hors-ligne, notifications push, synchro en arrière-plan)
- audio workers : plutôt récent et peu documenté, pour scripter de l'audio (j'ai lâché l'affaire, pas compris)

[APIs et fonctions accessibles aux workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers)

# API

importScripts("lib1.js", "lib2.js");

# AppCache

[AppCache est un connard](http://alistapart.com/article/application-cache-is-a-douchebag)

# Sécurité

HTTPS obligatoire (sauf localhost pour dev), évite les attaques Man In The Middle.

# Idées

- Récupérer en ajax le "manifest" des ressources à mettre en cache lors de l'activation du worker.
- Tâche Gulp qui créer un hash (tableau) des ressources versionnées prêt à l'emploi pour le worker (sw-toolbox)

# Théorie

1. Tout premier chargement de la page

Le navigateur télécharge toutes les ressources (comme d'hab), notre script JS demande l'installation du worker.
Le worker s'installe puis s'active (prêt à "prendre le contrôle" de la page), c'est là qu'il met en cache toutes les ressources requises pour du offline.

2. Deuxième chargement de la page (navigation, ou reload)

Le worker est actif et a le contrôle, il capture toutes les requêtes HTTP faites par la page (proxy) :
- si la ressource est présente dans le cache, elle est servie depuis le cache
- sinon, la requête part vers le réseau

3. Chargement de la page hors-connexion

Pareil que l'étape deux, sauf que les requêtes vers le réseau échouent en 404 traditionnelles.