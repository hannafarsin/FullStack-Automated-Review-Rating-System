import React, { useState } from "react";

interface ReviewFormProps {
  review: string;
  setReview: (val: string) => void;
  onPredict: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ review, setReview, onPredict }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-lg">
      {!isOpen ? (
        // ✅ Amazon-style button (collapsed)
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white border border-gray-400 hover:bg-gray-100 text-gray-800 px-6 py-2 rounded-full transition w-full font-semibold"
        >
          Write a product review
        </button>
      ) : (
        // ✅ Expanded form (when clicked)
        <div className="mt-4 border border-gray-300 rounded-lg bg-white p-4 shadow-sm">
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your thoughts about this product..."
            className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            rows={4}
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-gray-400 rounded-full text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={onPredict}
              className="px-6 py-2 bg-blue-600 hover:bg-orange-500 text-white rounded-full font-semibold"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewForm;
