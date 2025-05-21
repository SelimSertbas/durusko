import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import type { DailyMeals, Meal } from "@/hooks/useMeals";

const DayDetail = () => {
  const { date } = useParams<{ date: string }>();
  const [dayMeals, setDayMeals] = useState<DailyMeals | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDayMeals = async () => {
      if (!user || !date) return;
      try {
        const { data, error } = await supabase
          .from("meals")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", date)
          .single();
        if (error) throw error;
        let meals: Meal[] = [];
        if (data) {
          if (Array.isArray(data.meals)) {
            meals = data.meals as unknown as Meal[];
          } else if (typeof data.meals === 'string') {
            try {
              meals = JSON.parse(data.meals);
            } catch {
              meals = [];
            }
          }
        }
        setDayMeals(data ? { ...data, meals } as DailyMeals : null);
      } catch (error) {
        setDayMeals(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDayMeals();
  }, [user, date]);

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
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5 text-love-gray" />
          </Button>
          <h1 className="text-2xl font-bold text-love-gray">
            {date ? format(new Date(date), "d MMMM yyyy, EEEE", { locale: tr }) : "Gün Detayı"}
          </h1>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-love-gray">Yükleniyor...</p>
          </div>
        ) : !dayMeals ? (
          <div className="text-center py-8 bg-white/50 rounded-xl backdrop-blur-sm">
            <p className="text-love-gray">Bu gün için kayıt bulunamadı.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dayMeals.meals.map((meal: Meal) => (
              <div
                key={meal.id}
                className="bg-white/50 rounded-xl p-4 backdrop-blur-sm shadow-soft"
              >
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-semibold text-love-gray">
                    {meal.name} {getMealStatusEmoji(meal.status)}
                  </h2>
                </div>
                {meal.note && (
                  <p className="mt-1 text-sm text-muted-foreground bg-love-light/30 p-2 rounded-lg">
                    📝 {meal.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayDetail; 