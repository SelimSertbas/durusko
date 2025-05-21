import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const CalorieCalculator: React.FC = () => {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [calories, setCalories] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Kullanıcının önceki kalori verilerini yükle
  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_calories')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data && !error) {
          setWeight(data.weight.toString());
          setHeight(data.height.toString());
          setAge(data.age.toString());
          setGender(data.gender);
          setActivityLevel(data.activity_level);
          setCalories(data.calories);
        }
      }
    };

    loadUserData();
  }, []);

  const calculateCalories = () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const ageNum = parseInt(age);

    if (isNaN(weightNum) || isNaN(heightNum) || isNaN(ageNum)) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doğru şekilde doldurun",
        variant: "destructive",
      });
      return;
    }

    // Harris-Benedict formülü ile BMR hesaplama
    let bmr = 0;
    if (gender === "male") {
      bmr = 88.362 + (13.397 * weightNum) + (4.799 * heightNum) - (5.677 * ageNum);
    } else {
      bmr = 447.593 + (9.247 * weightNum) + (3.098 * heightNum) - (4.330 * ageNum);
    }

    // Aktivite seviyesine göre kalori ihtiyacı
    const activityMultipliers = {
      sedentary: 1.2,      // Hareketsiz
      light: 1.375,        // Az hareketli
      moderate: 1.55,      // Orta hareketli
      active: 1.725,       // Çok hareketli
      veryActive: 1.9      // Aşırı hareketli
    };

    const calculatedCalories = Math.round(bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers]);
    setCalories(calculatedCalories);
  };

  const saveCalories = async () => {
    if (!calories) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı");

      // Profilde kayıt var mı kontrol et
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profile && !profileError) {
        // Güncelle
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            weight: parseFloat(weight),
            height: parseFloat(height),
            age: parseInt(age),
            gender,
            activity_level: activityLevel,
            calories,
            created_at: profile.created_at || new Date().toISOString()
          })
          .eq('id', user.id);
        if (updateError) throw updateError;
      } else {
        // Ekle
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            weight: parseFloat(weight),
            height: parseFloat(height),
            age: parseInt(age),
            gender,
            activity_level: activityLevel,
            calories,
            created_at: new Date().toISOString()
          });
        if (insertError) throw insertError;
      }

      toast({
        title: "Başarılı!",
        description: "Kalori bilgileriniz kaydedildi",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-love-light to-love-cream p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 flex justify-end">
          <Button
            variant="outline"
            className="border-love-pink text-love-pink hover:bg-love-pink/10"
            onClick={() => navigate("/")}
          >
            Ana Sayfaya Dön
          </Button>
        </div>
        <Card className="p-6 bg-white/70 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-center text-love-gray mb-6">Kalori Hesaplayıcı</h1>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kilo (kg)</label>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Örn: 70"
                  className="bg-white/80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Boy (cm)</label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Örn: 170"
                  className="bg-white/80"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yaş</label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Örn: 25"
                  className="bg-white/80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-2 rounded-md border border-gray-300 bg-white/80"
                >
                  <option value="male">Erkek</option>
                  <option value="female">Kadın</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aktivite Seviyesi</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full p-2 rounded-md border border-gray-300 bg-white/80"
              >
                <option value="sedentary">Hareketsiz (Günlük aktivite minimum)</option>
                <option value="light">Az Hareketli (Hafif egzersiz, 1-3 gün/hafta)</option>
                <option value="moderate">Orta Hareketli (Orta egzersiz, 3-5 gün/hafta)</option>
                <option value="active">Çok Hareketli (Yoğun egzersiz, 6-7 gün/hafta)</option>
                <option value="veryActive">Aşırı Hareketli (Çok yoğun egzersiz, fiziksel iş)</option>
              </select>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={calculateCalories}
                className="flex-1 bg-love-pink hover:bg-love-pink/90 text-white"
              >
                Kalori Hesapla
              </Button>
              <Button
                onClick={saveCalories}
                disabled={!calories || loading}
                className="flex-1 bg-love-pink hover:bg-love-pink/90 text-white"
              >
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>

            {calories && (
              <div className="mt-6 p-4 bg-love-pink/10 rounded-lg text-center">
                <h2 className="text-xl font-semibold text-love-gray">Günlük Kalori İhtiyacınız</h2>
                <p className="text-3xl font-bold text-love-pink mt-2">{calories} kcal</p>
                <p className="text-sm text-gray-600 mt-2">
                  Bu değer, günlük aktivite seviyenize göre hesaplanmıştır.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CalorieCalculator; 