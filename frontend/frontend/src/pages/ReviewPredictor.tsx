import React, { useMemo, useState } from "react";
import { useReviewPredictor } from "../features/reviewPredictor/hooks/useReviewPredictor";
import ReviewForm from "../features/reviewPredictor/components/ReviewForm";
import ReviewList from "../features/reviewPredictor/components/ReviewList";

const ReviewPredictor: React.FC = () => {
  const {
    review,
    setReview,
    reviews,
    handlePredict,
    loadMore,
    viewAllReviews,
    showAll,
    hasMore,
      insights, 
    // predictedRating,
  } = useReviewPredictor();

  const [showInfo, setShowInfo] = useState(false);

  // ✅ Calculate average rating + distribution
  const { averageRating, distribution } = useMemo(() => {
    if (reviews.length === 0) {
      return { averageRating: 0, distribution: [0, 0, 0, 0, 0] };
    }
    const dist = [0, 0, 0, 0, 0];
    let total = 0;
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        dist[r.rating - 1] += 1;
        total += r.rating;
      }
    });
    return {
      averageRating: total / reviews.length,
      distribution: dist,
    };
  }, [reviews]);

  // ✅ Star Renderer with half stars
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <span className="flex items-center text-yellow-400 text-xl">
        {"★".repeat(fullStars)}
        {halfStar && <span className="text-yellow-400">⯪</span>}
        {"☆".repeat(emptyStars)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 py-6">
      {/* Header */}
      <h1 className="text-2xl font-semibold mb-4">Customer reviews</h1>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Left - Rating Summary */}
        <div className="w-full md:w-1/3">
          {/* Average Rating */}
          <div className="flex items-center mb-2">
            <div className="text-3xl font-semibold">
              {averageRating.toFixed(1)}
            </div>
            <div className="ml-2">{renderStars(averageRating)}</div>
          </div>
          <p className="text-gray-700 text-sm mb-4">
            {reviews.length} global rating{reviews.length !== 1 ? "s" : ""}
          </p>

          {/* Distribution Bars */}
          <div className="space-y-1 mb-6">
            {distribution
              .map((count, index) => ({ stars: index + 1, count }))
              .reverse()
              .map(({ stars, count }) => {
                const percentage =
                  reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div
                    key={stars}
                    className="flex items-center text-sm text-gray-700 hover:text-blue-600 cursor-pointer"
                  >
                    <span className="w-12 hover:underline">{stars} star</span>
                    <div className="flex-1 h-3 bg-gray-200 rounded mx-2">
                      <div
                        className="h-3 bg-yellow-400 rounded"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-10 text-right">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                );
              })}
          </div>

          {/* How are ratings calculated */}
          <div className="mb-6">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-blue-600 hover:underline text-sm"
            >
              How are ratings calculated?
            </button>
            {showInfo && (
              <p className="mt-2 text-sm text-gray-600 leading-relaxed border border-gray-200 rounded p-3 bg-gray-50">
                To calculate the overall star rating and percentage breakdown by
                star, we don’t use a simple average. Instead, our system
                considers things like how recent a review is and if the reviewer
                bought the item. It also analyses reviews to verify
                trustworthiness.
              </p>
            )}
          </div>

          <hr className="my-4" />

          {/* Review this product */}
          <h2 className="text-lg font-semibold text-gray-800">
            Review this product
          </h2>
          <p className="text-gray-600 text-sm mb-3">
            Share your thoughts with other customers
          </p>
          <ReviewForm
            review={review}
            setReview={setReview}
            onPredict={handlePredict}
          />

          <hr className="my-4" />
        </div>

        {/* Right - Reviews */}
        <div className="w-full md:w-2/3">
          <ReviewList
            reviews={reviews}
            showAll={showAll}
            loadMore={loadMore}
            viewAllReviews={viewAllReviews}
            hasMore={hasMore}
            insights={insights}  
          />

          {/* Predicted Rating
          {predictedRating !== null && (
            <div className="mt-6 p-4 border rounded-md bg-gray-50">
              <p className="font-semibold text-gray-800">
                AI Predicted Rating
              </p>
              <div className="flex items-center space-x-1 mt-2">
                {renderStars(predictedRating)}
                <span className="ml-2 text-gray-600 text-sm">
                  {predictedRating} out of 5
                </span>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default ReviewPredictor;
