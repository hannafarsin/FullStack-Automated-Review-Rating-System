import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../../../lib/api";

export interface ReviewItem {
  text: string;
  rating: number;
}

export const useReviewPredictor = () => {
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [fetchingReviews, setFetchingReviews] = useState(false);

  const fetchReviews = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setFetchingReviews(true);
      
      console.log("Fetching reviews from:", `/reviews/?page=${pageNum}`);
      const { data } = await api.get(`/reviews/?page=${pageNum}`);
      console.log("Received data:", data);
      
      // Check if data and data.results exist
      if (!data) {
        console.log("No data received from API");
        if (pageNum === 1) setReviews([]);
        return;
      }

      // Handle different possible response formats
      let reviewsData = [];
      let nextPage = null;

      if (data.results && Array.isArray(data.results)) {
        // Paginated response format
        reviewsData = data.results;
        nextPage = data.next;
      } else if (Array.isArray(data)) {
        // Direct array format
        reviewsData = data;
        // For direct arrays, check if we got a full page (assuming 10 per page)
        nextPage = reviewsData.length >= 10;
      } else if (data.reviews && Array.isArray(data.reviews)) {
        // Alternative format with reviews key
        reviewsData = data.reviews;
        nextPage = data.has_more || data.next;
      } else {
        console.log("Unexpected data format:", data);
        if (pageNum === 1) setReviews([]);
        return;
      }

      const mappedReviews = reviewsData.map((item: any) => ({
        text: item.text || item.review_text || "",
        rating: item.predicted_rating || item.rating || 0,
      }));
      
      console.log("Mapped reviews:", mappedReviews);
      
      if (pageNum === 1) {
        setReviews(mappedReviews);
      } else {
        setReviews((prev) => [...prev, ...mappedReviews]);
      }
      
      // Set hasMore based on whether there's more data
      setHasMore(Boolean(nextPage && mappedReviews.length > 0));
      
    } catch (error) {
      console.error("Error fetching reviews:", error);
      // Set empty array on error so UI doesn't break
      if (pageNum === 1) {
        setReviews([]);
      }
      setHasMore(false);
    } finally {
      if (pageNum === 1) setFetchingReviews(false);
    }
  };

  // Load reviews on component mount
  useEffect(() => {
    const loadInitialReviews = async () => {
      // Always fetch fresh data from API
      await fetchReviews(1);
    };

    loadInitialReviews();
  }, []); // Empty dependency array means this runs once on mount

  // Save reviews to localStorage whenever reviews state changes
  useEffect(() => {
    if (reviews.length > 0) {
      localStorage.setItem('food-review-predictions', JSON.stringify(reviews));
    }
  }, [reviews]);

  const showAlert = (
    title: string,
    text: string,
    icon: "warning" | "error" | "success" | "info"
  ) => {
    Swal.fire({ title, text, icon, confirmButtonColor: "#facc15" });
  };

  const showAnimatedStars = (rating: number) => {
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
    });
  };

  const handlePredict = async () => {
    if (!review.trim())
      return showAlert(
        "Empty Review",
        "Please enter a review before predicting.",
        "warning"
      );

    try {
      const { data } = await api.post("/reviews/predict/", {
        review_text: review.trim(),
      });

      const newReview = {
        text: data.text,
        rating: data.predicted_rating,
      };

      setReviews((prev) => [newReview, ...prev]);
      setReview("");
      
      showAnimatedStars(data.predicted_rating);
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

  // New function specifically for "View All Reviews" button
  const viewAllReviews = () => {
    setShowAll(true);
    // If we haven't loaded more data and there might be more, load it
    if (hasMore && page === 1) {
      loadMore();
    }
  };

  return {
    review,
    setReview,
    reviews,
    handlePredict,
    hasMore,
    loadMore,
    viewAllReviews, // Add this new function
    showAll,
    fetchingReviews,
  };
};