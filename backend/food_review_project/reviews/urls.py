from django.urls import path
from . import views
urlpatterns = [
    path('predict/', views.predict_review, name='predict_review'),
    path('', views.review_list, name='review_list'),
    path('status-bar/', views.review_status_summary, name='review_status_bar'),
    path('customer-insights/', views.customer_insights, name='customer_insights'),  
]
