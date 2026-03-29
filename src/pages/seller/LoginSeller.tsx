import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Loader2, Mail, Lock, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import api from "../../lib/axios";

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  // If you never want auto-login, we remove the useEffect redirect completely.
  // The user will always see this form every time they visit /seller/login.
  
  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
        role: "handler",
      });

      const { id, role } = response.data.data.user;

      sessionStorage.setItem("demoUserId", id);
      sessionStorage.setItem("demoUserRole", role);

      navigate("/handler/listings");
    } catch (err: any) {
      const apiError = err.response?.data?.error || err.response?.data?.message;
      if (apiError) {
        setError(apiError);
      } else {
        setError("Login failed. Please check your credentials and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--handler-gradient-from))] to-[hsl(var(--handler-gradient-to))] px-4">
      <div className="bg-card text-card-foreground rounded-xl shadow-lg p-8 max-w-md w-full">
        {/* Logo placeholder */}
        <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-card-foreground text-center mb-6">
          Handler Portal Login
        </h1>

        {/* Error message */}
        {error && (
          <p className="text-destructive text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Hidden role field */}
          <input type="hidden" value="handler" />

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                {...register("password", {
                  required: "Password is required",
                })}
              />
            </div>
            {errors.password && (
              <p className="text-destructive text-xs">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-semibold py-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="flex flex-col items-center gap-4 mt-6">
          <p className="text-muted-foreground text-xs text-center">
            Access restricted to authorized sellers. Contact support to request access.
          </p>
          <Link to="/" className="text-sm font-medium underline underline-offset-4 hover:text-primary transition-colors text-muted-foreground">
            Return to User Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
