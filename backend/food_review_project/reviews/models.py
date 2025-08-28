from django.db import models

class Review(models.Model):
    text = models.TextField()
    predicted_rating = models.FloatField()  # 🔧 Changed from IntegerField to FloatField
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rating: {self.predicted_rating} | {self.text[:150]}..."
        