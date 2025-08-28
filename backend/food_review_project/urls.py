from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('reviews/', include('food_review_project.reviews.urls')),  # full path
]

