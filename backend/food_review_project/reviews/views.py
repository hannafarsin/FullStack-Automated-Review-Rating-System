import re
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Review
from .serializers import ReviewSerializer
from .predict import predict_rating


# --- Basic text cleaner ---
def clean_text(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s.,!?]", "", text)  # keep alphanumeric + .,!? only
    text = re.sub(r"\s+", " ", text)             # normalize spaces
    return text


# --- API: Predict review ---
@api_view(["POST"])
def predict_review(request):
    review_text = request.data.get("review_text", "").strip()

    # 1️⃣ Validation
    if not review_text:
        return Response(
            {"error": "Review text is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Count actual words using regex
    word_count = len(re.findall(r"\w+", review_text))
    if word_count < 2:  # require at least 2 words
        return Response(
            {"error": "Please enter at least 2 words in your review."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 2️⃣ Clean text
    cleaned_text = clean_text(review_text)

    # 3️⃣ Predict rating
    try:
        predicted_rating = predict_rating(cleaned_text)
    

        # Save to DB
        review = Review.objects.create(
            text=review_text,  # store original input
            predicted_rating=predicted_rating
        )

        return Response({
            "id": review.id,
            "review_text": review_text,
            "cleaned_text": cleaned_text,
            "predicted_rating": round(predicted_rating, 2),
            "timestamp": review.created_at.isoformat() if review.created_at else None
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {"error": f"Prediction failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# --- API: List reviews ---
@api_view(["GET"])
def review_list(request):
    reviews = Review.objects.all().order_by("-created_at")
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# --- API: Clear all reviews (dev only) ---
@api_view(["DELETE"])
def clear_all_reviews(request):
    count = Review.objects.count()
    Review.objects.all().delete()
    return Response({"message": f"Deleted {count} reviews."})
