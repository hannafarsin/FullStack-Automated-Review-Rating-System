import React from "react";
import type { ReviewItem } from "../hooks/useReviewPredictor";

interface ReviewListProps {
  reviews: ReviewItem[];
  showAll: boolean;
  loadMore: () => void;
  viewAllReviews: () => void;
  hasMore: boolean;
}

const ReviewList: React.FC<ReviewListProps> = ({ 
  reviews, 
  showAll, 
  loadMore, 
  viewAllReviews,
  hasMore 
}) => {
  // Show only 5 reviews if showAll is false
  const displayedReviews = showAll ? reviews : reviews.slice(0, 5);

  const getStarColor = (rating: number) => {
    if (rating >= 4) return "text-green-500";
    if (rating === 3) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="w-full max-w-2xl mt-10 px-4">
      {/* Animations */}
      <style>
        {`
          @keyframes popIn {
            0% { opacity: 0; transform: scale(0.5); }
            100% { opacity: 1; transform: scale(1); }
          }
          .star-pop {
            display: inline-block;
            animation: popIn 0.4s forwards;
          }
        `}
      </style>

      <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">
        Recent Reviews
      </h2>

      {displayedReviews.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No reviews yet.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {displayedReviews.map((item, index) => (
              <li
                key={index}
                className="bg-white border border-gray-200 p-5 rounded-lg shadow hover:shadow-md transition"
              >
                {/* Rating */}
                <div className={`${getStarColor(item.rating)} font-bold text-lg mb-2`}>
                  {Array.from({ length: item.rating }).map((_, starIndex) => (
                    <span
                      key={starIndex}
                      className="star-pop"
                      style={{ animationDelay: `${starIndex * 0.15}s` }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>

                {/* Review text */}
                <p className="text-gray-800 leading-relaxed">{item.text}</p>
              </li>
            ))}
          </ul>

          <div className="text-center mt-6 space-y-3">
            {/* View All Reviews Button - Only show if there are more than 5 reviews and not showing all */}
            {reviews.length > 5 && !showAll && (
              <button
                onClick={viewAllReviews}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-lg shadow font-semibold transition"
              >
                View All Reviews
              </button>
            )}

            {/* Load More Button - Only show if showing all and there are more reviews to load */}
            {showAll && hasMore && (
              <button
                onClick={loadMore}
                className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow font-semibold transition"
              >
                Load More Reviews
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewList;