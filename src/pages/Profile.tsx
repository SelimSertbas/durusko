import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { DailyMeals } from "@/hooks/useMeals";

const Profile: React.FC = () => {
  const [mealHistory, setMealHistory] = useState<DailyMeals[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMealHistory = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("meals")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false });

        if (error) throw error;
        setMealHistory(data || []);
      } catch (error) {
        console.error("Error fetching meal history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMealHistory();
  }, [user]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy, EEEE", { locale: tr });
  };

  const getMealStatusEmoji = (status: string) => {
    return status === "eaten" ? "💚" : "💔";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-love-light to-love-cream p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5 text-love-gray" />
          </Button>
          <h1 className="text-2xl font-bold text-love-gray">Yemek Geçmişim</h1>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-love-gray">Yükleniyor...</p>
          </div>
        ) : mealHistory.length === 0 ? (
          <div className="text-center py-8 bg-white/50 rounded-xl backdrop-blur-sm">
            <p className="text-love-gray">Henüz yemek kaydınız bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mealHistory.map((dailyMeal) => (
              <div
                key={dailyMeal.date}
                className="bg-white/50 rounded-xl p-4 backdrop-blur-sm shadow-soft"
              >
                <h2 className="text-lg font-semibold text-love-gray mb-3">
                  {formatDate(dailyMeal.date)}
                </h2>
                <div className="space-y-3">
                  {dailyMeal.meals.map((meal) => (
                    <div
                      key={`${dailyMeal.date}-${meal.id}`}
                      className="border-b border-love-pink/20 last:border-0 pb-2 last:pb-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-love-gray">
                            {meal.name} {getMealStatusEmoji(meal.status)}
                          </h3>
                        </div>
                      </div>
                      {meal.note && (
                        <p className="mt-1 text-sm text-muted-foreground bg-love-light/30 p-2 rounded-lg">
                          📝 {meal.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 