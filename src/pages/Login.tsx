import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("duru@example.com");
  const [password, setPassword] = useState("selimm");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        toast({
          title: "Hoş geldiniz!",
          description: "Oturumunuz devam ediyor",
        });
        navigate("/");
      }
    };
    
    checkUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/");
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('weight, height, age, gender, activity_level, calories')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          if (data.weight) setWeight(data.weight.toString());
          if (data.height) setHeight(data.height.toString());
          if (data.age) setAge(data.age.toString());
          if (data.gender) setGender(data.gender);
          if (data.activity_level) setActivityLevel(data.activity_level);
          if (data.calories) setCalories(data.calories);
        }
      }
    };

    loadUserData();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          persistSession: true // Oturumu kalıcı olarak sakla
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Giriş başarılı!",
        description: "Hoş geldiniz",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Giriş yapılamadı",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: "duru",
          },
          persistSession: true // Oturumu kalıcı olarak sakla
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Hesap oluşturuldu!",
        description: "Giriş yapabilirsiniz",
      });
    } catch (error: any) {
      toast({
        title: "Hesap oluşturulamadı",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-love-light to-love-cream p-4">
      <div className="w-full max-w-md space-y-8 bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-2">
            <Heart className="w-8 h-8 text-love-pink animate-heartbeat fill-love-pink" />
            <h1 className="text-3xl font-bold text-center text-love-gray">Yemek Takibi</h1>
            <Heart className="w-8 h-8 text-love-pink animate-heartbeat fill-love-pink" />
          </div>
          <p className="mt-2 text-center text-muted-foreground">Giriş yaparak öğünlerini takip et</p>
        </div>
        
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta"
              className="bg-white/80"
              required
            />
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre"
              className="bg-white/80"
              required
            />
          </div>

          <div className="space-y-2">
            <Button 
              type="submit" 
              className="w-full bg-love-pink hover:bg-love-pink/90 text-white" 
              disabled={loading}
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              className="w-full border-love-pink text-love-pink hover:bg-love-pink/10" 
              onClick={handleSignUp}
              disabled={loading}
            >
              Hesabı Oluştur
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
