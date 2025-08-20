import React from "react";
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
    viewAllReviews, // Add this
    showAll,
    hasMore // Add this too
  } = useReviewPredictor();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      {/* Header */}
      <header className="bg-gray-900 text-white w-full py-4 shadow-md text-center text-2xl font-bold rounded-b-lg">
        🍽️ Food Review Predictor
      </header>

      {/* Main content */}
      <main className="flex flex-col items-center w-full flex-grow mt-6">
        <ReviewForm review={review} setReview={setReview} onPredict={handlePredict} />
        <ReviewList 
          reviews={reviews} 
          showAll={showAll} 
          loadMore={loadMore}
          viewAllReviews={viewAllReviews} // Add this
          hasMore={hasMore} // Add this
        />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 w-full py-3 text-center mt-8 rounded-t-lg">
        © {new Date().getFullYear()} Food Review Predictor | Built with ❤️
      </footer>
    </div>
  );
};

export default ReviewPredictor;