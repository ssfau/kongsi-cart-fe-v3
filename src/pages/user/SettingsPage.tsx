import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User as UserIcon, Mail, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (error) {
        console.error("Failed to parse user data", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold text-foreground">Profile & Settings</h1>

        <div className="p-4 rounded-lg border border-border bg-card text-foreground space-y-4">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Username</p>
              <p className="text-sm font-medium">{user?.name || "Not available"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{user?.email || "Not available"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Payment Method</p>
              <p className="text-sm font-medium capitalize">{user?.preferredPaymentMethod || "Online Transfer"}</p>
            </div>
          </div>
        </div>

        <Button variant="destructive" onClick={handleLogout} className="w-full h-12 text-base font-medium">
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
