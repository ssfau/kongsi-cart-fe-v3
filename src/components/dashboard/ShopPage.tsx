import { useState, useEffect, useMemo } from "react";
import { shopItemCategories, type ShopItemCategory } from "@/data/shopItems";
import { fakeListings } from "@/data/fakeListings";
import ItemDetail from "./ItemDetail";
import api from "@/lib/axios";
import { Progress } from "@/components/ui/progress";
import { Leaf, TrendingUp, Users } from "lucide-react";
import musangKingHero from "@/assets/musang-king-hero.jpg";
import { produceImages } from "@/assets/produce";

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

interface ShopPageProps {
  onNotification?: (msg: string) => void;
}

const ShopPage = ({ onNotification }: ShopPageProps = {}) => {
  const [selectedItem, setSelectedItem] = useState<ListingItem | null>(null);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<CategoryGroup>("All");

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
        console.warn("Backend unreachable, using synthetic listings", err);
        setListings(fakeListings);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
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
    return <ItemDetail item={selectedItem} onBack={() => setSelectedItem(null)} onNotification={onNotification} />;
  }

  // Find durian listing for hero
  const durianListing = listings.find((l) => l.category === "Durian");
  const durianDemand = durianListing?.currentDemand ?? 85;
  const durianTarget = durianListing?.targetDemand ?? 100;
  const durianPercent = Math.min(100, (durianDemand / durianTarget) * 100);
  const durianCommunityPrice = durianListing?.depositPerUnit?.toFixed(2) ?? "45.00";
  const durianRetailPrice = durianListing?.estimatedPriceMax?.toFixed(2) ?? "75.00";

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Hero Banner — Musang King Ad */}
      <div className="relative rounded-2xl overflow-hidden mb-8 group">
        {/* Background image */}
        <img
          src={musangKingHero}
          alt="Musang King Durian"
          className="w-full h-64 md:h-80 object-cover"
          width={1920}
          height={640}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12">
          {/* Watermark slogan */}
          <p className="text-xs md:text-sm text-muted-foreground/60 font-medium tracking-widest uppercase mb-2">
            Kongsi the cart, kongsi the cost
          </p>

          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-1 tracking-tight">
            KONGSI THE KING
          </h2>
          <p className="text-kongsi-orange font-bold text-lg md:text-xl mb-3">
            Musang King Durian — Hottest Product 🔥
          </p>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl md:text-3xl font-extrabold text-white">
              RM {durianCommunityPrice}/kg
            </span>
            <span className="text-base text-white/50 line-through">
              RM {durianRetailPrice}/kg
            </span>
            <span className="text-xs bg-kongsi-green/20 text-kongsi-green px-2 py-0.5 rounded-full font-semibold">
              Community Price
            </span>
          </div>

          {/* Pool progress */}
          <div className="max-w-sm mb-4">
            <div className="flex items-center justify-between text-xs text-white/70 mb-1">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" /> Pool Progress
              </span>
              <span className="font-bold text-white">{Math.round(durianPercent)}% Full</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-kongsi-green to-kongsi-orange transition-all duration-1000"
                style={{ width: `${durianPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-white/50 mt-1">
              Join now to lock in the lowest price!
            </p>
          </div>

          {/* Join Pool CTA */}
          <button
            onClick={() => {
              if (durianListing) setSelectedItem(durianListing);
            }}
            className="w-fit px-8 py-3 rounded-xl bg-gradient-to-r from-kongsi-green to-kongsi-orange text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-glow"
          >
            Join Pool — RM {durianCommunityPrice}/kg
          </button>
        </div>
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
            const imageUrl = produceImages[item.category] || "";
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
