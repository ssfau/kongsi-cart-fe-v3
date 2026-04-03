import { useState, useEffect } from "react";
import { ArrowLeft, Package, MapPin, CreditCard, TrendingUp, Users, Leaf } from "lucide-react";
import { Order } from "@/data/orders";
import { produceImages } from "@/assets/produce";
import { shopItemCategories } from "@/data/shopItems";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";
import CollectionPointMap from "./CollectionPointMap";

const statusColor: Record<string, string> = {
  Processing: "bg-accent/15 text-accent border-accent/30",
  Pooling: "bg-accent/15 text-accent border-accent/30",
  Confirmed: "bg-primary/15 text-primary border-primary/30",
  Delivered: "bg-muted text-muted-foreground border-border",
};

const OrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders/my-orders");
        setOrders(response.data.data);
      } catch (err: any) {
        console.error("Failed to fetch orders:", err);
        setOrders([]);
        setError("Failed to load your orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Resolve image for an order
  const getOrderImage = (order: Order) => {
    // Try to match category from item name
    const cat = shopItemCategories.find(
      (c) => order.itemName.toLowerCase().includes(c.name.toLowerCase())
    );
    if (cat && produceImages[cat.name]) return produceImages[cat.name];
    // Direct category match
    for (const [key, url] of Object.entries(produceImages)) {
      if (order.itemName.toLowerCase().includes(key.toLowerCase())) return url;
    }
    return "";
  };

  // Parse RM amount to number
  const parseRM = (val: string) => {
    const n = parseFloat(val.replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : n;
  };

  if (selectedOrder) {
    const img = getOrderImage(selectedOrder);
    const total = parseRM(selectedOrder.totalPrice);
    const left = parseRM(selectedOrder.amountLeft);
    const paid = total - left;
    const discount = total > 0 ? ((total - paid) / total * 100) : 0;

    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto animate-fade-in">
        <button
          onClick={() => setSelectedOrder(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </button>

        <div className="rounded-xl border border-[hsl(214,32%,91%)] bg-card overflow-hidden">
          {/* Product image header */}
          <div className="h-48 bg-muted/30 overflow-hidden">
            {img ? (
              <img src={img} alt={selectedOrder.itemName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedOrder.itemName}</h2>
                <p className="text-xs text-muted-foreground mt-1">Order #{selectedOrder.id}</p>
              </div>
              <Badge className={`text-xs border ${statusColor[selectedOrder.status] || "bg-muted text-muted-foreground border-border"}`}>
                {selectedOrder.status}
              </Badge>
            </div>

            {/* Pricing breakdown */}
            <div className="rounded-xl border border-border p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" /> Pricing Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Price</span>
                  <span className="font-medium text-foreground">{selectedOrder.totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Deposit Paid</span>
                  <span className="font-semibold text-primary">RM {paid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Remaining</span>
                  <span className="font-medium text-foreground">{selectedOrder.amountLeft}</span>
                </div>
                {/* Community Discount Removed */}
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-3">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium text-foreground">{selectedOrder.quantity} kg</span>
              </div>
            </div>

            {/* Delivery info */}
            <div className="rounded-xl border border-border p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" /> Collection Details
              </h3>
              <InfoRow label="Collection Point" value={selectedOrder.collectionPoint} />
              <InfoRow label="District" value={selectedOrder.district} />
              <InfoRow label="State" value={selectedOrder.state} />
              <InfoRow label="Contact" value={selectedOrder.phoneNumber} />
              <InfoRow label="Payment Method" value={selectedOrder.paymentMethod} />
              
              <div className="pt-2">
                <CollectionPointMap 
                  district={selectedOrder.district}
                  state={selectedOrder.state}
                  collectionPoint={selectedOrder.collectionPoint}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Package className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">My Orders</h2>
        <Badge variant="outline" className="ml-auto text-xs border-primary/30 text-primary">
          {orders.length} order{orders.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <p className="text-center text-destructive mt-10">{error}</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-lg">No orders yet</p>
          <p className="text-sm text-muted-foreground mt-1">Join a Kongsi Pool to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const img = getOrderImage(order);
            const total = parseRM(order.totalPrice);
            const left = parseRM(order.amountLeft);
            const paid = total - left;

            return (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-[hsl(214,32%,91%)] bg-card hover:border-primary/40 hover:shadow-md transition-all text-left group"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-border/50 bg-muted/30">
                  {img ? (
                    <img src={img} alt={order.itemName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground truncate">{order.itemName}</p>
                    <Badge className={`text-[10px] border shrink-0 ${statusColor[order.status] || "bg-muted text-muted-foreground border-border"}`}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5" />
                    {order.collectionPoint} — {order.district}
                  </p>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="text-xs text-muted-foreground">{order.quantity} kg</span>
                    <span className="text-xs font-semibold text-foreground">{order.totalPrice}</span>
                    {paid > 0 && (
                      <span className="text-[10px] text-primary font-medium flex items-center gap-0.5">
                        <Leaf className="h-2.5 w-2.5" /> Deposit: RM {paid.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);

export default OrdersPage;
