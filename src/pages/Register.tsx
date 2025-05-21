import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signUp(email, password, username);
      toast({
        title: "Kayıt başarılı!",
        description: "Hoş geldiniz! Giriş yapabilirsiniz.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Kayıt başarısız",
        description: "Lütfen bilgilerinizi kontrol edip tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-love-light to-love-cream p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2">
            <Heart className="w-6 h-6 text-love-pink animate-heartbeat fill-love-pink" />
            <h1 className="text-2xl font-bold text-love-gray">Kayıt Ol</h1>
            <Heart className="w-6 h-6 text-love-pink animate-heartbeat fill-love-pink" />
          </div>
          <p className="text-muted-foreground mt-2">
            Yemek takibi yapmaya başlamak için kayıt olun
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Kullanıcı Adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl border border-love-pink/20 bg-white/50 backdrop-blur-sm focus:border-love-pink focus:ring-love-pink"
            />
          </div>
          <div>
            <Input
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl border border-love-pink/20 bg-white/50 backdrop-blur-sm focus:border-love-pink focus:ring-love-pink"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-xl border border-love-pink/20 bg-white/50 backdrop-blur-sm focus:border-love-pink focus:ring-love-pink"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-love-pink hover:bg-love-pink/90 text-white rounded-xl py-2"
          >
            {loading ? "Kaydediliyor..." : "Kayıt Ol"}
          </Button>
        </form>

        <p className="text-center mt-4 text-muted-foreground">
          Zaten hesabınız var mı?{" "}
          <Link to="/login" className="text-love-pink hover:underline">
            Giriş yapın
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register; 