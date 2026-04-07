from rest_framework import serializers
from .models import User, Matiere, Etudiant, Note, Promotion, Module
from django.db import transaction

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'sexe', 'telephone', 'password']
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def create(self, validated_data):
        password = validated_data.pop('password', 'Pass1234')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class ModuleSerializer(serializers.ModelSerializer):
    promotion_libelle = serializers.CharField(source='promotion.libelle', read_only=True)
    
    class Meta:
        model = Module
        fields = ['id', 'nom', 'code', 'credits_ects', 'semestre', 'promotion', 'promotion_libelle']

class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = '__all__'

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

class EtudiantSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    promotion_libelle = serializers.CharField(source='promotion.libelle', read_only=True)
    
    # Pour la création simplifiée
    first_name = serializers.CharField(write_only=True, required=False)
    last_name = serializers.CharField(write_only=True, required=False)
    sexe = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)
    telephone = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Etudiant
        fields = ['matricule', 'user', 'user_details', 'promotion', 'promotion_libelle', 'date_naissance', 
                  'first_name', 'last_name', 'sexe', 'telephone', 'email']
        read_only_fields = ['user']

    def create(self, validated_data):
        # Si first_name est présent, on crée le User
        if 'first_name' in validated_data:
            email = validated_data.pop('email', f"{validated_data['matricule']}@school.edu")
            user_data = {
                'username': email,
                'email': email,
                'first_name': validated_data.pop('first_name'),
                'last_name': validated_data.pop('last_name'),
                'sexe': validated_data.pop('sexe', 'M'),
                'telephone': validated_data.pop('telephone', ''),
                'role': 'STUDENT'
            }
            with transaction.atomic():
                user = User.objects.create_user(**user_data)
                user.set_password('Pass1234')
                user.save()
                etudiant = Etudiant.objects.create(user=user, **validated_data)
            return etudiant
        return super().create(validated_data)

class MatiereSerializer(serializers.ModelSerializer):
    enseignant_name = serializers.CharField(source='enseignant.last_name', read_only=True)
    module_nom = serializers.CharField(source='module.nom', read_only=True)
    module_semestre = serializers.IntegerField(source='module.semestre', read_only=True)
    promotion_libelle = serializers.CharField(source='module.promotion.libelle', read_only=True)
    promotion = serializers.IntegerField(source='module.promotion.id', read_only=True)
    
    class Meta:
        model = Matiere
        fields = [
            'id', 'code', 'nom', 'credits_ects',
            'enseignant', 'enseignant_name',
            'module', 'module_nom', 'module_semestre',
            'promotion', 'promotion_libelle'
        ]

class NoteSerializer(serializers.ModelSerializer):
    etudiant_name = serializers.SerializerMethodField()
    matiere_name = serializers.CharField(source='matiere.nom', read_only=True)
    promotion_libelle = serializers.CharField(source='etudiant.promotion.libelle', read_only=True)

    class Meta:
        model = Note
        fields = ['id', 'valeur', 'type_eval', 'etudiant', 'etudiant_name', 'matiere', 'matiere_name', 'promotion_libelle', 'date_saisie']

    def get_etudiant_name(self, obj):
        return f"{obj.etudiant.user.last_name} {obj.etudiant.user.first_name}"
