import React from "react";
import { Meal, MealStatus } from "@/hooks/useMeals";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface MealCardProps {
  meal: Meal;
  onToggle: (mealId: Meal["id"]) => void;
  onNoteChange?: (mealId: Meal["id"], note: string) => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, onToggle, onNoteChange }) => {
  const isEaten = meal.status === "eaten";

  return (
    <div
      className={cn(
        "relative w-full p-4 rounded-2xl shadow-md transition-all duration-300 cursor-pointer",
        "border-2 hover:shadow-lg",
        isEaten 
          ? "bg-love-green/20 border-love-green" 
          : "bg-white border-love-pink"
      )}
      onClick={() => onToggle(meal.id)}
      role="button"
      aria-pressed={isEaten}
    >
      <div className="absolute -right-2 -top-2">
        <Heart
          className={cn(
            "w-7 h-7 fill-current transition-all duration-300",
            isEaten 
              ? "text-love-green animate-heartbeat" 
              : "text-love-pink/50"
          )}
        />
      </div>

      <div className="flex flex-col items-start">
        <h3 className="text-lg font-semibold mb-1 text-love-gray">
          {meal.name}
        </h3>
        {/* <p className="text-sm text-muted-foreground mb-3">{meal.time}</p> */}
        
        <div className={cn(
          "px-3 py-1 rounded-full text-sm font-medium",
          isEaten 
            ? "bg-love-green/20 text-green-700" 
            : "bg-love-pink/20 text-pink-700"
        )}>
          {isEaten ? "Yedi ❤️" : "Yemedi 💔"}
        </div>
        {isEaten && onNoteChange && (
          <input
            type="text"
            className="mt-2 w-full rounded-full border border-gray-200 bg-white/80 px-3 py-1 text-sm shadow-inner placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 transition-all"
            placeholder="Neler yedin?"
            value={meal.note || ""}
            onClick={e => e.stopPropagation()}
            onChange={e => onNoteChange(meal.id, e.target.value)}
          />
        )}
      </div>
    </div>
  );
};

export default MealCard;
