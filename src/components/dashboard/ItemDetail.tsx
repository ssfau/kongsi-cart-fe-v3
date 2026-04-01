import { useState } from "react";
import { ArrowLeft, Plus, Minus, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { shopItemCategories } from "@/data/shopItems";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { ListingItem } from "./ShopPage";

interface ItemDetailProps {
  item: ListingItem;
  onBack: () => void;
}

const ItemDetail = ({ item, onBack }: ItemDetailProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const totalPrice = (item.estimatedPriceMax * quantity).toFixed(2);
  const priceProgress = (item.depositPerUnit / item.estimatedPriceMax) * 100;

  const categoryData = shopItemCategories.find(c => c.name === item.category);
  const displayIcon = categoryData ? categoryData.image : "📦";

  const handleBuy = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/orders", {
        listingId: item._id,
        itemName: item.itemName,
        image: displayIcon,
        quantity: quantity,
        totalPrice: Number(totalPrice),
        depositAmount: item.depositPerUnit
      });
      
      toast({
        title: "Order placed successfully!",
        description: `${quantity}kg of ${item.itemName} for RM ${totalPrice}`,
      });
      onBack(); // Return to shop or we could redirect to Orders if we imported useNavigate
    } catch (error: any) {
      toast({
        title: "Failed to place order",
        description: error.response?.data?.message || error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h2 className="text-xl font-bold text-foreground text-center mb-1">{item.itemName}</h2>
      <p className="text-sm text-muted-foreground text-center mb-6">Sold by: {item.companyName || "Independent Seller"}</p>

      {/* Location Info */}
      <div className="flex flex-col items-center gap-1 text-sm bg-muted/50 p-3 rounded-lg mb-6">
        {item.collectionPoint && (
          <p><span className="font-semibold text-foreground">Collection Point:</span> {item.collectionPoint}</p>
        )}
        {(item.district || item.state) && (
          <p className="text-muted-foreground">{[item.district, item.state].filter(Boolean).join(", ")}</p>
        )}
      </div>

      <div className="flex justify-center mb-6">
        <span className="text-7xl">{displayIcon}</span>
      </div>

      {/* Pricing */}
      <div className="space-y-2 mb-6 p-4 rounded-lg border border-border bg-card">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Deposit Price:</span>
          <span className="font-medium text-foreground">RM {item.depositPerUnit.toFixed(2)}/kg</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Est. Max Price:</span>
          <span className="font-medium text-foreground">RM {item.estimatedPriceMax.toFixed(2)}/kg</span>
        </div>
        <Progress value={priceProgress} className="h-2 mt-2" />
      </div>

      {/* Quantity */}
      <div className="flex items-center justify-between mb-6">
        <label className="text-sm font-medium text-foreground">Quantity (kg):</label>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 text-center bg-card"
          />
          <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Total & Buy */}
      <div className="border-t border-border pt-4 space-y-4">
        <div className="flex justify-between text-lg font-bold text-foreground">
          <span>Total Price:</span>
          <span>RM {totalPrice}</span>
        </div>
        <Button 
          onClick={handleBuy} 
          className="w-full h-12 text-base font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Buy"}
        </Button>
      </div>
    </div>
  );
};

export default ItemDetail;
