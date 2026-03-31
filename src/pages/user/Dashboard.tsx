import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ShopPage from "@/components/dashboard/ShopPage";
import OrdersPage from "@/components/dashboard/OrdersPage";
import PaymentMethodPage from "@/components/dashboard/PaymentMethodPage";
import { authService } from "@/services/api";

type Tab = "shop" | "orders" | "payment";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("shop");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string>("username");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.name) {
      setUserName(user.name);
    }
  }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: "shop", label: "Shop" },
    { key: "orders", label: "Orders" },
    { key: "payment", label: "Payment Method" },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]">
      <div className="flex flex-col gap-2 p-4">
        <button
          onClick={() => { navigate("/settings"); setSidebarOpen(false); }}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-[hsl(var(--sidebar-accent))] transition-colors"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </button>
        <div className="border-t border-[hsl(var(--sidebar-border))] my-2" />
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSidebarOpen(false); }}
            className={`px-4 py-3 rounded-md text-left text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-[hsl(var(--sidebar-accent))] border-2 border-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary))]"
                : "hover:bg-[hsl(var(--sidebar-accent))]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4 border-t border-[hsl(var(--sidebar-border))]">
        <p className="text-sm font-medium truncate">{userName}</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {isMobile ? (
        <>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <button className="fixed top-3 left-3 z-50 p-2 rounded-md bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-56 bg-[hsl(var(--sidebar-background))]">
              {sidebarContent}
            </SheetContent>
          </Sheet>
          <main className="flex-1 overflow-y-auto pt-14">
            {activeTab === "shop" && <ShopPage />}
            {activeTab === "orders" && <OrdersPage />}
            {activeTab === "payment" && <PaymentMethodPage />}
          </main>
        </>
      ) : (
        <>
          <aside className="w-56 border-r border-[hsl(var(--sidebar-border))]">
            {sidebarContent}
          </aside>
          <main className="flex-1 overflow-y-auto">
            {activeTab === "shop" && <ShopPage />}
            {activeTab === "orders" && <OrdersPage />}
            {activeTab === "payment" && <PaymentMethodPage />}
          </main>
        </>
      )}
    </div>
  );
};

export default Dashboard;
