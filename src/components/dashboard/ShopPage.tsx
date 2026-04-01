import { useState, useEffect } from "react";
import { shopItemCategories } from "@/data/shopItems";
import ItemDetail from "./ItemDetail";
import api from "@/lib/axios";

import { malaysiaStates, stateList } from "@/data/malaysiaLocations";

// Define what a listing from the backend looks like
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
}

const ShopPage = () => {
  const [selectedItem, setSelectedItem] = useState<ListingItem | null>(null);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get("/listings");
        
        // Keep the database location or fallback if undefined 
        const enrichedListings = response.data.data.map((item: ListingItem) => {
          return {
            ...item,
            state: item.state || "Unspecified Location",
            district: item.district || "Unspecified District",
            collectionPoint: item.collectionPoint || "Main Hub"
          };
        });

        setListings(enrichedListings);
      } catch (err) {
        console.error("Failed to fetch listings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  if (selectedItem) {
    return <ItemDetail item={selectedItem} onBack={() => setSelectedItem(null)} />;
  }

  // Group listings by state
  const groupedListings = listings.reduce((acc, item) => {
    const state = item.state || "Other Locations";
    if (!acc[state]) {
      acc[state] = [];
    }
    acc[state].push(item);
    return acc;
  }, {} as Record<string, ListingItem[]>);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-foreground mb-6">Shop</h2>
      {loading ? (
        <p className="text-muted-foreground">Loading items...</p>
      ) : listings.length === 0 ? (
        <p className="text-muted-foreground">No active listings available right now.</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedListings).map(([state, stateListings]) => (
            <div key={state}>
              <h3 className="text-lg font-semibold text-foreground mb-4 border-b pb-2">{state}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {stateListings.map((item) => {
                  // Find the category icon
                  const categoryData = shopItemCategories.find((c) => c.name === item.category);
                  const icon = categoryData ? categoryData.image : "📦";

                  return (
                    <button
                      key={item._id}
                      onClick={() => setSelectedItem(item)}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-all cursor-pointer h-full"
                    >
                      <div className="flex w-full justify-end">
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded whitespace-nowrap ml-1 shrink-0">
                          RM {item.depositPerUnit.toFixed(2)}/kg dep.
                        </span>
                      </div>
                      <span className="text-5xl mt-2 mb-1">{icon}</span>
                      <span className="text-sm font-bold text-card-foreground text-center line-clamp-2 mt-auto">
                        {item.itemName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        By {item.companyName || "Independent Seller"}
                      </span>
                      <div className="flex flex-col items-center text-center w-full mt-2 border-t border-border/50 pt-2">
                        {item.district && (
                          <span className="text-xs font-semibold text-foreground">
                            {item.district}
                          </span>
                        )}
                        {item.collectionPoint && (
                          <span className="text-[10px] text-muted-foreground truncate w-full">
                            {item.collectionPoint}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopPage;
