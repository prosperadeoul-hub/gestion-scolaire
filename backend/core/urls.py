from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, MatiereViewSet, NoteViewSet, EtudiantViewSet, StatsViewSet, PromotionViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'matieres', MatiereViewSet)
router.register(r'notes', NoteViewSet)
router.register(r'etudiants', EtudiantViewSet)
router.register(r'promotions', PromotionViewSet)
router.register(r'stats', StatsViewSet, basename='stats')

urlpatterns = [
    path('', include(router.urls)),
]
