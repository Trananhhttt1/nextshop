import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  showEmpty?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({
  rating,
  showEmpty = true,
  size = "sm",
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = showEmpty ? 5 - fullStars - (hasHalfStar ? 1 : 0) : 0;

  const sizeClass = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];

  return (
    <div className="flex text-yellow-400">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className={`fill-current ${sizeClass}`} />
      ))}

      {hasHalfStar && (
        <StarHalf key="half" className={`fill-current ${sizeClass}`} />
      )}

      {showEmpty &&
        [...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className={`text-gray-300 ${sizeClass}`} />
        ))}
    </div>
  );
}
