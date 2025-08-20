# reviews/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('predict/', views.predict_review, name='predict_review'),
    path('', views.review_list, name='review_list'),  # empty path, maps to /reviews/
]
