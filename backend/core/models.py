from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Administrateur'),
        ('TEACHER', 'Enseignant'),
        ('STUDENT', 'Étudiant'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    
    SEX_CHOICES = (
        ('M', 'Masculin'),
        ('F', 'Féminin'),
    )
    sexe = models.CharField(max_length=1, choices=SEX_CHOICES, null=True, blank=True)
    telephone = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

# class Classe(models.Model):
#     libelle = models.CharField(max_length=100)
#     niveau = models.CharField(max_length=50) 
#     annee_scolaire = models.CharField(max_length=20) # ex: 2026-2027

#     def __str__(self):
#         return f"{self.libelle} - {self.annee_scolaire}"

class Matiere(models.Model):
    code = models.CharField(max_length=20, unique=True)
    nom = models.CharField(max_length=100)
    
    # Crédits ECTS propres à cette matière (peut différer du total du module)
    credits_ects = models.PositiveIntegerField(default=3)
    
    enseignant = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        limit_choices_to={'role': 'TEACHER'},
        related_name='matieres_enseignees'
    )
    
    # Liaison avec le Module (qui porte déjà promotion + semestre)
    module = models.ForeignKey(
        'Module',
        on_delete=models.CASCADE,
        related_name='matieres'
    )

    def __str__(self):
        return f"{self.nom} ({self.module.code} - S{self.module.semestre})"

class Etudiant(models.Model):
    matricule = models.CharField(max_length=50, primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profil_etudiant')
    promotion = models.ForeignKey('Promotion', on_delete=models.CASCADE, related_name='etudiants')
    date_naissance = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.matricule} - {self.user.first_name} {self.user.last_name}"

class Note(models.Model):
    TYPE_EVAL_CHOICES = (
        ('DEVOIR', 'Devoir'),
        ('EXAMEN', 'Examen'),
    )
    # valeur peut être nulle si l'étudiant est absent
    valeur = models.FloatField(
        null=True, 
        blank=True, 
        validators=[MinValueValidator(0.0), MaxValueValidator(20.0)]
    )
    type_eval = models.CharField(max_length=20, choices=TYPE_EVAL_CHOICES)
    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE, related_name='notes')
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, related_name='notes')
    date_saisie = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        val = self.valeur if self.valeur is not None else "Absent(e)"
        return f"{val} - {self.etudiant.matricule} ({self.matiere.nom})"

class Promotion(models.Model):
    libelle = models.CharField(max_length=100)
    annee_universitaire = models.CharField(max_length=20)
    filiere_id = models.IntegerField()

    def __str__(self):
        return f"{self.libelle} ({self.annee_universitaire})"

class Module(models.Model):
    nom = models.CharField(max_length=150)
    code = models.CharField(max_length=50)
    credits_ects = models.IntegerField(default=6)
    semestre = models.IntegerField(choices=[(1, 'Semestre 1'), (2, 'Semestre 2')])
    promotion = models.ForeignKey(Promotion, on_delete=models.CASCADE, related_name='modules')

    def __str__(self):
        return f"[{self.code}] {self.nom} (S{self.semestre})"
