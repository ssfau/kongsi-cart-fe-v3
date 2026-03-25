import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const SettingsPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: API logout logic
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold text-foreground">Settings</h1>

        <div className="p-4 rounded-lg border border-border bg-card text-sm text-muted-foreground">
          <p>Settings options will be available here.</p>
        </div>

        <Button variant="destructive" onClick={handleLogout} className="w-full h-12 text-base font-medium">
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
