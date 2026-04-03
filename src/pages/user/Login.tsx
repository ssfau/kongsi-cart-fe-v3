import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { authService } from "@/services/api.js";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", { email: username, password });
      const result = response.data;
      if (result.success && result.data?.token) {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        toast({ title: "Success", description: "Logged in successfully!" });
        navigate("/dashboard");
      } else {
        toast({ title: "Login Failed", description: result.error || result.message || "Invalid credentials", variant: "destructive" });
      }
    } catch (error: any) {
      if (error.code === "ERR_NETWORK" || error.message?.includes("Network")) {
        toast({ title: "Backend unreachable", description: "Entering demo mode." });
        navigate("/dashboard");
        return;
      }
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || "An unexpected error occurred.";
      toast({
        title: "Login Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <h1 className="text-center text-2xl font-bold text-foreground">Login Page</h1>

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="h-44 w-44 overflow-hidden rounded-full border-4 border-primary bg-card shadow-lg flex items-center justify-center">
            <img src={logo} alt="App Logo" className="w-full h-full object-cover scale-110" />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            type="text"
            placeholder="Username (Email)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-12 bg-card border-border"
            disabled={isLoading}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 bg-card border-border"
            disabled={isLoading}
          />

          <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log In"}
          </Button>
        </form>

        {/* Links */}
        <div className="flex flex-col items-center gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/register" className="text-primary font-medium underline underline-offset-4 hover:text-primary/80 transition-colors">
              Register
            </Link>
          </div>
          <div>
            <Link to="/seller/login" className="text-muted-foreground font-medium underline underline-offset-4 hover:text-primary transition-colors">
              Login as Seller
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

