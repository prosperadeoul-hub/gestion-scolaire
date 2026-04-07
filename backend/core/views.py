from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg

from .models import User, Matiere, Etudiant, Note, Promotion, Module
from .serializers import (
    UserSerializer, PromotionSerializer, MatiereSerializer, 
    EtudiantSerializer, NoteSerializer, PromotionWritableSerializer,
    ModuleSerializer
)

class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer

class PromotionViewSet(viewsets.ModelViewSet):
    queryset = Promotion.objects.all()
    serializer_class = PromotionSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return PromotionWritableSerializer
        return PromotionSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        return queryset


    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class PromotionViewSet(viewsets.ModelViewSet):
    queryset = Promotion.objects.all()
    serializer_class = PromotionSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return PromotionWritableSerializer
        return PromotionSerializer

class MatiereViewSet(viewsets.ModelViewSet):
    queryset = Matiere.objects.all()
    serializer_class = MatiereSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'TEACHER':
            return Matiere.objects.filter(enseignant=user)
        return super().get_queryset()

class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        matiere_id = self.request.query_params.get('matiere', None)
        promotion_id = self.request.query_params.get('promotion', None)
        search = self.request.query_params.get('search', None)
        if matiere_id:
            queryset = queryset.filter(matiere_id=matiere_id)
        if promotion_id:
            queryset = queryset.filter(etudiant__promotion_id=promotion_id)
        if search:
            queryset = queryset.filter(etudiant__user__last_name__icontains=search)
        return queryset

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def bulk_saisie(self, request):
        if request.user.role != 'TEACHER':
            return Response({"detail": "Seul un enseignant peut saisir des notes"}, status=403)
        
        notes_data = request.data.get('notes', [])
        matiere_id = request.data.get('matiere_id')

        if not matiere_id:
            return Response({"detail": "matiere_id est requis"}, status=400)
        
        for item in notes_data:
            etudiant_id = item.get('etudiant') or item.get('eleve') # Support both for transition
            valeur = item.get('valeur')
            
            if valeur == "" or valeur is None:
                valeur = None
            else:
                valeur = float(valeur)
                
            Note.objects.update_or_create(
                etudiant_id=etudiant_id,
                matiere_id=matiere_id,
                defaults={'valeur': valeur, 'type_eval': 'DEVOIR'}
            )
            
        return Response({"detail": "Notes enregistrées avec succès"})

class EtudiantViewSet(viewsets.ModelViewSet):
    queryset = Etudiant.objects.all()
    serializer_class = EtudiantSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        promotion_id = self.request.query_params.get('promotion', None)
        search = self.request.query_params.get('search', None)
        if promotion_id is not None:
            queryset = queryset.filter(promotion_id=promotion_id)
        if search:
            queryset = queryset.filter(user__last_name__icontains=search) | queryset.filter(matricule__icontains=search)
        return queryset


    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def bulletin(self, request):
        if request.user.role != 'STUDENT':
            return Response({"detail": "Accès non autorisé au bulletin étudiant."}, status=403)
        
        try:
            etudiant = Etudiant.objects.get(user=request.user)
        except Etudiant.DoesNotExist:
            return Response({"detail": "Profil étudiant introuvable"}, status=404)

        notes = Note.objects.filter(etudiant=etudiant)
        notes_data = NoteSerializer(notes, many=True).data
        
        # Calcul de la moyenne par matière
        moyennes_matieres = notes.values('matiere__nom', 'matiere__credits_ects').annotate(moyenne=Avg('valeur'))
        
        # Calcul de la moyenne générale
        somme_notes = 0
        somme_ects = 0
        for mat in moyennes_matieres:
            if mat['moyenne'] is not None:
                somme_notes += mat['moyenne'] * mat['matiere__credits_ects']
                somme_ects += mat['matiere__credits_ects']
        
        moyenne_generale = round(somme_notes / somme_ects, 2) if somme_ects > 0 else None

        return Response({
            "etudiant": EtudiantSerializer(etudiant).data,
            "notes": notes_data,
            "recap_matieres": list(moyennes_matieres),
            "moyenne_generale": moyenne_generale
        })

class StatsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        user = request.user
        if user.role == 'ADMIN':
            roles = ['ADMIN', 'TEACHER', 'STUDENT']
            role_data = [{"name": r, "value": User.objects.filter(role=r).count()} for r in roles]

            promotion_data = [{"name": p.libelle, "count": p.modules.count()} for p in Promotion.objects.all()]
            modules_count = Module.objects.count()

            top_promotions = []
            for prom in Promotion.objects.all():
                moy = Note.objects.filter(etudiant__promotion=prom).aggregate(avg=Avg('valeur'))['avg']
                top_promotions.append({
                    "name": prom.libelle,
                    "avg": round(moy, 2) if moy is not None else 0
                })
            top_promotions = sorted(top_promotions, key=lambda x: x['avg'], reverse=True)[:5]

            teacher_load = []
            for prof in User.objects.filter(role='TEACHER'):
                nb_mat = Matiere.objects.filter(enseignant=prof).count()
                teacher_load.append({
                    "name": prof.last_name,
                    "value": nb_mat
                })

            recent_students = EtudiantSerializer(Etudiant.objects.all().order_by('-user__date_joined')[:5], many=True).data
            recent_notes = NoteSerializer(Note.objects.all().order_by('-date_saisie')[:5], many=True).data
            recent_modules = ModuleSerializer(Module.objects.all().order_by('-id')[:5], many=True).data

            student_distribution = [{"name": p.libelle, "value": p.etudiants.count()} for p in Promotion.objects.all()]

            return Response({
                "role_distribution": role_data,
                "promotion_data": promotion_data,
                "student_distribution": student_distribution,
                "top_promotions": top_promotions,
                "teacher_load": teacher_load,
                "recent_data": {
                    "students": recent_students,
                    "notes": recent_notes,
                    "modules": recent_modules
                },
                "modules_count": modules_count
            })
        return Response({"detail": "Dashboard only for ADMIN role"}, status=403)

    @action(detail=False, methods=['get'])
    def teacher(self, request):
        user = request.user
        if user.role != 'TEACHER':
            return Response({"detail": "Role Teacher requis"}, status=403)
        
        notes_prof = Note.objects.filter(matiere__enseignant=user)
        promotions_prof = Promotion.objects.filter(modules__matieres__enseignant=user).distinct()
        students_count = Etudiant.objects.filter(promotion__in=promotions_prof).distinct().count()
        avg_grade = notes_prof.aggregate(avg=Avg('valeur'))['avg'] or 0

        performance_promotions = []
        for pr in promotions_prof:
            moy = notes_prof.filter(etudiant__promotion=pr).aggregate(avg=Avg('valeur'))['avg']
            performance_promotions.append({
                "name": pr.libelle,
                "avg": round(moy, 2) if moy is not None else 0
            })

        return Response({
            "total_promotions": promotions_prof.count(),
            "total_students": students_count,
            "average_grade": round(avg_grade, 2),
            "promotion_performance": performance_promotions
        })

    @action(detail=False, methods=['get'])
    def student(self, request):
        user = request.user
        if user.role != 'STUDENT':
            return Response({"detail": "Role Student requis"}, status=403)
        
        try:
            etudiant = Etudiant.objects.get(user=user)
            notes_etudiant = Note.objects.filter(etudiant=etudiant)
            
            # Moyenne de l'étudiant
            student_avg = notes_etudiant.aggregate(avg=Avg('valeur'))['avg'] or 0
            
            # Moyenne de sa promotion
            promotion_avg = Note.objects.filter(etudiant__promotion=etudiant.promotion).aggregate(avg=Avg('valeur'))['avg'] or 0
            
            # Rang (Simpliste : basé sur la moyenne par étudiant dans la promotion)
            all_students_in_promotion = Etudiant.objects.filter(promotion=etudiant.promotion)
            rank_list = []
            for s in all_students_in_promotion:
                s_avg = Note.objects.filter(etudiant=s).aggregate(avg=Avg('valeur'))['avg'] or 0
                rank_list.append((s.matricule, s_avg))
            
            rank_list = sorted(rank_list, key=lambda x: x[1], reverse=True)
            rank = "N/A"
            for index, (matricule, avg) in enumerate(rank_list):
                if matricule == etudiant.matricule:
                    rank = f"{index + 1}/{len(rank_list)}"
                    break

            return Response({
                "student_average": round(student_avg, 2),
                "promotion_average": round(promotion_avg, 2),
                "student_rank": rank
            })
        except Etudiant.DoesNotExist:
            return Response({"detail": "Profil étudiant introuvable"}, status=404)

