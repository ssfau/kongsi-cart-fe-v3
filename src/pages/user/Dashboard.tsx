import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, ShoppingCart, User, Settings, Bell,
  Package, CreditCard, Menu
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import ShopPage from "@/components/dashboard/ShopPage";
import OrdersPage from "@/components/dashboard/OrdersPage";
import PaymentMethodPage from "@/components/dashboard/PaymentMethodPage";
import { authService } from "@/services/api";
import logo from "@/assets/kongsi-kart-logo.jpeg";

type Tab = "home" | "orders" | "payment" | "profile";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string>("Guest");
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.name) {
      setUserName(user.name);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("kongsi-cart");
    if (stored) {
      try {
        const items = JSON.parse(stored);
        setCartCount(Array.isArray(items) ? items.length : 0);
      } catch { setCartCount(0); }
    }
  }, [activeTab]);

  const navItems: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "home", label: "Home", icon: <Home className="h-5 w-5" /> },
    { key: "orders", label: "Orders", icon: <Package className="h-5 w-5" /> },
    { key: "payment", label: "Payments", icon: <CreditCard className="h-5 w-5" /> },
    { key: "profile", label: "Profile", icon: <User className="h-5 w-5" /> },
  ];

  const handleNavClick = (key: Tab) => {
    if (key === "profile") navigate("/settings");
    else setActiveTab(key);
    setSidebarOpen(false);
  };

  const mobileNav = (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map((item) => (
        <button
          key={item.key}
          onClick={() => handleNavClick(item.key)}
          className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === item.key
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );

  const desktopSidebar = (
    <aside className="w-16 hover:w-48 transition-all duration-300 border-r border-border bg-card flex flex-col items-center group overflow-hidden shrink-0">
      <div className="p-3 mt-2 mb-4">
        <img src={logo} alt="Kongsi Kart" className="h-10 w-10 rounded-xl object-cover" />
      </div>

      <nav className="flex flex-col gap-1 px-2 w-full">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => handleNavClick(item.key)}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === item.key
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title={item.label}
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="mt-auto mb-4 px-2 w-full">
        <button
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all w-full whitespace-nowrap"
          title="Notifications"
        >
          <span className="shrink-0"><Bell className="h-5 w-5" /></span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Inbox
          </span>
        </button>
      </div>
    </aside>
  );

  const topHeader = (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {isMobile && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <button className="p-2 rounded-xl hover:bg-muted transition-colors">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-60 bg-card">
              <div className="p-4 border-b border-border flex items-center gap-3">
                <img src={logo} alt="Kongsi Kart" className="h-10 w-10 rounded-xl object-cover" />
                <span className="font-bold text-foreground kongsi-gradient-text text-lg">Kongsi Kart</span>
              </div>
              {mobileNav}
            </SheetContent>
          </Sheet>
        )}
        {isMobile && (
          <img src={logo} alt="Kongsi Kart" className="h-8 w-8 rounded-lg object-cover" />
        )}
        <h1 className="text-lg font-bold text-foreground hidden md:block">
          Welcome back, <span className="kongsi-gradient-text">{userName}</span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search produce..."
            className="pl-9 w-64 h-9 bg-muted/50 border-none rounded-xl text-sm"
          />
        </div>

        <button
          onClick={() => navigate("/settings")}
          className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-5 w-5" />
        </button>

        {/* Cart — redirects to orders */}
        <button
          onClick={() => setActiveTab("orders")}
          className="relative p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] kongsi-gradient border-0 text-white">
              {cartCount}
            </Badge>
          )}
        </button>
      </div>
    </header>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <ShopPage />;
      case "orders":
        return <OrdersPage />;
      case "payment":
        return <PaymentMethodPage />;
      default:
        return <ShopPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {!isMobile && desktopSidebar}
      <div className="flex-1 flex flex-col overflow-hidden">
        {topHeader}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
