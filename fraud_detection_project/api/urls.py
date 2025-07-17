from django.urls import path
from .views import PredictFraudView

urlpatterns = [
    path('predict/', PredictFraudView.as_view(), name='predict')
]
