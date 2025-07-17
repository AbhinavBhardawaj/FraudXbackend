from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import FraudDetectionSerializer
import joblib
import numpy as np
import os
import logging

# It's good practice to use a logger instead of print in a Django app
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = joblib.load(os.path.join(BASE_DIR, 'ml_model/xgboost_fraud_model.pkl'))
scaler = joblib.load(os.path.join(BASE_DIR, 'ml_model/scaler.pkl'))

feature_order = [
    'Time', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10',
    'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17', 'V18', 'V19', 'V20',
    'V21', 'V22', 'V23', 'V24', 'V25', 'V26', 'V27', 'V28', 'Amount'
]

class PredictFraudView(APIView):
    def post(self, request):
        serializer = FraudDetectionSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data

            try:
                # 1. Prepare the input array
                input_array = np.array([[data[feature] for feature in feature_order]])

                # 2. Scale the input using the loaded scaler
                scaled_input = scaler.transform(input_array)

                # 3. Get prediction and probabilities
                prediction = model.predict(scaled_input)[0]
                proba = model.predict_proba(scaled_input)[0]

                # 4. Extract the probability of fraud (class 1)
                risk_score = proba[1] 

                # Log the raw values for better debugging
                logger.info(f"Prediction: {prediction}, Full Risk Score: {risk_score}")

                # **IMPROVEMENT**: Return the full floating point number. Do not round.
                # The frontend can handle formatting.
                return Response({
                    'prediction': int(prediction),
                    'risk_score': float(risk_score) # Ensure it's a standard float
                })

            except Exception as e:
                logger.error(f"Error during prediction: {e}", exc_info=True)
                return Response({'error': 'An error occurred during prediction.'}, status=500)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)