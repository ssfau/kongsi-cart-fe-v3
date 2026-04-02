import { useState, useCallback } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  Package, BarChart3, Truck, LogOut, Menu,
  PlusCircle, ShieldCheck,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/kongsi-kart-logo.jpeg";

const navItems = [
  { key: "/handler/listings", label: "Inventory", icon: <Package className="h-5 w-5" /> },
  { key: "/handler/demand", label: "Demand", icon: <BarChart3 className="h-5 w-5" /> },
  { key: "/handler/dispatch", label: "Dispatch", icon: <Truck className="h-5 w-5" /> },
  { key: "/handler/listings/new", label: "New Listing", icon: <PlusCircle className="h-5 w-5" /> },
];

export default function SellerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const activeKey = navItems.find((n) => location.pathname === n.key)?.key
    || navItems.find((n) => location.pathname.startsWith(n.key) && n.key !== "/handler/listings/new")?.key
    || "/handler/listings";

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("demoUserId");
    sessionStorage.removeItem("demoUserRole");
    localStorage.removeItem("demoUserId");
    localStorage.removeItem("demoUserRole");
    navigate("/seller/login");
  }, [navigate]);

  const handleNavClick = (key: string) => {
    navigate(key);
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
            backgroundColor: activeKey === item.key ? `${activeColor}22` : "transparent",
            color: activeKey === item.key ? activeColor : inactiveColor,
          }}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}

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
              backgroundColor: activeKey === item.key ? `${activeColor}22` : "transparent",
              color: activeKey === item.key ? activeColor : inactiveColor,
            }}
            onMouseEnter={(e) => { if (activeKey !== item.key) e.currentTarget.style.backgroundColor = hoverBg; }}
            onMouseLeave={(e) => { if (activeKey !== item.key) e.currentTarget.style.backgroundColor = "transparent"; }}
            title={item.label}
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto mb-4 px-2 w-full space-y-1">
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
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary hidden md:block" />
          <h1 className="text-lg font-bold text-foreground hidden md:block">
            Supplier <span className="kongsi-gradient-text">Command Center</span>
          </h1>
        </div>
      </div>
    </header>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {!isMobile && desktopSidebar}
      <div className="flex-1 flex flex-col overflow-hidden">
        {topHeader}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
