import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import api from "@/services/api";
import { Eye, EyeOff } from "lucide-react";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Connect to the actual backend API
      const response = await api.post("/auth/register", {
        email,
        username,
        password,
      });

      // Based on your requirements, registration might return a token or just success message
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      
      // Redirect to login or dashboard
      navigate("/");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Something went wrong during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-border bg-card shadow-md flex items-center justify-center">
            <img src={logo} alt="App Logo" width={80} height={80} className="object-contain" />
          </div>
        </div>

        <h1 className="text-center text-2xl font-semibold text-foreground">Create Account</h1>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-5">
          {error && <div className="text-destructive text-sm text-center font-medium">{error}</div>}
          <Input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 bg-card border-border"
            disabled={isLoading}
          />
          <Input
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-12 bg-card border-border"
            disabled={isLoading}
          />
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 bg-card border-border pr-10"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link
            to="/"
            className="text-foreground font-medium underline underline-offset-4 hover:text-primary transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
