from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Review
from .serializers import ReviewSerializer
import re  # For input validation

# Food-related keywords for validation
FOOD_KEYWORDS = [
    'food', 'restaurant', 'meal', 'dish', 'taste', 'flavor',
    'delicious', 'menu', 'eat', 'drink', 'cuisine', 'bad', 'good'
]

# Predict rating based on simple keyword logic and food keyword filtering
def predict_rating(text: str):
    text = text.strip().lower()

    # Reject if the review has no letters (only numbers/symbols)
    if not re.search(r'[a-zA-Z]', text):
        return None

    # Reject if no food-related keywords found
    if not any(keyword in text for keyword in FOOD_KEYWORDS):
        return None

    # Simple keyword-based logic
    if "bad" in text:
        return 1.0
    elif "good" in text:
        return 5.0
    else:
        return 3.0

@api_view(['POST'])
def predict_review(request):
    review_text = request.data.get('review_text')

    if not review_text:
        return Response(
            {"error": "review_text is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Predict rating
    predicted_rating = predict_rating(review_text)

    # Reject invalid/meaningless input
    if predicted_rating is None:
        return Response(
            {"error": "Invalid or meaningless review. Please write a food-related review."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Save valid review to the database
    review = Review.objects.create(
        text=review_text,
        predicted_rating=predicted_rating
    )

    # Serialize and return
    serializer = ReviewSerializer(review)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def review_list(request):
    reviews = Review.objects.all().order_by('-id')  # latest reviews first
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)
