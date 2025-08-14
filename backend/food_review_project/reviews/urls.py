from django.urls import path
from . import views

urlpatterns = [
    path('predict/', views.predict_review, name='predict_review'),  # POST endpoint
    path('', views.review_list, name='review_list'),                # GET endpoint for listing all reviews
]
