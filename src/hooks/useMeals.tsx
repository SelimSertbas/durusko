import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type MealStatus = "eaten" | "not-eaten";

export interface Meal {
  id: "breakfast" | "lunch" | "dinner";
  name: string;
  time: string;
  status: MealStatus;
  note?: string;
}

export interface DailyMeals {
  date: string;
  meals: Meal[];
}

const initialMeals: Meal[] = [
  {
    id: "breakfast",
    name: "Kahvaltı",
    time: "07:00 - 09:00",
    status: "not-eaten",
    note: ""
  },
  {
    id: "lunch",
    name: "Öğle Yemeği",
    time: "12:00 - 14:00",
    status: "not-eaten",
    note: ""
  },
  {
    id: "dinner",
    name: "Akşam Yemeği",
    time: "19:00 - 21:00",
    status: "not-eaten",
    note: ""
  }
];

export const useMeals = () => {
  const [dailyMeals, setDailyMeals] = useState<DailyMeals>({
    date: new Date().toISOString().split('T')[0],
    meals: initialMeals
  });
  
  const { user } = useAuth();

  // Load meals from Supabase or localStorage as fallback
  useEffect(() => {
    const loadMeals = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      if (user) {
        // Try to load from Supabase
        const { data, error } = await supabase
          .from('meals')
          .select('*')
          .eq('date', today)
          .eq('user_id', user.id)
          .single();
        
        if (data && !error) {
          setDailyMeals(data as DailyMeals);
        } else {
          // If no data in Supabase, check localStorage
          const savedMeals = localStorage.getItem(`meals_${today}`);
          if (savedMeals) {
            setDailyMeals(JSON.parse(savedMeals));
          } else {
            // If no local data, initialize with today's date
            setDailyMeals({
              date: today,
              meals: initialMeals
            });
          }
        }
      } else {
        // Fallback to localStorage if not authenticated
        const savedMeals = localStorage.getItem(`meals_${today}`);
        if (savedMeals) {
          setDailyMeals(JSON.parse(savedMeals));
        } else {
          // If no local data, initialize with today's date
          setDailyMeals({
            date: today,
            meals: initialMeals
          });
        }
      }
    };

    loadMeals();
  }, [user]);

  // Save meals whenever they change
  useEffect(() => {
    const saveMeals = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Always save to localStorage as fallback
      localStorage.setItem(`meals_${today}`, JSON.stringify(dailyMeals));
      
      if (user) {
        try {
          // First try to get existing record
          const { data: existingData } = await supabase
            .from('meals')
            .select('id')
            .eq('date', today)
            .eq('user_id', user.id)
            .single();

          if (existingData) {
            // Update existing record
            const { error: updateError } = await supabase
              .from('meals')
              .update({
                meals: dailyMeals.meals,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingData.id);

            if (updateError) throw updateError;
          } else {
            // Insert new record
            const { error: insertError } = await supabase
              .from('meals')
              .insert({
                user_id: user.id,
                date: today,
                meals: dailyMeals.meals
              });

            if (insertError) throw insertError;
          }
        } catch (error) {
          console.error('Error saving meals:', error);
          // Fallback to localStorage only
          localStorage.setItem(`meals_${today}`, JSON.stringify(dailyMeals));
        }
      }
    };

    saveMeals();
  }, [dailyMeals, user]);

  const toggleMealStatus = (id: Meal["id"]) => {
    setDailyMeals(prevState => {
      const updatedMeals = prevState.meals.map(meal => {
        if (meal.id === id) {
          return {
            ...meal,
            status: meal.status === "eaten" ? "not-eaten" : "eaten"
          };
        }
        return meal;
      });

      return {
        ...prevState,
        meals: updatedMeals
      };
    });
  };

  const handleNoteChange = (mealId: Meal["id"], note: string) => {
    setDailyMeals(prevState => {
      const updatedMeals = prevState.meals.map(meal =>
        meal.id === mealId ? { ...meal, note } : meal
      );
      return { ...prevState, meals: updatedMeals };
    });
  };

  return {
    meals: dailyMeals.meals,
    date: dailyMeals.date,
    toggleMealStatus,
    handleNoteChange
  };
};
