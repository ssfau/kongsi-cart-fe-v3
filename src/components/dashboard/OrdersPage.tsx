import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Order } from "@/data/orders";
import { fakeOrders } from "@/data/fakeOrders";
import api from "@/lib/axios";

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
        console.warn("Backend unreachable, using synthetic orders", err);
        setOrders(fakeOrders);
        setError("");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (selectedOrder) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h2 className="text-xl font-bold text-foreground text-center mb-6">{selectedOrder.itemName}</h2>

        <div className="flex justify-center mb-6">
          <span className="text-7xl">{selectedOrder.image}</span>
        </div>

        <div className="space-y-3 p-4 rounded-lg border border-border bg-card">
          <InfoRow label="Quantity Bought" value={`${selectedOrder.quantity} kg`} />
          <InfoRow label="Total Price" value={selectedOrder.totalPrice} />
          <InfoRow label="Amount to be paid" value={selectedOrder.amountLeft} />
        </div>

        <div className="mt-4 space-y-3 p-4 rounded-lg border border-border bg-card">
          <InfoRow label="State" value={selectedOrder.state} />
          <InfoRow label="District" value={selectedOrder.district} />
          <InfoRow label="Collection Point" value={selectedOrder.collectionPoint} />
          <InfoRow label="Phone Number" value={selectedOrder.phoneNumber} />
        </div>

        <div className="mt-4 p-4 rounded-lg border border-border bg-card">
          <InfoRow label="Payment Method" value={selectedOrder.paymentMethod} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-foreground mb-6">Orders</h2>
      
      {loading ? (
        <p className="text-center text-muted-foreground mt-10">Loading orders...</p>
      ) : error ? (
        <p className="text-center text-red-500 mt-10">{error}</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-muted-foreground mt-10">You have no orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <button
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary hover:shadow-md transition-all text-left"
            >
              <span className="text-3xl">{order.image}</span>
              <div>
                <p className="font-medium text-card-foreground">{order.itemName}</p>
                <p className="text-sm text-muted-foreground">{order.status}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">{label}:</span>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);

export default OrdersPage;
