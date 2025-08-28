import re
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count, Avg
from django.utils import timezone
from .models import Review
from .serializers import ReviewSerializer
from .predict import predict_rating
from datetime import datetime


# --- Utility: Format review date ---
def format_review_date(created_at):
    """Format the review date like 'Reviewed in India on 30 June 2025'"""
    if not created_at:
        return "Date not available"
    
    if timezone.is_aware(created_at):
        local_time = timezone.localtime(created_at)
    else:
        local_time = created_at
    
    formatted_date = local_time.strftime("%d %B %Y")
    return f"Reviewed in India on {formatted_date}"


def friendly_review_date(created_at):
    """Friendly readable date like 'Reviewed on 27 Aug 2025'."""
    if not created_at:
        return None
    return created_at.strftime("Reviewed on %d %b %Y")


# --- Utility: Basic text cleaner ---
def clean_text(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s.,!?]", "", text)  # keep alphanumeric + .,!? only
    text = re.sub(r"\s+", " ", text)             # normalize spaces
    return text


# --- Utility: Star display ---
def star_display(rating: float) -> str:
    """Return stars based on rating (rounded to nearest int)."""
    try:
        r = int(round(rating))
        return "★" * r + "☆" * (5 - r)
    except:
        return ""


def generate_customer_insights(reviews):
    """Generate customer insights for frontend display"""
    if not reviews:
        return {
            "summary": "No customer feedback available yet.",
            "key_points": [],
            "common_themes": [],
            "generated_from": "No reviews available"
        }

    total_reviews = len(reviews)
    avg_rating = sum(r.predicted_rating for r in reviews) / total_reviews

    # Generate summary based on average rating
    if avg_rating >= 4.0:
        summary = f"Customers are generally very satisfied with the food. Based on {total_reviews} reviews, most customers recommend it."
    elif avg_rating >= 3.0:
        summary = f"Customers have mixed experiences with the food. Based on {total_reviews} reviews, many customers recommend it."
    else:
        summary = f"Customers have expressed concerns about the food. Based on {total_reviews} reviews, improvements are needed."

    # Extract key points from recent reviews
    key_points = []
    for r in reviews[:5]:
        snippet = r.text.strip()
        if len(snippet) > 100:
            snippet = snippet[:97] + "..."
        key_points.append(snippet)

    # Extract common themes/words
    from collections import Counter
    words = [word.lower() for r in reviews for word in r.text.split()]
    common_words = [word for word, count in Counter(words).most_common(5) if len(word) > 3]

    return {
        "summary": summary,
        "key_points": key_points,
        "common_themes": common_words,
        "generated_from": f"Analysis of {total_reviews} customer reviews"
    }


# --- API: Predict review ---
@api_view(["POST"])
def predict_review(request):
    review_text = request.data.get("review_text", "").strip()

    if not review_text:
        return Response(
            {"error": "Review text is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    word_count = len(re.findall(r"\w+", review_text))
    if word_count < 2:
        return Response(
            {"error": "Please enter at least 2 words in your review."},
            status=status.HTTP_400_BAD_REQUEST
        )

    cleaned_text = clean_text(review_text)

    try:
        predicted_rating = predict_rating(cleaned_text)

        review = Review.objects.create(
            text=review_text,
            predicted_rating=predicted_rating
        )

        return Response({
            "id": review.id,
            "review_text": review_text,
            "cleaned_text": cleaned_text,
            "predicted_rating": round(predicted_rating, 2),
            "rating_string": f"{int(round(predicted_rating))}/5",
            "stars": star_display(predicted_rating),
            "timestamp": review.created_at.isoformat() if review.created_at else None,
            "friendly_timestamp": friendly_review_date(review.created_at),
            "formatted_date": format_review_date(review.created_at),
            "created_at": review.created_at.isoformat() if review.created_at else None,
            "text": review_text,
            "rating_display": f"{round(predicted_rating, 1)}/5.0"
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {"error": f"Prediction failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# --- API: List all reviews with pagination ---
@api_view(["GET"])
def review_list(request):
    try:
        reviews = Review.objects.all().order_by("-created_at")

        # Pagination (10 per page)
        paginator = PageNumberPagination()
        paginator.page_size = 50
        paginated_reviews = paginator.paginate_queryset(reviews, request)

        serializer = ReviewSerializer(paginated_reviews, many=True)

        data = []
        for review, ser in zip(paginated_reviews, serializer.data):
            ser["timestamp"] = format_review_date(review.created_at)
            ser["friendly_timestamp"] = friendly_review_date(review.created_at)
            ser["formatted_date"] = format_review_date(review.created_at)
            ser["rating_string"] = f"{int(round(review.predicted_rating))}/5"
            ser["stars"] = star_display(review.predicted_rating)
            ser["rating_display"] = f"{round(review.predicted_rating, 1)}/5.0"
            ser["created_at"] = review.created_at.isoformat() if review.created_at else None
            data.append(ser)

        # Calculate total statistics for customer insights
        all_reviews = Review.objects.all()
        total_reviews = all_reviews.count()
        average_rating = round(all_reviews.aggregate(avg=Avg("predicted_rating"))["avg"] or 0, 2)
        
        # Generate customer insights
        customer_insights = generate_customer_insights(all_reviews)

        # Star distribution
        distribution = all_reviews.values("predicted_rating").annotate(count=Count("id"))
        star_counts = {i: 0 for i in range(1, 6)}
        for d in distribution:
            star_counts[int(round(d["predicted_rating"]))] += d["count"]

        star_percent = {
            star: round((count / total_reviews) * 100) if total_reviews else 0
            for star, count in star_counts.items()
        }

        # Add customer insights to the paginated response
        response = paginator.get_paginated_response(data)
        response.data.update({
            "customer_insights": customer_insights,
            "summary": {
                "total_reviews": total_reviews,
                "average_rating": average_rating,
                "star_distribution": star_counts,
                "star_distribution_percent": star_percent
            },
            "status": "success"
        })
        
        return response

    except Exception as e:
        return Response({
            "error": f"Failed to fetch reviews: {str(e)}", 
            "status": "error"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- API: Customer Insights ---
@api_view(["GET"])
def customer_insights(request):
    try:
        reviews = Review.objects.all()
        insights = generate_customer_insights(reviews)
        
        total_reviews = reviews.count()
        avg_rating = reviews.aggregate(Avg("predicted_rating"))["predicted_rating__avg"]

        return Response({
            "customer_insights": insights,
            "total_reviews": total_reviews,
            "average_rating": round(avg_rating, 2) if avg_rating else None,
            "average_stars": star_display(avg_rating) if avg_rating else None,
            "status": "success"
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            "error": f"Failed to generate customer insights: {str(e)}",
            "status": "error"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- API: Review Status Summary ---
@api_view(["GET"])
def review_status_summary(request):
    try:
        summary = Review.objects.values("predicted_rating").annotate(count=Count("id")).order_by("predicted_rating")

        # Add stars and rating_string for each group
        enriched_summary = []
        for item in summary:
            enriched_summary.append({
                "rating": item["predicted_rating"],
                "rating_string": f"{int(round(item['predicted_rating']))}/5",
                "stars": star_display(item["predicted_rating"]),
                "count": item["count"]
            })

        return Response({
            "rating_distribution": enriched_summary,
            "status": "success"
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            "error": f"Failed to get status summary: {str(e)}",
            "status": "error"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- API: Clear all reviews ---
@api_view(["DELETE"])
def clear_all_reviews(request):
    try:
        count = Review.objects.count()
        Review.objects.all().delete()
        return Response({"message": f"Deleted {count} reviews successfully."})
    except Exception as e:
        return Response({
            "error": f"Failed to clear reviews: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)