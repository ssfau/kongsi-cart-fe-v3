import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // API logic placeholder
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

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-12 bg-card border-border"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 bg-card border-border"
          />

          <Button type="submit" className="w-full h-12 text-base font-medium">
            Log In
          </Button>
        </form>

        {/* Links */}
        <div className="flex flex-col items-center gap-3 text-sm">
          <Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Don't have an acc?
          </Link>
          <Link to="/register" className="text-foreground font-medium underline underline-offset-4 hover:text-primary transition-colors">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
