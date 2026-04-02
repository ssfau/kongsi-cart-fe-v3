import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { shopItemCategories } from "@/data/shopItems";
import { fakeListings } from "@/data/fakeListings";
import ItemDetail from "./ItemDetail";
import SplitHeroMap from "./SplitHeroMap";
import api from "@/lib/axios";
import { Progress } from "@/components/ui/progress";
import { Leaf, TrendingUp, Users, MapPin } from "lucide-react";
import { produceImages } from "@/assets/produce";
import { useUserLocation } from "@/hooks/useUserLocation";
import { getListingCoords, getDistanceKm } from "@/data/locationCoordinates";
import { useToast } from "@/hooks/use-toast";

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
  searchQuery?: string;
}

/** Resolve display name: prioritize backend itemName, fall back to category displayName */
const getDisplayName = (item: ListingItem, isBackend: boolean): string => {
  if (isBackend && item.itemName && item.itemName !== item.category) {
    return item.itemName;
  }
  const cat = shopItemCategories.find((c) => c.name === item.category);
  return cat?.displayName || item.itemName || item.category;
};

// ─── Hero banner category config ───
interface CategoryHeroConfig {
  catchphrase: string;
  nameColor: string; // hex
}

const categoryHeroMap: Record<string, CategoryHeroConfig> = {
  Fruits: { catchphrase: "KONGSI THE KING", nameColor: "#F7941E" },
  "Leafy Greens": { catchphrase: "CRUNCH THE COST", nameColor: "#2D5A27" },
  Vegetables: { catchphrase: "FRESHER, TOGETHER", nameColor: "#8CC63F" },
};

const ShopPage = ({ onNotification, searchQuery = "" }: ShopPageProps) => {
  const [selectedItem, setSelectedItem] = useState<ListingItem | null>(null);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBackendData, setIsBackendData] = useState(false);
  const [activeGroup, setActiveGroup] = useState<CategoryGroup>("All");
  const userLocation = useUserLocation();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (userLocation.error && onNotification) {
      onNotification(userLocation.error);
    }
  }, [userLocation.error]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get("/listings");
        console.log("API Raw Response:", response.data);
        const rawData = Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.listings || []);
        console.log("API Parsed Data:", rawData);
        if (!Array.isArray(rawData) || rawData.length === 0) {
          throw new Error("No listings from backend");
        }
        const enrichedListings = rawData.map((item: any) => ({
          _id: item._id || item.id || crypto.randomUUID(),
          category: item.category || "Tomato",
          itemName: item.itemName || item.name || item.title || item.category || "Fresh Produce",
          companyName: item.companyName || item.company_name,
          depositPerUnit: Number(item.depositPerUnit ?? item.deposit_per_unit ?? 0),
          estimatedPriceMax: Number(item.estimatedPriceMax ?? item.estimated_price_max ?? 0),
          state: item.state || "Unspecified Location",
          district: item.district || "Unspecified District",
          collectionPoint: item.collectionPoint || item.collection_point || "Main Hub",
          currentDemand: item.currentDemand ?? item.current_demand ?? Math.floor(Math.random() * 100),
          targetDemand: item.targetDemand ?? item.target_demand ?? 100,
        }));
        console.log("API Enriched Listings:", enrichedListings);
        setListings(enrichedListings);
        setIsBackendData(true);
      } catch (err) {
        console.error("API Error:", err);
        console.warn("Backend unreachable — showing empty state (no fallback data)");
        setListings([]);
        setIsBackendData(false);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const categoryGroups: CategoryGroup[] = ["All", "Leafy Greens", "Vegetables", "Fruits"];

  const filteredListings = useMemo(() => {
    let items = listings;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((item) => {
        const displayName = getDisplayName(item, isBackendData);
        return (
          displayName.toLowerCase().includes(q) ||
          item.itemName.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.district || "").toLowerCase().includes(q) ||
          (item.state || "").toLowerCase().includes(q)
        );
      });
    }

    if (activeGroup !== "All") {
      const categoryNames = shopItemCategories
        .filter((c) => c.group === activeGroup)
        .map((c) => c.name);
      items = items.filter((item) => categoryNames.includes(item.category));
    }

    return items
      .map((item) => {
        const coords = getListingCoords(item.district, item.state);
        const distance = getDistanceKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
        return { ...item, _distance: distance };
      })
      .sort((a, b) => a._distance - b._distance);
  }, [listings, activeGroup, userLocation.lat, userLocation.lng, searchQuery, isBackendData]);

  // ─── Weighted "Smart" Hero Banner ───
  // Score = (demandPercent * 0.7) + (inverseDistance * 0.3)
  const heroItem = useMemo(() => {
    if (listings.length === 0) return null;

    const scored = listings.map((item) => {
      const demandPercent = item.currentDemand
        ? Math.min(100, (item.currentDemand / (item.targetDemand || 100)) * 100)
        : 0;
      const coords = getListingCoords(item.district, item.state);
      const dist = getDistanceKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
      const inverseDist = Math.max(0, 100 - dist);
      const score = demandPercent * 0.7 + inverseDist * 0.3;
      return { item, score, demandPercent, dist };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0] || null;
  }, [listings, userLocation.lat, userLocation.lng]);

  // Resolve hero config
  const heroListing = heroItem?.item || null;

  if (selectedItem) {
    return <ItemDetail item={selectedItem} onBack={() => setSelectedItem(null)} onNotification={onNotification} />;
  }
  const heroName = heroListing ? getDisplayName(heroListing, isBackendData) : "Musang King Durian";
  const heroCategory = heroListing?.category || "Durian";
  const heroCatData = shopItemCategories.find((c) => c.name === heroCategory);
  const heroGroup = heroCatData?.group || "Fruits";
  const heroConfig = categoryHeroMap[heroGroup] || categoryHeroMap["Fruits"];
  const heroDemand = heroItem?.demandPercent ?? 85;
  const heroCommunityPrice = (heroListing?.depositPerUnit ?? 45).toFixed(2);
  const heroRetailPrice = (heroListing?.estimatedPriceMax ?? 75).toFixed(2);
  const heroImage = produceImages[heroCategory] || produceImages["Durian"] || "";
  const heroDistance = heroItem?.dist;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* ─── Split-Hero: 60% Promo / 40% Map ─── */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        {/* LEFT 60% — Weighted Smart Hero Banner */}
        <div className="lg:w-[60%] relative rounded-[20px] overflow-hidden min-h-[320px]">
          {heroImage ? (
            <img
              src={heroImage}
              alt={heroName}
              className="w-full h-full min-h-[320px] object-cover absolute inset-0"
              width={1920}
              height={640}
            />
          ) : (
            <div className="w-full h-full min-h-[320px] bg-muted absolute inset-0" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12">
            <p className="text-xs md:text-sm text-muted-foreground/60 font-medium tracking-widest uppercase mb-2">
              Kongsi the cart, kongsi the cost
            </p>

            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-1 tracking-tight">
              {heroConfig.catchphrase}
            </h2>
            <p className="font-bold text-lg md:text-xl mb-3" style={{ color: heroConfig.nameColor }}>
              {heroName} — Hottest Product
            </p>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl md:text-3xl font-extrabold text-white">
                RM {heroCommunityPrice}/kg
              </span>
              <span className="text-base text-white/50 line-through">
                RM {heroRetailPrice}/kg
              </span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">
                Community Price
              </span>
            </div>

            {/* Pool progress */}
            <div className="max-w-sm mb-4">
              <div className="flex items-center justify-between text-xs text-white/70 mb-1">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> Pool Progress
                </span>
                <span className="font-bold text-white">{Math.round(heroDemand)}% Full</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                  style={{ width: `${heroDemand}%` }}
                />
              </div>
              <p className="text-[10px] text-white/50 mt-1">
                Join now to lock in the lowest price!
                {heroDistance != null && (
                  <span className="ml-2 text-primary font-semibold">Closest pool: {heroDistance.toFixed(1)} km away</span>
                )}
              </p>
            </div>

            <button
              onClick={() => { if (heroListing) setSelectedItem(heroListing); }}
              className="w-fit px-8 py-3 rounded-xl kongsi-gradient text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-glow"
            >
              Join Pool — RM {heroCommunityPrice}/kg
            </button>
          </div>
        </div>

        {/* RIGHT 40% — Interactive Map + Top 3 */}
        <div className="lg:w-[40%] rounded-[20px] overflow-hidden border border-border bg-card flex flex-col min-h-[320px]">
          {!loading && listings.length > 0 ? (
            <SplitHeroMap
              listings={listings}
              userLat={userLocation.lat}
              userLng={userLocation.lng}
              onSelectItem={setSelectedItem}
              searchQuery={searchQuery}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          )}
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

      {/* Sorting indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
          <MapPin className="h-3 w-3" />
          Sorted by: Closest to You
          {userLocation.isDefault && <span className="text-muted-foreground ml-1">(default location)</span>}
        </div>
        {searchQuery.trim() && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-xs font-medium text-accent">
            Searching: "{searchQuery}"
          </div>
        )}
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
          <p className="text-muted-foreground text-lg">No produce available{searchQuery ? ` for "${searchQuery}"` : " in this category"}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredListings.map((item) => {
            const imageUrl = produceImages[item.category] || "";
            const categoryData = shopItemCategories.find((c) => c.name === item.category);
            const icon = categoryData ? categoryData.image : "?";
            const displayName = getDisplayName(item, isBackendData);
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
                <div className="bg-muted/30 flex items-center justify-center h-36 group-hover:bg-primary/5 transition-colors overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={displayName}
                      loading="lazy"
                      width={512}
                      height={512}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-6xl">{icon}</span>
                  )}
                </div>

                <div className="p-4 flex flex-col gap-2 flex-1">
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    <Leaf className="h-3 w-3" />
                    Direct from Supplier
                  </span>
                  {(item as any)._distance != null && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <MapPin className="h-2.5 w-2.5" />
                      {((item as any)._distance as number).toFixed(1)} km
                    </span>
                  )}
                  <h3 className="text-sm font-bold text-card-foreground leading-snug line-clamp-2">
                    {displayName}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {item.companyName || "Independent Seller"}
                  </span>

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
