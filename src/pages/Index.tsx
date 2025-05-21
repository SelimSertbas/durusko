import React from "react";
import { useMeals } from "@/hooks/useMeals";
import MealCard from "@/components/MealCard";
import { Heart, LogOut, Calculator, User, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    weekday: 'long'
  };
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', options).format(date);
};

const Index: React.FC = () => {
  const { meals, date, toggleMealStatus, handleNoteChange } = useMeals();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const formattedDate = formatDate(date);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Çıkış yapıldı",
        description: "Görüşmek üzere!",
      });
    } catch (error) {
      toast({
        title: "Çıkış yapılamadı",
        description: "Bir hata oluştu, lütfen tekrar deneyin.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-love-light to-love-cream">
      <header className="pt-8 pb-4 px-4">
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-2">
            <Heart className="w-6 h-6 text-love-pink animate-heartbeat fill-love-pink" />
            <h1 className="text-2xl font-bold text-center text-love-gray">Durusko</h1>
            <Heart className="w-6 h-6 text-love-pink animate-heartbeat fill-love-pink" />
          </div>
          <div className="flex flex-col items-center w-full">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-2xl" style={{ lineHeight: 1 }}>💖</span>
              <span className="text-xl font-semibold text-love-gray" style={{ letterSpacing: 1 }}>{user.user_metadata.username || 'Durusko'}</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-3 w-full">
              <Button
                variant="ghost"
                size="lg"
                className="rounded-full bg-white/60 shadow-md backdrop-blur p-3 hover:bg-love-pink/20 transition-all"
                onClick={() => navigate('/calorie-calculator')}
              >
                <Calculator className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="rounded-full bg-white/60 shadow-md backdrop-blur p-3 hover:bg-love-pink/20 transition-all"
                onClick={() => navigate('/calendar')}
              >
                <Calendar className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="rounded-full bg-white/60 shadow-md backdrop-blur p-3 hover:bg-love-pink/20 transition-all"
                onClick={() => navigate('/profile')}
              >
                <User className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="rounded-full bg-white/60 shadow-md backdrop-blur p-3 hover:bg-love-pink/20 transition-all"
                onClick={() => navigate('/dino')}
              >
                <span className="text-2xl">🐱</span>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="rounded-full bg-white/60 shadow-md backdrop-blur p-3 hover:bg-love-pink/20 transition-all"
                onClick={handleSignOut}
              >
                <LogOut className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-8">
        <div className="max-w-md mx-auto space-y-4">
          {meals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onToggle={toggleMealStatus}
              onNoteChange={handleNoteChange}
            />
          ))}
          
          <div className="text-center mt-8 px-4 py-6 bg-white/50 rounded-xl backdrop-blur-sm">
            <p className="text-sm text-muted-foreground">
              Yemek yemeyi unutma yavrum 💖
            </p>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>Yemek yemeyi unutma yavrum 💖</p>
      </footer>
    </div>
  );
};

export default Index;
