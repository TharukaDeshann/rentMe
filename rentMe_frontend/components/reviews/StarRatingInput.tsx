import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
  className?: string;
  disabled?: boolean;
}

export function StarRatingInput({
  value,
  onChange,
  size = 28,
  className = "",
  disabled = false,
}: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const handleMouseEnter = (val: number) => {
    if (disabled) return;
    setHoverValue(val);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverValue(null);
  };

  const handleClick = (val: number) => {
    if (disabled) return;
    onChange(val);
  };

  const activeValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {Array.from({ length: 5 }).map((_, idx) => {
        const starVal = idx + 1;
        const isFilled = starVal <= activeValue;

        return (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onMouseEnter={() => handleMouseEnter(starVal)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starVal)}
            className={`transition-all duration-150 transform focus:outline-none focus:scale-110 ${
              disabled
                ? "cursor-not-allowed opacity-60"
                : "cursor-pointer hover:scale-115 active:scale-95"
            }`}
            aria-label={`Rate ${starVal} Star${starVal > 1 ? "s" : ""}`}
          >
            <Star
              className={`transition-colors duration-150 ${
                isFilled
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-300 fill-transparent hover:text-amber-300"
              }`}
              style={{ width: size, height: size }}
            />
          </button>
        );
      })}
    </div>
  );
}

export default StarRatingInput;
