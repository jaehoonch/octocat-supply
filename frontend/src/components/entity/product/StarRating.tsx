import { useState } from 'react';

interface StarRatingProps {
  productId: number;
  productName: string;
  rating: number;
  onRate: (productId: number, rating: number) => void;
}

const STAR_COUNT = 5;

export default function StarRating({ productId, productName, rating, onRate }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  return (
    <div
      className="flex items-center space-x-1"
      onMouseLeave={() => setHoverRating(0)}
      role="radiogroup"
      aria-label={`Rate ${productName}`}
    >
      {Array.from({ length: STAR_COUNT }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayRating;

        return (
          <button
            key={starValue}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRate(productId, starValue);
            }}
            onMouseEnter={(e) => {
              e.stopPropagation();
              setHoverRating(starValue);
            }}
            className={`transform transition-all duration-150 ease-out hover:scale-125 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded-full ${
              isFilled ? 'drop-shadow-[0_0_6px_rgba(220,38,38,0.8)]' : ''
            }`}
            role="radio"
            aria-checked={starValue === rating}
            aria-label={`${starValue} star${starValue > 1 ? 's' : ''} for ${productName}`}
            id={`star-${starValue}-${productId}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className={`w-7 h-7 transition-colors duration-150 ${
                isFilled ? 'text-red-600' : 'text-gray-300'
              }`}
              fill={isFilled ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
