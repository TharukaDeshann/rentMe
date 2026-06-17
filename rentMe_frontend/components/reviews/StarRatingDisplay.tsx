import React from "react";
import { Star } from "lucide-react";

interface StarRatingDisplayProps {
  rating: number;
  size?: number;
  className?: string;
}

export function StarRatingDisplay({
  rating,
  size = 16,
  className = "",
}: StarRatingDisplayProps) {
  const normalizedRating = Math.max(0, Math.min(5, rating));
  const fullStars = Math.floor(normalizedRating);
  const decimal = normalizedRating - fullStars;
  const hasHalfStar = decimal >= 0.25 && decimal < 0.75;
  const extraFullStar = decimal >= 0.75 ? 1 : 0;
  
  const displayFullStars = fullStars + extraFullStar;
  const displayEmptyStars = 5 - displayFullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {/* Full Stars */}
      {Array.from({ length: displayFullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="text-amber-400 fill-amber-400 shrink-0"
          style={{ width: size, height: size }}
        />
      ))}
      
      {/* Half Star */}
      {hasHalfStar && (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <Star
            className="absolute text-gray-300 fill-gray-300"
            style={{ width: size, height: size }}
          />
          <div className="absolute overflow-hidden" style={{ width: "50%", height: size }}>
            <Star
              className="text-amber-400 fill-amber-400"
              style={{ width: size, height: size }}
            />
          </div>
        </div>
      )}
      
      {/* Empty Stars */}
      {Array.from({ length: displayEmptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className="text-gray-300 fill-gray-300 shrink-0"
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
}

export default StarRatingDisplay;
