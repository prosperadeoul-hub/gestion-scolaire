from rest_framework import serializers
from .models import User, Matiere, Etudiant, Note, Promotion, Module
from django.db import transaction


class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['id', 'nom', 'code', 'credits_ects', 'semestre']

class PromotionWritableSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True)

    class Meta:
        model = Promotion
        fields = ['id', 'libelle', 'annee_universitaire', 'filiere_id', 'modules']

    def create(self, validated_data):
        modules_data = validated_data.pop('modules')
        with transaction.atomic():
            promotion = Promotion.objects.create(**validated_data)
            for module_data in modules_data:
                Module.objects.create(promotion=promotion, **module_data)
        return promotion

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']


class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = '__all__'

class MatiereSerializer(serializers.ModelSerializer):
    enseignant_name = serializers.CharField(source='enseignant.last_name', read_only=True)
    promotion_libelle = serializers.CharField(source='promotion.libelle', read_only=True)
    
    class Meta:
        model = Matiere
        fields = ['id', 'code', 'nom', 'credits_ects', 'enseignant', 'enseignant_name', 'promotion', 'promotion_libelle', 'semestre']

class EtudiantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    promotion_libelle = serializers.CharField(source='promotion.libelle', read_only=True)

    class Meta:
        model = Etudiant
        fields = ['matricule', 'user', 'promotion', 'promotion_libelle', 'date_naissance']

class NoteSerializer(serializers.ModelSerializer):
    etudiant_name = serializers.SerializerMethodField()
    matiere_name = serializers.CharField(source='matiere.nom', read_only=True)
    promotion_libelle = serializers.CharField(source='etudiant.promotion.libelle', read_only=True)

    class Meta:
        model = Note
        fields = ['id', 'valeur', 'type_eval', 'etudiant', 'etudiant_name', 'matiere', 'matiere_name', 'promotion_libelle', 'date_saisie']

    def get_etudiant_name(self, obj):
        return f"{obj.etudiant.user.last_name} {obj.etudiant.user.first_name}"

