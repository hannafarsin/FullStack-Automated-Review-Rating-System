from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for Review model with enhanced fields and validation
    """
    rating_display = serializers.SerializerMethodField()
    text_preview = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 
            'text', 
            'predicted_rating', 
            'created_at',
            'rating_display',
            'text_preview'
        ]
        read_only_fields = ['id', 'created_at', 'rating_display', 'text_preview']
    
    def get_rating_display(self, obj):
        """Format rating for display"""
        return f"{round(obj.predicted_rating, 1)}/5.0"
    
    def get_text_preview(self, obj):
        """Get a preview of the review text truncated to 150 characters"""
        return obj.text[:150] + "..." if len(obj.text) > 150 else obj.text
    
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
    text_preview = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 
            'text_preview', 
            'predicted_rating', 
            'created_at',
            'rating_display'
        ]
    
    def get_rating_display(self, obj):
        """Format rating for display"""
        return f"{round(obj.predicted_rating, 1)}/5.0"
    
    def get_text_preview(self, obj):
        """Get a short preview of the review text truncated to 150 characters"""
        return obj.text[:150] + "..." if len(obj.text) > 150 else obj.text


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
        cleaned = value.strip()
        if len(cleaned) < 3:
            raise serializers.ValidationError("Review text is too short.")
        return cleaned
    
    def create(self, validated_data):
        """Create review with additional processing"""
        return Review.objects.create(**validated_data)
