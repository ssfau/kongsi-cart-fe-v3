import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, Package, CreditCard, User, Bell,
  Menu, Compass, LogOut, Search
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ShopPage from "@/components/dashboard/ShopPage";
import OrdersPage from "@/components/dashboard/OrdersPage";
import PaymentMethodPage from "@/components/dashboard/PaymentMethodPage";
import NotificationPanel, { type Notification } from "@/components/dashboard/NotificationPanel";
import { authService } from "@/services/api";
import logo from "@/assets/kongsi-kart-logo.jpeg";

type Tab = "home" | "orders" | "payment" | "profile";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string>("Guest");
  const [cartCount, setCartCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.name) setUserName(user.name);
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

  const addNotification = useCallback((message: string) => {
    setNotifications(prev => [
      { id: `notif-${Date.now()}`, message, timestamp: new Date(), read: false },
      ...prev,
    ]);
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const handleLogout = useCallback(() => {
    authService.logout();
    navigate("/");
  }, [navigate]);

  // Nav order: Home, Payments, Explore, Inbox (handled separately), Profile
  const navItems: { key: Tab | "explore"; label: string; icon: React.ReactNode }[] = [
    { key: "home", label: "Home", icon: <Home className="h-5 w-5" /> },
    { key: "payment", label: "Payments", icon: <CreditCard className="h-5 w-5" /> },
    { key: "explore", label: "Explore", icon: <Compass className="h-5 w-5" /> },
    { key: "profile", label: "Profile", icon: <User className="h-5 w-5" /> },
  ];

  const handleNavClick = (key: string) => {
    if (key === "profile") navigate("/settings");
    else if (key === "explore") navigate("/explore");
    else setActiveTab(key as Tab);
    setSidebarOpen(false);
  };

  const sidebarBg = "#1A2B32";
  const sidebarBorder = "rgba(140,198,63,0.15)";
  const activeColor = "#8CC63F";
  const inactiveColor = "rgba(255,255,255,0.55)";
  const hoverBg = "rgba(255,255,255,0.08)";

  const mobileNav = (
    <nav className="flex flex-col gap-1 p-3 flex-1">
      {navItems.map((item) => (
        <button
          key={item.key}
          onClick={() => handleNavClick(item.key)}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full"
          style={{
            backgroundColor: activeTab === item.key ? `${activeColor}22` : "transparent",
            color: activeTab === item.key ? activeColor : inactiveColor,
          }}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}

      {/* Inbox in mobile nav */}
      <button
        onClick={() => { setNotifPanelOpen(!notifPanelOpen); setSidebarOpen(false); }}
        className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full relative"
        style={{ color: inactiveColor }}
      >
        <span className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center p-0 text-[9px] kongsi-gradient border-0 text-white">
              {unreadCount}
            </Badge>
          )}
        </span>
        <span>Inbox</span>
      </button>

      <div className="mt-auto pt-4 border-t" style={{ borderColor: sidebarBorder }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all w-full text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
          <span>Log Out</span>
        </button>
      </div>
    </nav>
  );

  const desktopSidebar = (
    <aside
      className="w-16 hover:w-48 transition-all duration-300 flex flex-col items-center group overflow-hidden shrink-0 relative min-h-0"
      style={{ backgroundColor: sidebarBg, borderRight: `1px solid ${sidebarBorder}`, height: "100vh", position: "sticky", top: 0 }}
    >
      <div className="p-3 mt-2 mb-4">
        <img src={logo} alt="Kongsi Kart" className="h-10 w-10 rounded-xl object-cover" />
      </div>

      <nav className="flex flex-col gap-1 px-2 w-full">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => handleNavClick(item.key)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap w-full"
            style={{
              backgroundColor: activeTab === item.key ? `${activeColor}22` : "transparent",
              color: activeTab === item.key ? activeColor : inactiveColor,
            }}
            onMouseEnter={(e) => { if (activeTab !== item.key) (e.currentTarget.style.backgroundColor = hoverBg); }}
            onMouseLeave={(e) => { if (activeTab !== item.key) (e.currentTarget.style.backgroundColor = "transparent"); }}
            title={item.label}
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto mb-4 px-2 w-full space-y-1">
        {/* Inbox */}
        <button
          onClick={() => setNotifPanelOpen(!notifPanelOpen)}
          className="relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all w-full whitespace-nowrap"
          style={{ color: inactiveColor }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hoverBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          title="Inbox"
        >
          <span className="shrink-0 relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center p-0 text-[9px] kongsi-gradient border-0 text-white">
                {unreadCount}
              </Badge>
            )}
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">Inbox</span>
        </button>

        <NotificationPanel
          notifications={notifications}
          open={notifPanelOpen}
          onClose={() => setNotifPanelOpen(false)}
          onClear={clearNotifications}
        />

        {/* Logout — fixed at very bottom */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all w-full whitespace-nowrap"
          style={{ color: "hsl(0,62%,55%)" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(220,38,38,0.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          title="Log Out"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">Log Out</span>
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
            <SheetContent side="left" className="p-0 w-60 flex flex-col" style={{ backgroundColor: sidebarBg }}>
              <div className="p-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${sidebarBorder}` }}>
                <img src={logo} alt="Kongsi Kart" className="h-10 w-10 rounded-xl object-cover" />
                <span className="font-bold kongsi-gradient-text text-lg">Kongsi Kart</span>
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-64 h-9 bg-muted/50 border-none rounded-xl text-sm"
          />
        </div>

        <button
          onClick={() => setActiveTab("orders")}
          className="relative p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <Package className="h-5 w-5" />
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
        return <ShopPage onNotification={addNotification} searchQuery={searchQuery} />;
      case "orders":
        return <OrdersPage />;
      case "payment":
        return <PaymentMethodPage />;
      default:
        return <ShopPage onNotification={addNotification} searchQuery={searchQuery} />;
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
