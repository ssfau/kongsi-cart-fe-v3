import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
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

        <h1 className="text-center text-2xl font-semibold text-foreground">Create Account</h1>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-5">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 bg-card border-border"
          />
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
            Register
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link to="/" className="text-foreground font-medium underline underline-offset-4 hover:text-primary transition-colors">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
