import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { DailyMeals, Meal } from "@/hooks/useMeals";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthlyMeals, setMonthlyMeals] = useState<Record<string, DailyMeals>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

  useEffect(() => {
    const fetchMonthlyMeals = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("meals")
          .select("*")
          .eq("user_id", user.id)
          .gte("date", format(startDate, "yyyy-MM-dd"))
          .lte("date", format(endDate, "yyyy-MM-dd"));

        if (error) throw error;

        const mealsMap: Record<string, DailyMeals> = {};
        data?.forEach(item => {
          mealsMap[item.date] = item as unknown as DailyMeals;
        });
        setMonthlyMeals(mealsMap);
      } catch (error) {
        console.error("Error fetching monthly meals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyMeals();
  }, [user, currentDate]);

  const calculateDayProgress = (meals: Meal[]) => {
    const eatenCount = meals.filter(meal => meal.status === "eaten").length;
    return (eatenCount / meals.length) * 100;
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "bg-green-500";
    if (progress > 0) return "bg-gradient-to-t from-green-500 to-rose-200";
    return "bg-rose-200";
  };

  const previousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-love-light to-love-cream p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5 text-love-gray" />
          </Button>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={previousMonth}
              className="text-love-gray hover:text-love-pink"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-love-gray">
              {format(currentDate, "MMMM yyyy", { locale: tr })}
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="text-love-gray hover:text-love-pink"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="w-10" /> {/* Spacing için */}
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(day => (
            <div
              key={day}
              className="text-center text-sm font-medium text-love-gray"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((date, index) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const dayMeals = monthlyMeals[dateStr];
            const progress = dayMeals ? calculateDayProgress(dayMeals.meals) : 0;
            const progressColor = getProgressColor(progress);

            return (
              <div
                key={dateStr}
                className={`
                  aspect-square p-2 rounded-xl backdrop-blur-sm
                  ${isSameMonth(date, currentDate) ? "bg-white/50" : "bg-white/20"}
                  ${isToday(date) ? "ring-2 ring-love-pink" : ""}
                  relative overflow-hidden cursor-pointer hover:ring-2 hover:ring-love-pink/50
                  transition-all duration-200
                `}
                onClick={() => navigate(`/day/${dateStr}`)}
              >
                <div className="relative z-10">
                  <span className={`
                    text-sm font-medium
                    ${isSameMonth(date, currentDate) ? "text-love-gray" : "text-love-gray/50"}
                  `}>
                    {format(date, "d")}
                  </span>
                </div>
                <div
                  className={`absolute bottom-0 left-0 w-full transition-all duration-300 ${progressColor}`}
                  style={{ height: `${progress}%` }}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-white/50 rounded-xl backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-love-gray mb-2">Renk Açıklamaları</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-green-500" />
              <span className="text-sm text-love-gray">Tüm öğünler tamamlandı</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-t from-green-500 to-rose-200" />
              <span className="text-sm text-love-gray">Bazı öğünler tamamlandı</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-rose-200" />
              <span className="text-sm text-love-gray">Hiç öğün tamamlanmadı</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar; 