import random
from datetime import date
from django.core.management.base import BaseCommand
from core.models import User, Promotion, Module, Matiere, Etudiant, Note
from django.db import transaction

class Command(BaseCommand):
    help = "Génère des données réalistes pour le nouveau système universitaire"

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE("Début de la génération de données (Universitaire)..."))

        with transaction.atomic():
            # 1. Nettoyage optionnel (à commenter en prod)
            # User.objects.exclude(is_superuser=True).delete()
            # Promotion.objects.all().delete()

            # 2. Création des Promotions
            promo_data = [
                ("Licence 1 Informatique", "2026-2027", 1),
                ("Licence 2 Informatique", "2026-2027", 1),
                ("Licence 3 Informatique DSI", "2026-2027", 1),
                ("Licence 3 Informatique GL", "2026-2027", 1),
                ("Master 1 Data Science", "2026-2027", 1),
                ("Master 2 IA", "2026-2027", 1),
                ("Licence 1 Gestion", "2026-2027", 2),
                ("Licence 2 Gestion", "2026-2027", 2),
                ("Licence 3 Comptabilité", "2026-2027", 2),
                ("Master 1 Finance", "2026-2027", 2),
                ("Master 2 Audit", "2026-2027", 2),
                ("Licence 1 Droit", "2026-2027", 3),
            ]
            promos = []
            for libelle, annee, fil_id in promo_data:
                promo, _ = Promotion.objects.get_or_create(
                    libelle=libelle,
                    defaults={'annee_universitaire': annee, 'filiere_id': fil_id}
                )
                promos.append(promo)
            self.stdout.write(f"  - {len(promos)} promotions créées.")

            # 3. Création des Enseignants
            prof_names = [
                ("M. Touré", "M"), ("Mme. Sow", "F"), ("M. Ndiaye", "M"),
                ("M. Diouf", "M"), ("Mme. Fall", "F"), ("M. Gomis", "M"),
                ("M. Seck", "M"), ("Mme. Mbaye", "F"), ("M. Ba", "M"),
                ("M. Kane", "M"), ("Mme. Diallo", "F"), ("M. Sy", "M"),
                ("M. Cisse", "M"), ("Mme. Tall", "F"), ("M. Faye", "M"),
                ("M. Thiam", "M"), ("Mme. Ly", "F"), ("M. Wade", "M"),
                ("M. Sarr", "M"), ("Mme. Ndao", "F")
            ]
            profs = []
            for i, (name, sexe) in enumerate(prof_names):
                username = f"prof_{i+1}_{name.split('.')[-1].strip().lower()}"
                user, created = User.objects.get_or_create(
                    username=username,
                    defaults={
                        "first_name": name.split(' ')[0],
                        "last_name": name.split(' ')[1],
                        "role": "TEACHER",
                        "sexe": sexe,
                        "email": f"{username}@univ.edu"
                    }
                )
                if created:
                    user.set_password("pass1234")
                    user.save()
                profs.append(user)
            self.stdout.write(f"  - {len(profs)} enseignants créés.")

            # 4. Création des Modules et Matières
            modules_templates = [
                {"nom": "Mathématiques Fondamentales", "code": "UE11", "ects": 6, "semestre": 1, "matieres": [("Algèbre Linéaire", "ALG1", 3), ("Analyse Numérique", "ANA1", 3), ("Statistiques", "STAT", 2)]},
                {"nom": "Algorithmique & Prog", "code": "UE12", "ects": 6, "semestre": 1, "matieres": [("Algo Avancée", "ALG_PROG", 4), ("Travaux Pratiques C", "TP_C", 2), ("Python", "PY", 3)]},
                {"nom": "Systèmes & Réseaux", "code": "UE21", "ects": 6, "semestre": 2, "matieres": [("Architecture Ordinateurs", "ARCH", 3), ("Réseaux Locaux", "RES", 3), ("Systèmes d'Exploitation", "OS", 3)]},
                {"nom": "Culture Générale", "code": "UE22", "ects": 4, "semestre": 2, "matieres": [("Anglais Technique", "ENG1", 2), ("Droit Informatique", "DROIT", 2), ("Communication", "COM", 2)]},
                {"nom": "Bases de données", "code": "UE31", "ects": 6, "semestre": 1, "matieres": [("SQL Avancé", "SQL", 3), ("Modélisation", "MOD", 3)]},
            ]

            modules_crees = 0
            matieres_crees = 0
            for promo in promos:
                for mod_data in modules_templates:
                    module, _ = Module.objects.get_or_create(
                        code=f"{mod_data['code']}_{promo.id}",
                        defaults={
                            "nom": mod_data['nom'],
                            "credits_ects": mod_data['ects'],
                            "semestre": mod_data['semestre'],
                            "promotion": promo
                        }
                    )
                    modules_crees += 1

                    for mat_nom, mat_code, m_ects in mod_data['matieres']:
                        prof = random.choice(profs)
                        Matiere.objects.get_or_create(
                            code=f"{mat_code}_{promo.id}_{module.id}",
                            defaults={
                                "nom": mat_nom,
                                "credits_ects": m_ects,
                                "enseignant": prof,
                                "module": module
                            }
                        )
                        matieres_crees += 1
            
            self.stdout.write(f"  - {modules_crees} modules et {matieres_crees} matières créés.")

            # 5. Création des Étudiants
            prenoms_m = ["Moussa", "Abdou", "Ibrahima", "Ousmane", "Cheikh", "Modou", "Pape", "Amadou", "Saliou", "Lamine"]
            prenoms_f = ["Fatou", "Awa", "Bineta", "Khady", "Mariama", "Ndèye", "Aminata", "Coumba", "Oumou", "Safietou"]
            noms = ["Sall", "Thiam", "Gueye", "Seck", "Mbacke", "Badiane", "Dior", "Wone", "Ly", "Camara", "Touré", "Gassama", "Ndour", "Cissokho"]
            
            etudiants = []
            for promo in promos:
                for i in range(80):  # 80 étudiants par promotion
                    sexe = random.choice(['M', 'F'])
                    prenom = random.choice(prenoms_m) if sexe == 'M' else random.choice(prenoms_f)
                    nom = random.choice(noms)
                    
                    username = f"etu_{promo.id}_{i+1}".lower()
                    user, created = User.objects.get_or_create(
                        username=username,
                        defaults={
                            "first_name": prenom,
                            "last_name": nom,
                            "role": "STUDENT",
                            "sexe": sexe,
                            "email": f"{username}@etu.univ.edu"
                        }
                    )
                    if created:
                        user.set_password("pass1234")
                        user.save()
                    
                    matricule = f"26{promo.id:02d}{i+1:03d}"
                    etudiant, _ = Etudiant.objects.get_or_create(
                        matricule=matricule,
                        defaults={
                            "user": user,
                            "promotion": promo,
                            "date_naissance": date(2005 - promo.id, random.randint(1, 12), random.randint(1, 28))
                        }
                    )
                    etudiants.append(etudiant)
            self.stdout.write(f"  - {len(etudiants)} étudiants créés.")

            # 6. Création des Notes
            notes_to_create = []
            matieres_all = list(Matiere.objects.select_related('module__promotion').all())
            
            for etudiant in etudiants:
                mats_etudiant = [m for m in matieres_all if m.module.promotion_id == etudiant.promotion_id]
                for mat in mats_etudiant:
                    # Niveau de l'étudiant pour avoir des notes cohérentes (bon ou mauvais)
                    base_perf = random.randint(6, 16)
                    
                    # 2 Devoirs
                    val_devoir1 = max(0, min(20, base_perf + random.uniform(-4, 2)))
                    notes_to_create.append(Note(valeur=round(val_devoir1, 2), type_eval='DEVOIR', etudiant=etudiant, matiere=mat))
                    
                    val_devoir2 = max(0, min(20, base_perf + random.uniform(-3, 3)))
                    notes_to_create.append(Note(valeur=round(val_devoir2, 2), type_eval='DEVOIR', etudiant=etudiant, matiere=mat))
                    
                    # 2 Examens
                    val_exam1 = max(0, min(20, base_perf + random.uniform(-5, 4)))
                    notes_to_create.append(Note(valeur=round(val_exam1, 2), type_eval='EXAMEN', etudiant=etudiant, matiere=mat))
                    
                    val_exam2 = max(0, min(20, base_perf + random.uniform(-4, 5)))
                    notes_to_create.append(Note(valeur=round(val_exam2, 2), type_eval='EXAMEN', etudiant=etudiant, matiere=mat))
                    
                    # Devoir
                    val_devoir = max(0, min(20, base_perf + random.uniform(-3, 3)))
                    notes_to_create.append(Note(valeur=round(val_devoir, 2), type_eval='DEVOIR', etudiant=etudiant, matiere=mat))
                    
                    # Examen
                    val_exam = max(0, min(20, base_perf + random.uniform(-4, 4)))
                    notes_to_create.append(Note(valeur=round(val_exam, 2), type_eval='EXAMEN', etudiant=etudiant, matiere=mat))
            
            Note.objects.bulk_create(notes_to_create, ignore_conflicts=True)
            self.stdout.write(f"  - {len(notes_to_create)} notes enregistrées.")

        self.stdout.write(self.style.SUCCESS("Succès : Les données universitaires ont été générées !"))
        self.stdout.write(self.style.INFO("Utilisez le mot de passe 'pass1234' pour tous les comptes."))
