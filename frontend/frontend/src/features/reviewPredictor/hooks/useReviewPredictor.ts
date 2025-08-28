import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../../../lib/api";

export interface ReviewItem {
  text: string;
  rating: number;
  formatted_date?: string;
}

export interface CustomerInsights {
  summary: string;
  key_points: string[];
  overall_sentiment: string;
  confidence_score: number;
}

export const useReviewPredictor = () => {
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [fetchingReviews, setFetchingReviews] = useState(false);
  const [predictedRating, setPredictedRating] = useState<number | null>(null);
  const [insights, setInsights] = useState<CustomerInsights | null>(null);

  const fetchReviews = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setFetchingReviews(true);
      const { data } = await api.get(`/reviews/?page=${pageNum}`);

      if (!data) {
        if (pageNum === 1) setReviews([]);
        return;
      }

      let reviewsData = [];
      let nextPage = null;

      if (data.results && Array.isArray(data.results)) {
        reviewsData = data.results;
        nextPage = data.next;
      } else if (Array.isArray(data)) {
        reviewsData = data;
        nextPage = reviewsData.length >= 10;
      } else if (data.reviews && Array.isArray(data.reviews)) {
        reviewsData = data.reviews;
        nextPage = data.pagination?.has_next || data.has_more || data.next;
      } else {
        if (pageNum === 1) setReviews([]);
        return;
      }

      const mappedReviews = reviewsData.map((item: any) => ({
        text: item.text || item.review_text || "",
        rating: Math.round(item.predicted_rating || item.rating || 0),
        formatted_date: item.formatted_date || "",
      }));

      if (pageNum === 1) {
        setReviews(mappedReviews);
      } else {
        setReviews((prev) => [...prev, ...mappedReviews]);
      }
      setHasMore(Boolean(nextPage && mappedReviews.length > 0));
    } catch (error) {
      console.error("Error fetching reviews:", error);
      if (pageNum === 1) setReviews([]);
      setHasMore(false);
    } finally {
      if (pageNum === 1) setFetchingReviews(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const { data } = await api.get("/reviews/customer-insights/");
      if (data && data.customer_insights) {
        setInsights(data.customer_insights);
      }
    } catch (err) {
      console.error("Error fetching insights:", err);
    }
  };

  useEffect(() => {
    fetchReviews(1);
    fetchInsights(); // fetch insights once
  }, []);

  useEffect(() => {
    if (reviews.length > 0) {
      localStorage.setItem("food-review-predictions", JSON.stringify(reviews));
    }
  }, [reviews]);

  const showAlert = (
    title: string,
    text: string,
    icon: "warning" | "error" | "success" | "info"
  ) => {
    Swal.fire({ title, text, icon, confirmButtonColor: "#facc15" });
  };

  const showAnimatedStars = (rating: number, callback?: () => void) => {
    const starsHTML = Array.from({ length: rating })
      .map(
        (_, i) =>
          `<span class="star" style="animation-delay: ${i * 0.2}s">⭐</span>`
      )
      .join("");

    Swal.fire({
      title: "Prediction Complete 🎉",
      html: `
        <div style="font-size: 2rem; display: flex; justify-content: center; gap: 8px;">
          ${starsHTML}
        </div>
        <p style="margin-top: 10px; font-size: 1.2rem;">Your review rating is ${rating} star${
      rating > 1 ? "s" : ""
    }</p>
        <style>
          .star { display: inline-block; opacity: 0; transform: scale(0.5); animation: popIn 0.5s forwards; }
          @keyframes popIn { to { opacity: 1; transform: scale(1); } }
        </style>
      `,
      confirmButtonColor: "#facc15",
    }).then(() => {
      if (callback) callback();
    });
  };

  const handlePredict = async () => {
    const trimmedReview = review.trim();

    // 🚫 Empty input
    if (!trimmedReview) {
      return showAlert("Invalid Review", "Please enter a valid review.", "warning");
    }

    // 🚫 Only numbers
    if (/^[0-9\s]+$/.test(trimmedReview)) {
      return showAlert(
        "Invalid Review",
        "Reviews cannot contain only numbers. Please write something meaningful ✍️.",
        "warning"
      );
    }

    // 🚫 Only special characters/emojis
    if (/^[^a-zA-Z0-9]+$/.test(trimmedReview)) {
      return showAlert(
        "Invalid Review",
        "Please enter a valid review with words, not just symbols or emojis.",
        "warning"
      );
    }

    // 🚫 Require at least 2 proper words (≥3 letters each)
    const words = trimmedReview.split(/\s+/).filter((w) => /^[a-zA-Z]{3,}$/.test(w));
    if (words.length < 2) {
      return showAlert(
        "Invalid Review",
        "Please write a meaningful review (at least 2 proper words).",
        "warning"
      );
    }

    try {
      const { data } = await api.post("/reviews/predict/", {
        review_text: trimmedReview,
      });

      const newReview = {
        text: data.text || data.review_text || trimmedReview,
        rating: Math.round(data.predicted_rating || data.rating || 0),
      };

      setReviews((prev) => [newReview, ...prev]);
      setReview("");
      setPredictedRating(newReview.rating);
      showAnimatedStars(newReview.rating);
    } catch (error) {
      console.error("Error predicting review:", error);
      showAlert("Error", "Something went wrong while predicting.", "error");
    }
  };

  const loadMore = () => {
    if (hasMore && !fetchingReviews) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReviews(nextPage);
    }
  };

  const viewAllReviews = () => {
    setShowAll(true);
    if (hasMore && page === 1) {
      loadMore();
    }
  };

  return {
    review,
    setReview,
    reviews,
    predictedRating,
    handlePredict,
    hasMore,
    loadMore,
    viewAllReviews,
    showAll,
    fetchingReviews,
    insights, // ✅ expose insights
  };
};
