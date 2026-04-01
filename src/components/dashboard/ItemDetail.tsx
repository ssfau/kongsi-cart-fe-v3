import { useState } from "react";
import { ArrowLeft, Plus, Minus, MapPin, Truck, Leaf, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { shopItemCategories } from "@/data/shopItems";
import { produceImages } from "@/assets/produce";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import { ListingItem } from "./ShopPage";

interface ItemDetailProps {
  item: ListingItem;
  onBack: () => void;
  onNotification?: (msg: string) => void;
}

const ItemDetail = ({ item, onBack, onNotification }: ItemDetailProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const demandPercent = item.currentDemand
    ? Math.min(100, (item.currentDemand / (item.targetDemand || 100)) * 100)
    : 0;
  const isDepositUnlocked = demandPercent >= 80;
  const demandNeeded = Math.max(0, 80 - Math.round(demandPercent));

  const currentPrice = item.estimatedPriceMax;
  const targetPrice = item.depositPerUnit;
  const activePrice = isDepositUnlocked ? targetPrice : currentPrice;
  const totalPrice = (activePrice * quantity).toFixed(2);
  const depositTotal = (targetPrice * quantity).toFixed(2);
  const communityDiscount = ((currentPrice - targetPrice) * quantity).toFixed(2);

  const categoryData = shopItemCategories.find(c => c.name === item.category);
  const displayIcon = categoryData ? categoryData.image : "📦";
  const imageUrl = produceImages[item.category] || "";

  const handleBuy = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/orders", {
        listingId: item._id,
        itemName: item.itemName,
        image: displayIcon,
        quantity,
        totalPrice: Number(totalPrice),
        depositAmount: item.depositPerUnit,
      });
      toast({
        title: "Order placed successfully!",
        description: `${quantity}kg of ${item.itemName} for RM ${totalPrice}`,
      });
      onBack();
    } catch (error: any) {
      // Mock notification on backend failure
      if (onNotification) {
        const neighbors = Math.floor(Math.random() * 5) + 1;
        onNotification(
          `Update: ${neighbors} more neighbors just joined the ${item.itemName} pool! Price dropping soon.`
        );
      }
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
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Shop
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ─── LEFT: Product Detail ─── */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-kongsi-green/15 text-kongsi-green border-kongsi-green/30 text-xs font-semibold">
                <Leaf className="h-3 w-3 mr-1" /> Direct from Supplier — No Middleman
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
              {item.itemName}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sold by: <span className="font-medium text-foreground">{item.companyName || "Independent Seller"}</span>
            </p>
          </div>

          {/* Icon display */}
          <div className="bg-muted/40 rounded-2xl p-8 flex items-center justify-center">
            <span className="text-8xl">{displayIcon}</span>
          </div>

          {/* Community Demand Bar */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-kongsi-green" />
                Community Demand
              </h3>
              <span className="text-sm font-bold text-foreground">
                {Math.round(demandPercent)}%
              </span>
            </div>

            <Progress
              value={demandPercent}
              className={`h-3 rounded-full ${isDepositUnlocked ? "[&>div]:bg-kongsi-green" : "[&>div]:bg-kongsi-orange"}`}
            />

            {!isDepositUnlocked ? (
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-kongsi-orange">{demandNeeded}% more demand</span> needed for deposit-only pricing
              </p>
            ) : (
              <p className="text-xs text-kongsi-green font-semibold">
                🎉 Deposit pricing unlocked! Community target reached.
              </p>
            )}

            {/* Dynamic Price Toggle */}
            <div className="flex items-center gap-6 pt-2 border-t border-border/50">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Current Price</p>
                <p className={`text-xl font-bold ${isDepositUnlocked ? "line-through text-muted-foreground/50" : "text-foreground"}`}>
                  RM {currentPrice.toFixed(2)}<span className="text-xs font-normal">/kg</span>
                </p>
              </div>
              <div className="flex items-center">
                <TrendingUp className={`h-5 w-5 ${isDepositUnlocked ? "text-kongsi-green" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 text-right">
                <p className="text-xs text-muted-foreground mb-1">Target Price</p>
                <p className={`text-xl font-bold ${isDepositUnlocked ? "text-kongsi-green" : "text-foreground"}`}>
                  RM {targetPrice.toFixed(2)}<span className="text-xs font-normal">/kg</span>
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Truck className="h-4 w-4 text-kongsi-orange" />
              Delivery Details
            </h3>

            <div className="space-y-3">
              {item.collectionPoint && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{item.collectionPoint}</p>
                    <p className="text-muted-foreground text-xs">
                      {[item.district, item.state].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
              )}

              {/* Map placeholder */}
              <div className="rounded-xl bg-muted/60 border border-border/50 h-40 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-kongsi-green/50" />
                  <p className="text-xs">Interactive map — pin your delivery location</p>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <label className="text-sm font-bold text-foreground">Quantity (kg)</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl border-2"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center text-lg font-bold bg-muted/50 rounded-xl border-2 h-10"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl border-2"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Live Invoice Summary (sticky) ─── */}
        <div className="lg:w-80 shrink-0">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <h3 className="text-base font-extrabold text-foreground border-b border-border pb-3">
                Live Invoice
              </h3>

              {/* Line items */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Deposit per kg</span>
                  <span className="font-medium text-foreground">RM {targetPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Max price per kg</span>
                  <span className="font-medium text-foreground">RM {currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium text-foreground">{quantity} kg</span>
                </div>

                <div className="border-t border-border/50 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal (max)</span>
                    <span className="font-medium text-foreground">
                      RM {(currentPrice * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Community Discount */}
                <div className="flex justify-between text-sm bg-kongsi-orange/10 p-3 rounded-xl -mx-1">
                  <span className="font-semibold text-kongsi-orange">Community Discount</span>
                  <span className="font-bold text-kongsi-orange">
                    −RM {communityDiscount}
                  </span>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">You pay today</span>
                  <span className="text-lg font-extrabold text-foreground">
                    RM {depositTotal}
                  </span>
                </div>
                {!isDepositUnlocked && (
                  <p className="text-[10px] text-muted-foreground">
                    * Final price may be up to RM {totalPrice} if demand target isn't met
                  </p>
                )}
              </div>

              <Button
                onClick={handleBuy}
                className="w-full h-12 text-base font-bold rounded-xl kongsi-gradient border-0 text-white animate-pulse-glow"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : `Join Pool — RM ${depositTotal}`}
              </Button>
            </div>

            {/* Info card */}
            <div className="rounded-2xl border border-kongsi-green/20 bg-kongsi-green/5 p-4">
              <p className="text-xs text-kongsi-green font-medium leading-relaxed">
                💡 Your deposit locks in the lowest price. If the community target isn't reached, you only pay the difference — never more than RM {currentPrice.toFixed(2)}/kg.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
