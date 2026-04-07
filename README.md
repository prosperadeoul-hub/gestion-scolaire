# Système de Gestion Scolaire (SGS)

Une application web fullstack moderne de gestion scolaire conçue pour les établissements d'enseignement supérieur. Elle permet la gestion des étudiants, enseignants, promotions, matières, modules et notes, avec des tableaux de bord analytiques multi-rôles.

---

## Stack Technologique

### Backend
| Technologie | Rôle |
|---|---|
| **Python / Django 5.2** | Framework web backend |
| **Django REST Framework** | API RESTful |
| **Simple JWT** | Authentification par tokens JWT |
| **Django CORS Headers** | Gestion des requêtes cross-origin |
| **Jazzmin** | Interface d'administration Django modernisée |
| **MySQL** | Base de données relationnelle |

### Frontend
| Technologie | Rôle |
|---|---|
| **React 19** | Framework UI |
| **Vite 8** | Outil de build & dev server |
| **React Router v7** | Navigation côté client (SPA) |
| **Axios** | Requêtes HTTP vers l'API |
| **Recharts** | Graphiques et visualisations de données |
| **Heroicons** | Icônes SVG |
| **CSS Vanilla** | Stylisation sans framework CSS |

---

## Structure du Projet

```
gestion-scolaire/
├── backend/                    # Application Django
│   ├── backend/                # Configuration principale Django
│   │   ├── settings.py
│   │   └── urls.py
│   ├── core/                   # Application principale
│   │   ├── models.py           # Modèles de données
│   │   ├── serializers.py      # Sérialiseurs DRF
│   │   ├── views.py            # Vues & ViewSets API
│   │   ├── urls.py             # Routage API
│   │   ├── admin.py            # Configuration Jazzmin Admin
│   │   └── management/        # Commandes Django personnalisées
│   └── manage.py
│
└── frontend/                   # Application React
    ├── src/
    │   ├── pages/
    │   │   ├── Admin/          # Dashboard administrateur
    │   │   ├── Dashboard/      # Dashboard enseignant
    │   │   ├── DashboardEtudiant/ # Dashboard étudiant
    │   │   ├── Login/          # Page de connexion
    │   │   └── Programmation/  # Gestion de la programmation
    │   ├── components/
    │   │   ├── Layout/         # Composants de mise en page
    │   │   ├── Pagination/     # Composant de pagination
    │   │   └── SaisieNotes/    # Formulaire de saisie des notes
    │   ├── context/            # Contextes React (AuthContext...)
    │   ├── services/           # Couche d'appels API (Axios)
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## Modèle de Données

```
User (AbstractUser)
 ├── role : ADMIN | TEACHER | STUDENT
 ├── sexe
 └── telephone

Promotion
 ├── libelle
 ├── annee_universitaire
 └── filiere_id

Matiere
 ├── code (unique)
 ├── nom
 ├── credits_ects
 ├── semestre (1 ou 2)
 ├── enseignant (→ User)
 └── promotion (→ Promotion)

Module
 ├── nom / code
 ├── credits_ects
 ├── semestre
 └── promotion (→ Promotion)

Etudiant
 ├── matricule (PK)
 ├── user (→ User)
 ├── promotion (→ Promotion)
 └── date_naissance

Note
 ├── valeur (0–20, nullable si absent)
 ├── type_eval : DEVOIR | EXAMEN
 ├── etudiant (→ Etudiant)
 ├── matiere (→ Matiere)
 └── date_saisie
```

---

## API Endpoints

L'API est exposée sous `/api/` avec les ressources suivantes :

| Ressource | Endpoint |
|---|---|
| Utilisateurs | `/api/users/` |
| Étudiants | `/api/etudiants/` |
| Promotions | `/api/promotions/` |
| Matières | `/api/matieres/` |
| Modules | `/api/modules/` |
| Notes | `/api/notes/` |
| Statistiques | `/api/stats/` |
| Auth (token) | `/api/token/` |
| Refresh token | `/api/token/refresh/` |

Toutes les routes (sauf `/api/token/`) nécessitent un **token JWT Bearer**.

---

## Rôles Utilisateurs

| Rôle | Description |
|---|---|
| **ADMIN** | Accès complet : gestion des utilisateurs, promotions, matières, modules, notes |
| **TEACHER** | Tableau de bord enseignant, saisie des notes, visualisation des statistiques |
| **STUDENT** | Tableau de bord personnel, consultation des notes et de la progression |

---

## Installation & Lancement

### Prérequis
- Python 3.12+
- Node.js 20+
- MySQL (serveur local ou XAMPP)

---

### 1. Backend (Django)

```bash
# Cloner le projet
cd gestion-scolaire/backend

# Créer et activer l'environnement virtuel
python -m venv env
# Windows
env\Scripts\activate

# Installer les dépendances
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers jazzmin mysqlclient

# Configurer la base de données dans backend/settings.py

# Appliquer les migrations
python manage.py makemigrations
python manage.py migrate

# Créer un super-utilisateur admin
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

Le backend sera disponible sur : **http://127.0.0.1:8000**

---

### 2. Frontend (React + Vite)

```bash
cd gestion-scolaire/frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le frontend sera disponible sur : **http://localhost:5173**

---

## Configuration de la Base de Données

Dans `backend/backend/settings.py`, configurez la section `DATABASES` :

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "gestion_scolaire_db",  # Créer cette base dans MySQL
        "USER": "root",                  # Votre utilisateur MySQL
        "PASSWORD": "",                  # Votre mot de passe MySQL
        "HOST": "127.0.0.1",
        "PORT": "3306",
    }
}
```

Créer la base de données d'abord :
```sql
CREATE DATABASE gestion_scolaire_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## Authentification

L'application utilise **JWT (JSON Web Tokens)** :
- `POST /api/token/` → retourne un `access` token (2h) et un `refresh` token (1 jour)
- `POST /api/token/refresh/` → renouvelle l'access token
- Chaque requête doit inclure : `Authorization: Bearer <access_token>`

---

## Fonctionnalités Principales

- ✅ **Authentification JWT** multi-rôles (Admin, Enseignant, Étudiant)
- ✅ **Gestion des Promotions** (filières, années universitaires)
- ✅ **Gestion des Matières & Modules** (crédits ECTS, semestres)
- ✅ **Gestion des Étudiants** avec matricule unique
- ✅ **Saisie des Notes** (devoirs, examens, gestion des absences)
- ✅ **Tableaux de bord analytiques** avec graphiques (Recharts)
- ✅ **Pagination côté serveur** (10 éléments par page)
- ✅ **Interface Admin Jazzmin** pour la gestion des données brutes
- ✅ **CRUD complet** sur toutes les ressources

---

## Interface d'Administration

Django Jazzmin est configuré pour une interface d'administration moderne :
- Accès : **http://127.0.0.1:8000/admin/**
- Thème : Flatly (Bootstrap)
- Sidebar sombre avec navigation étendue
- Recherche rapide sur Utilisateurs et Étudiants

---

## Variables d'Environnement (Production)

Pour la mise en production, externalisez les secrets dans un fichier `.env` :

```env
SECRET_KEY=votre-clé-secrète-très-longue
DEBUG=False
DB_NAME=gestion_scolaire_db
DB_USER=votre_user
DB_PASSWORD=votre_mot_de_passe
DB_HOST=127.0.0.1
DB_PORT=3306
ALLOWED_HOSTS=votre-domaine.com
```

---

