import { useState, useEffect } from "react";
import { shopItemCategories } from "@/data/shopItems";
import ItemDetail from "./ItemDetail";
import api from "@/lib/axios";

// Define what a listing from the backend looks like
export interface ListingItem {
  _id: string;
  category: string;
  itemName: string;
  companyName?: string;
  depositPerUnit: number;
  estimatedPriceMax: number;
}

const ShopPage = () => {
  const [selectedItem, setSelectedItem] = useState<ListingItem | null>(null);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get("/listings");
        setListings(response.data.data);
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

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-foreground mb-6">Shop</h2>
      {loading ? (
        <p className="text-muted-foreground">Loading items...</p>
      ) : listings.length === 0 ? (
        <p className="text-muted-foreground">No active listings available right now.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((item) => {
            // Find the category icon
            const categoryData = shopItemCategories.find((c) => c.name === item.category);
            const icon = categoryData ? categoryData.image : "📦";

            return (
              <button
                key={item._id}
                onClick={() => setSelectedItem(item)}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex w-full justify-end">
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                    RM {item.depositPerUnit.toFixed(2)}/kg dep.
                  </span>
                </div>
                <span className="text-5xl">{icon}</span>
                <span className="text-sm font-bold text-card-foreground text-center line-clamp-2">
                  {item.itemName}
                </span>
                <span className="text-xs text-muted-foreground">
                  By {item.companyName || "Independent Seller"}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShopPage;
