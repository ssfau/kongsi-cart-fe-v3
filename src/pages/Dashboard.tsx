import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import ShopPage from "@/components/dashboard/ShopPage";
import OrdersPage from "@/components/dashboard/OrdersPage";
import PaymentMethodPage from "@/components/dashboard/PaymentMethodPage";

type Tab = "shop" | "orders" | "payment";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("shop");
  const navigate = useNavigate();

  const tabs: { key: Tab; label: string }[] = [
    { key: "shop", label: "Shop" },
    { key: "orders", label: "Orders" },
    { key: "payment", label: "Payment Method" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-56 flex flex-col justify-between bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] border-r border-[hsl(var(--sidebar-border))]">
        <div className="flex flex-col gap-2 p-4">
          {/* Settings */}
          <button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-[hsl(var(--sidebar-accent))] transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>

          <div className="border-t border-[hsl(var(--sidebar-border))] my-2" />

          {/* Navigation */}
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
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

        {/* Username at bottom */}
        <div className="p-4 border-t border-[hsl(var(--sidebar-border))]">
          <p className="text-sm font-medium truncate">username</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === "shop" && <ShopPage />}
        {activeTab === "orders" && <OrdersPage />}
        {activeTab === "payment" && <PaymentMethodPage />}
      </main>
    </div>
  );
};

export default Dashboard;
