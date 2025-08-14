from django.db import models

class Review(models.Model):
    text = models.TextField()
    predicted_rating = models.FloatField(null=True, blank=True)  # This allows empty values

    def __str__(self):
        return self.text[:50]
