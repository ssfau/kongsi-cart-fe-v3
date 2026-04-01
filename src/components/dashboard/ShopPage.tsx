import { useState, useEffect, useMemo } from "react";
import { shopItemCategories, type ShopItemCategory } from "@/data/shopItems";
import ItemDetail from "./ItemDetail";
import api from "@/lib/axios";
import { Progress } from "@/components/ui/progress";
import { Leaf, TrendingUp, Users, ShoppingCart } from "lucide-react";

export interface ListingItem {
  _id: string;
  category: string;
  itemName: string;
  companyName?: string;
  depositPerUnit: number;
  estimatedPriceMax: number;
  state?: string;
  district?: string;
  collectionPoint?: string;
  currentDemand?: number;
  targetDemand?: number;
}

type CategoryGroup = "All" | "Leafy Greens" | "Vegetables" | "Fruits";

const ShopPage = () => {
  const [selectedItem, setSelectedItem] = useState<ListingItem | null>(null);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<CategoryGroup>("All");

  // Simulated community pool progress
  const [poolProgress, setPoolProgress] = useState(62);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get("/listings");
        const enrichedListings = response.data.data.map((item: ListingItem) => ({
          ...item,
          state: item.state || "Unspecified Location",
          district: item.district || "Unspecified District",
          collectionPoint: item.collectionPoint || "Main Hub",
          currentDemand: item.currentDemand || Math.floor(Math.random() * 100),
          targetDemand: item.targetDemand || 100,
        }));
        setListings(enrichedListings);
      } catch (err) {
        console.error("Failed to fetch listings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  // Animate pool progress
  useEffect(() => {
    const interval = setInterval(() => {
      setPoolProgress((prev) => {
        const next = prev + Math.random() * 2;
        return next >= 95 ? 62 : next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const categoryGroups: CategoryGroup[] = ["All", "Leafy Greens", "Vegetables", "Fruits"];

  const filteredListings = useMemo(() => {
    if (activeGroup === "All") return listings;
    const categoryNames = shopItemCategories
      .filter((c) => c.group === activeGroup)
      .map((c) => c.name);
    return listings.filter((item) => categoryNames.includes(item.category));
  }, [listings, activeGroup]);

  if (selectedItem) {
    return <ItemDetail item={selectedItem} onBack={() => setSelectedItem(null)} />;
  }

  const isPoolNearTarget = poolProgress >= 80;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div
        className={`kongsi-gradient rounded-2xl p-6 md:p-8 mb-8 text-white relative overflow-hidden ${
          isPoolNearTarget ? "animate-pulse-glow" : ""
        }`}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium opacity-90">Neighborhood Pool</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-1">
            Kongsi the cart, kongsi the cost
          </h2>
          <p className="text-sm opacity-80 mb-4 max-w-lg">
            Join your neighbors to unlock community prices. The more people join, the lower the price!
          </p>

          {/* Pool progress bar */}
          <div className="max-w-md">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium">Community Progress</span>
              <span className="font-bold">{Math.round(poolProgress)}% of target</span>
            </div>
            <div className="h-3 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-1000 ease-out"
                style={{ width: `${poolProgress}%` }}
              />
            </div>
            <p className="text-xs mt-2 opacity-80">
              {isPoolNearTarget
                ? "🎉 Almost there! Deposit prices unlocked soon!"
                : `${Math.round(80 - poolProgress)}% more to unlock deposit prices for all items`}
            </p>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -right-5 bottom-0 w-24 h-24 rounded-full bg-white/5" />
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {categoryGroups.map((group) => (
          <button
            key={group}
            onClick={() => setActiveGroup(group)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeGroup === group
                ? "kongsi-gradient text-white shadow-md"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-16">
          <Leaf className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-lg">No produce available in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredListings.map((item) => {
            const categoryData = shopItemCategories.find((c) => c.name === item.category);
            const icon = categoryData ? categoryData.image : "📦";
            const displayName = categoryData?.displayName || item.itemName;
            const demandPercent = item.currentDemand
              ? Math.min(100, (item.currentDemand / (item.targetDemand || 100)) * 100)
              : 0;
            const isDepositUnlocked = demandPercent >= 80;

            return (
              <button
                key={item._id}
                onClick={() => setSelectedItem(item)}
                className="flex flex-col rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group"
              >
                {/* Icon area */}
                <div className="bg-muted/50 p-4 flex items-center justify-center h-32 group-hover:bg-primary/5 transition-colors">
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                    {icon}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    <Leaf className="h-3 w-3" />
                    Direct from Supplier
                  </span>
                  <h3 className="text-sm font-bold text-card-foreground leading-snug line-clamp-2">
                    {displayName}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {item.companyName || "Independent Seller"}
                  </span>

                  {/* Pricing */}
                  <div className="mt-auto pt-2 border-t border-border/50">
                    {isDepositUnlocked ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-primary">
                          RM {item.depositPerUnit.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground line-through">
                          RM {item.estimatedPriceMax.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-primary font-medium">/kg</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-bold text-foreground">
                            RM {item.estimatedPriceMax.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">/kg</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          Target: RM {item.depositPerUnit.toFixed(2)}/kg
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Demand progress */}
                  <div className="mt-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-2.5 w-2.5" /> Demand
                      </span>
                      <span className="text-[10px] font-medium text-foreground">
                        {Math.round(demandPercent)}%
                      </span>
                    </div>
                    <Progress
                      value={demandPercent}
                      className={`h-1.5 ${isDepositUnlocked ? "[&>div]:bg-primary" : ""}`}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShopPage;
