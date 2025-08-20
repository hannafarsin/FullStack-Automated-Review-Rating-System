from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for Review model with enhanced fields and validation
    """
    # Add computed fields
    rating_display = serializers.SerializerMethodField()
    sentiment_info = serializers.SerializerMethodField()
    text_preview = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 
            'text', 
            'predicted_rating', 
            'created_at',
            'rating_display',
            'sentiment_info',
            'text_preview'
        ]
        read_only_fields = ['id', 'created_at', 'rating_display', 'sentiment_info', 'text_preview']
    
    def get_rating_display(self, obj):
        """Format rating for display"""
        return f"{round(obj.predicted_rating, 1)}/5.0 ⭐"
    
    def get_sentiment_info(self, obj):
        """Get sentiment analysis for the rating"""
        rating = obj.predicted_rating
        
        if rating >= 4.5:
            return {"sentiment": "Very Positive", "emoji": "😊", "color": "#22c55e"}
        elif rating >= 3.5:
            return {"sentiment": "Positive", "emoji": "🙂", "color": "#84cc16"}
        elif rating >= 2.5:
            return {"sentiment": "Neutral", "emoji": "😐", "color": "#eab308"}
        elif rating >= 1.5:
            return {"sentiment": "Negative", "emoji": "😕", "color": "#f97316"}
        else:
            return {"sentiment": "Very Negative", "emoji": "😞", "color": "#ef4444"}
    
    def get_text_preview(self, obj):
        """Get a preview of the review text"""
        if len(obj.text) <= 100:
            return obj.text
        return obj.text[:97] + "..."
    
    def validate_text(self, value):
        """Validate review text"""
        if not value or not value.strip():
            raise serializers.ValidationError("Review text cannot be empty.")
        
        if len(value.strip()) < 5:
            raise serializers.ValidationError("Review text must be at least 5 characters long.")
        
        if len(value) > 5000:
            raise serializers.ValidationError("Review text cannot exceed 5000 characters.")
        
        return value.strip()
    
    def validate_predicted_rating(self, value):
        """Validate predicted rating"""
        if value < 1.0 or value > 5.0:
            raise serializers.ValidationError("Rating must be between 1.0 and 5.0.")
        
        return round(value, 2)


class ReviewListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing reviews (optimized for performance)
    """
    rating_display = serializers.SerializerMethodField()
    sentiment_emoji = serializers.SerializerMethodField()
    text_preview = serializers.SerializerMethodField()
    stars = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 
            'text_preview', 
            'predicted_rating', 
            'created_at',
            'rating_display',
            'sentiment_emoji',
            'stars'
        ]
    
    def get_rating_display(self, obj):
        """Format rating for display"""
        return f"{round(obj.predicted_rating, 1)}/5.0"
    
    def get_sentiment_emoji(self, obj):
        """Get emoji based on rating"""
        rating = obj.predicted_rating
        if rating >= 4.5:
            return "😊"
        elif rating >= 3.5:
            return "🙂"
        elif rating >= 2.5:
            return "😐"
        elif rating >= 1.5:
            return "😕"
        else:
            return "😞"
    
    def get_text_preview(self, obj):
        """Get a short preview of the review text"""
        if len(obj.text) <= 80:
            return obj.text
        return obj.text[:77] + "..."
    
    def get_stars(self, obj):
        """Generate visual star representation"""
        full_stars = int(obj.predicted_rating)
        half_star = 1 if (obj.predicted_rating - full_stars) >= 0.5 else 0
        empty_stars = 5 - full_stars - half_star
        
        stars = "★" * full_stars
        if half_star:
            stars += "☆"
        stars += "☆" * empty_stars
        
        return stars


class ReviewCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new reviews (used in prediction endpoint)
    """
    class Meta:
        model = Review
        fields = ['text', 'predicted_rating']
    
    def validate_text(self, value):
        """Validate review text for creation"""
        if not value or not value.strip():
            raise serializers.ValidationError("Review text is required.")
        
        # Basic text cleaning validation
        cleaned = value.strip()
        if len(cleaned) < 3:
            raise serializers.ValidationError("Review text is too short.")
        
        return cleaned
    
    def create(self, validated_data):
        """Create review with additional processing"""
        return Review.objects.create(**validated_data)