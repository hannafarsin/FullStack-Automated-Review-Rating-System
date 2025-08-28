import React, { useState } from "react";
import type { ReviewItem } from "../hooks/useReviewPredictor";

interface ReviewListProps {
  reviews: ReviewItem[];
  showAll: boolean;
  loadMore: () => void;
  viewAllReviews: () => void;
  hasMore: boolean;
  insights?: {
    summary: string;
  } | null;
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  showAll,
  loadMore,
  viewAllReviews,
  hasMore,
  insights,
}) => {
  const displayedReviews = showAll ? reviews : reviews.slice(0, 5);

  // Track expanded state for each review
  const [expandedReviews, setExpandedReviews] = useState<Record<number, boolean>>({});

  const toggleExpand = (index: number) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="mt-8">
      {/* ✅ Customers say section */}
      {insights?.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Customers say</h2>
          <p className="text-gray-700">{insights.summary}</p>
          <p className="text-xs text-gray-400 mt-1 flex items-center">
            <span className="mr-1">ℹ️</span>
            Generated from customer reviews
          </p>
        </div>
      )}

      {/* ✅ Reviews list */}
      <h2 className="text-lg font-semibold mb-4">Top reviews</h2>

      {displayedReviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet.</p>
      ) : (
        <ul className="space-y-6">
          {displayedReviews.map((item, index) => {
            const isExpanded = expandedReviews[index] || false;
            const shouldTruncate = item.text.length > 150;
            const displayText = isExpanded
              ? item.text
              : shouldTruncate
              ? item.text.slice(0, 150) + "..."
              : item.text;

            return (
              <li key={index} className="border-b pb-4">
                {/* Date */}
                {item.formatted_date && (
                  <p className="text-sm text-gray-500 mb-1">
                    {item.formatted_date}
                  </p>
                )}

                {/* Stars */}
                <div className="flex items-center text-yellow-400 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < item.rating ? "text-yellow-400" : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-2 font-medium text-gray-800">
                    {item.rating} out of 5
                  </span>
                </div>

                {/* Review text with View More/Less */}
                <p className="text-gray-700">
                  {displayText}
                  {shouldTruncate && (
                    <button
                      onClick={() => toggleExpand(index)}
                      className="ml-2 text-blue-500 hover:underline text-sm"
                    >
                      {isExpanded ? "View less" : "View more"}
                    </button>
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      {/* ✅ Buttons */}
      <div className="mt-6 flex flex-col gap-3">
        {reviews.length > 5 && !showAll && (
          <button
            onClick={viewAllReviews}
            className="bg-gray-100 border rounded-md px-4 py-2 text-sm hover:bg-gray-200"
          >
            View all reviews
          </button>
        )}
        {showAll && hasMore && (
          <button
            onClick={loadMore}
            className="bg-gray-100 border rounded-md px-4 py-2 text-sm hover:bg-gray-200"
          >
            Load more reviews
          </button>
        )}
      </div>
    </div>
  );
};

export default ReviewList;
