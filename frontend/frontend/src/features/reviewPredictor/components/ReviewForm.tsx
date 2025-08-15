import React from "react";

interface ReviewFormProps {
  review: string;
  setReview: (val: string) => void;
  onPredict: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ review, setReview, onPredict }) => {
  return (
    <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-xl w-full max-w-lg">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Write Your Review</h2>
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Share your thoughts about the food..."
        className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        rows={4}
      />
      <button
        onClick={onPredict}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition w-full font-semibold shadow"
      >
        Predict Rating
      </button>
    </div>
  );
};

export default ReviewForm;
