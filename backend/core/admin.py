from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Matiere, Etudiant, Note, Promotion, Module

class MatiereInline(admin.TabularInline):
    model = Matiere
    extra = 1
    fk_name = 'enseignant'
    fields = ('code', 'nom', 'module', 'credits_ects')


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    # Ajout du champ 'role' dans le panel d'édition Django
    fieldsets = UserAdmin.fieldsets + (
        ('Informations Scolaires', {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Informations Scolaires', {'fields': ('role',)}),
    )
    inlines = [MatiereInline]


# @admin.register(Classe)
# class ClasseAdmin(admin.ModelAdmin):
#     list_display = ('libelle', 'niveau', 'annee_scolaire')
#     list_filter = ('niveau', 'annee_scolaire')
#     search_fields = ('libelle', 'niveau')

@admin.register(Matiere)
class MatiereAdmin(admin.ModelAdmin):
    list_display = ('code', 'nom', 'credits_ects', 'module', 'get_enseignant_name')
    list_filter = ('credits_ects', 'module__promotion', 'module__semestre')
    search_fields = ('code', 'nom', 'enseignant__username', 'module__nom', 'module__promotion__libelle')
    
    def get_enseignant_name(self, obj):
        if obj.enseignant:
            return f"{obj.enseignant.first_name} {obj.enseignant.last_name}"
        return "Non assigné"
    get_enseignant_name.short_description = 'Enseignant'

@admin.register(Etudiant)
class EtudiantAdmin(admin.ModelAdmin):
    list_display = ('matricule', 'get_full_name', 'promotion', 'date_naissance')
    list_filter = ('promotion',)
    search_fields = ('matricule', 'user__first_name', 'user__last_name', 'promotion__libelle')
    
    # Permet de chercher plus facilement un utilisateur lorsqu'on crée un étudiant via l'admin
    autocomplete_fields = ('user', 'promotion')
    
    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_full_name.short_description = 'Nom et Prénom'

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('etudiant', 'matiere', 'valeur', 'type_eval', 'date_saisie')
    list_filter = ('type_eval', 'matiere', 'etudiant__promotion', 'date_saisie')
    search_fields = ('etudiant__matricule', 'etudiant__user__last_name', 'matiere__nom')
    
    # Optimisation des requêtes
    autocomplete_fields = ('etudiant', 'matiere')

@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ('libelle', 'annee_universitaire', 'filiere_id')
    search_fields = ('libelle', 'annee_universitaire')

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('code', 'nom', 'credits_ects', 'semestre', 'promotion')
    list_filter = ('semestre', 'promotion')
    search_fields = ('code', 'nom')
