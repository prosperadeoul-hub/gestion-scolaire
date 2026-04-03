import random
from django.core.management.base import BaseCommand
from core.models import User, Classe, Matiere, Eleve, Note
from django.db import transaction

class Command(BaseCommand):
    help = "Génère 'beaucoup beaucoup' de données réalistes pour le système scolaire"

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE("Début de la génération massive de données..."))

        # 1. Création des Classes
        class_names = ["6ème A", "6ème B", "5ème A", "5ème B", "4ème A", "4ème B", "3ème A", "2nde", "1ère S", "Terminale S"]
        classes = []
        for name in class_names:
            cls, created = Classe.objects.get_or_create(
                libelle=name,
                defaults={"niveau": name.split(' ')[0], "annee_scolaire": "2026-2027"}
            )
            classes.append(cls)
        self.stdout.write(f"  - {len(classes)} classes créées.")

        # 2. Création des Professeurs
        prof_data = [
            ("M. Gomis", "MATHS"), ("Mme. Diop", "FRANCAIS"), ("M. Fall", "ANGLAIS"),
            ("Mme. Sow", "SVT"), ("M. Ndiaye", "PHILOSOPHIE"), ("M. Sy", "HIST-GEO"),
            ("Mme. Ba", "PHYSIQUE"), ("M. Cisse", "EPS"), ("M. Faye", "ARTS"),
            ("Mme. Kane", "MATHS"), ("M. Sarr", "FRANCAIS"), ("Mme. Diallo", "SVT")
        ]
        profs = []
        for i, (name, role_name) in enumerate(prof_data):
            username = f"prof_{i+1}_{name.split('.')[-1].strip().lower()}"
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "first_name": name.split(' ')[0],
                    "last_name": name.split(' ')[1],
                    "role": "TEACHER",
                    "email": f"{username}@sgs.edu"
                }
            )
            if created:
                user.set_password("pass1234")
                user.save()
            profs.append(user)
        self.stdout.write(f"  - {len(profs)} professeurs créés.")

        # 3. Création des Matières (Relier aux Classes et aux Profs)
        matieres_list = ["MATH", "FR", "ENG", "SVT", "PC", "HG", "EPS"]
        matieres_instances = []
        for cls in classes:
            for mat_code in matieres_list:
                prof = random.choice(profs)
                matiere, created = Matiere.objects.get_or_create(
                    code=f"{mat_code}_{cls.libelle.replace(' ', '')}",
                    defaults={
                        "nom": f"{mat_code} - {cls.libelle}",
                        "coefficient": random.randint(2, 5),
                        "enseignant": prof,
                        "classe": cls
                    }
                )
                matieres_instances.append(matiere)
        self.stdout.write(f"  - {len(matieres_instances)} matières (cours) créées.")

        # 4. Création des Elèves (6 par classe pour commencer = 60 élèves)
        eleves = []
        prenoms = ["Moussa", "Fatou", "Abdou", "Awa", "Ibrahima", "Bineta", "Ousmane", "Khady", "Cheikh", "Mariama"]
        noms = ["Sall", "Thiam", "Gueye", "Seck", "Mbacke", "Badiane", "Dior", "Wone", "Ly", "Camara"]
        
        for cls in classes:
            for i in range(6):
                username = f"eleve_{cls.libelle.replace(' ', '')}_{i+1}".lower()
                user, created = User.objects.get_or_create(
                    username=username,
                    defaults={
                        "first_name": random.choice(prenoms),
                        "last_name": random.choice(noms),
                        "role": "STUDENT",
                        "email": f"{username}@sgs.edu"
                    }
                )
                if created:
                    user.set_password("pass1234")
                    user.save()
                
                matricule = f"MAT-{cls.libelle.replace(' ', '')}-{i+100}"
                eleve, created_el = Eleve.objects.get_or_create(
                    matricule=matricule,
                    defaults={
                        "user": user,
                        "classe": cls,
                        "date_naissance": "2010-01-01"
                    }
                )
                eleves.append(eleve)
        self.stdout.write(f"  - {len(eleves)} élèves créés.")

        # 5. Création massive de Notes (Données pour les Charts)
        # Chaque élève aura 2-4 notes par matière
        notes_to_create = []
        for eleve in eleves:
            # On prend les matières de SA classe
            mats_eleve = [m for m in matieres_instances if m.classe == eleve.classe]
            for mat in mats_eleve:
                # 2 notes par matière (un Devoir, un Examen)
                for type_ev in ['DEVOIR', 'EXAMEN']:
                    # Performance variée pour avoir des graphiques intéressants
                    # On crée des profils d'élèves aléatoires (certains sont bons, d'autres moins)
                    base_perf = random.randint(5, 16)
                    valeur = base_perf + random.uniform(-3, 3)
                    valeur = max(0, min(20, round(valeur, 2)))
                    
                    notes_to_create.append(Note(
                        valeur=valeur,
                        type_eval=type_ev,
                        eleve=eleve,
                        matiere=mat
                    ))
        
        Note.objects.bulk_create(notes_to_create)
        self.stdout.write(f"  - {len(notes_to_create)} notes enregistrées.")

        self.stdout.write(self.style.SUCCESS("Succès : 'Beaucoup beaucoup' de données sont maintenant en base de données !"))
        self.stdout.write(self.style.INFO("Utilisez le mot de passe 'pass1234' pour tous les comptes."))
