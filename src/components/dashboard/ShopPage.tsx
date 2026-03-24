import { useState } from "react";
import { shopItems, ShopItem } from "@/data/shopItems";
import ItemDetail from "./ItemDetail";

const ShopPage = () => {
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);

  if (selectedItem) {
    return <ItemDetail item={selectedItem} onBack={() => setSelectedItem(null)} />;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-foreground mb-6">Shop</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {shopItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-all cursor-pointer"
          >
            <span className="text-5xl">{item.image}</span>
            <span className="text-sm font-medium text-card-foreground">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShopPage;
