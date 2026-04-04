import { useEffect, useState } from "react";
import { Truck, AlertTriangle, CheckCircle2, XCircle, Package, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

type ShipmentStatus = "ready" | "warning" | "low_yield";

interface ShipmentListing {
  id: string;
  itemName: string;
  unit: string;
  supply: number;
  demand: number;
  deadline: string;
  status: ShipmentStatus;
  collectionPoints: {
    name: string;
    qty: number;
    buyers: number;
  }[];
}

const demoShipments: ShipmentListing[] = [
  {
    id: "1",
    itemName: "Premium Durian (Musang King)",
    unit: "kg",
    supply: 120,
    demand: 100,
    deadline: new Date(Date.now() + 3600000 * 6).toISOString(),
    status: "ready",
    collectionPoints: [
      { name: "KL Sentral Hub", qty: 45, buyers: 12 },
      { name: "Petaling Jaya Centre", qty: 30, buyers: 8 },
      { name: "Shah Alam Depot", qty: 25, buyers: 6 },
    ],
  },
  {
    id: "2",
    itemName: "Organic Free-Range Eggs",
    unit: "unit",
    supply: 80,
    demand: 120,
    deadline: new Date(Date.now() + 3600000 * 2).toISOString(),
    status: "warning",
    collectionPoints: [
      { name: "KL Sentral Hub", qty: 60, buyers: 15 },
      { name: "Subang Jaya Point", qty: 40, buyers: 10 },
      { name: "Cyberjaya Hub", qty: 20, buyers: 5 },
    ],
  },
  {
    id: "3",
    itemName: "Cameron Highland Strawberry",
    unit: "kg",
    supply: 50,
    demand: 10,
    deadline: new Date(Date.now() + 3600000 * 12).toISOString(),
    status: "low_yield",
    collectionPoints: [
      { name: "KL Sentral Hub", qty: 6, buyers: 3 },
      { name: "Petaling Jaya Centre", qty: 4, buyers: 2 },
    ],
  },
];

const statusConfig: Record<ShipmentStatus, { icon: React.ElementType; label: string; description: string; className: string; bannerClass: string }> = {
  ready: {
    icon: CheckCircle2,
    label: "READY",
    description: "Demand met, profit maximized. Ready to dispatch.",
    className: "bg-primary/15 text-primary border-primary/30",
    bannerClass: "bg-primary/10 border-primary/30",
  },
  warning: {
    icon: AlertTriangle,
    label: "WARNING",
    description: "Supply < Demand. Consider increasing supply or partial-fill.",
    className: "bg-accent/15 text-accent border-accent/30",
    bannerClass: "bg-accent/10 border-accent/30",
  },
  low_yield: {
    icon: XCircle,
    label: "LOW YIELD",
    description: "Demand too low. Consider cancellation to save on logistics.",
    className: "bg-destructive/15 text-destructive border-destructive/30",
    bannerClass: "bg-destructive/10 border-destructive/30",
  },
};

const DispatchPage = () => {
  const [shipments, setShipments] = useState<ShipmentListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, Record<string, string>>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const { data } = await api.get("/dispatch");
        if (data && Array.isArray(data.data)) {
          setShipments(data.data);
        } else {
          setShipments([]);
        }
      } catch (error) {
        console.error("Error fetching shipments:", error);
        setShipments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, []);

  const handleDispatch = async (shipment: ShipmentListing) => {
    const shipmentPrices = prices[shipment.id] || {};
    const allPriced = shipment.collectionPoints.every(
      (cp) => shipmentPrices[cp.name] && Number(shipmentPrices[cp.name]) > 0
    );
    if (!allPriced) {
      toast({ title: "Missing prices", description: "Set a final price for every collection point.", variant: "destructive" });
      return;
    }

    setSubmitting(shipment.id);
    try {
      await api.post(`/listings/${shipment.id}/ship`, {
        finalPrices: Object.entries(shipmentPrices).map(([point, price]) => ({
          collectionPoint: point,
          finalPricePerUnit: Number(price),
        })),
      });
      toast({ title: "Shipment confirmed!", description: `${shipment.itemName} dispatched.` });
    } catch {
      toast({ title: "Confirmed locally", description: "API unavailable — simulated dispatch." });
    }
    setShipments((prev) => prev.filter((s) => s.id !== shipment.id));
    setSubmitting(null);
  };

  const handleCancel = async (shipment: ShipmentListing) => {
    setSubmitting(shipment.id);
    try {
      await api.post(`/listings/${shipment.id}/cancel`);
      toast({ title: "Shipment cancelled", description: "Automatic refunds triggered." });
    } catch {
      toast({ title: "Cancelled locally", description: "Refunds simulated." });
    }
    setShipments((prev) => prev.filter((s) => s.id !== shipment.id));
    setSubmitting(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Urgent shipments (deadline within 24h)
  const urgent = shipments.filter((s) => {
    const hoursLeft = (new Date(s.deadline).getTime() - Date.now()) / 3600000;
    return hoursLeft < 24 && hoursLeft > 0;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dispatch Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and confirm shipments</p>
      </div>

      {/* Urgent action banner */}
      {urgent.length > 0 && (
        <div className="mb-6 p-4 rounded-lg border border-accent/40 bg-accent/10 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-accent shrink-0" />
          <div>
            <p className="font-medium text-foreground">Action Required</p>
            <p className="text-sm text-muted-foreground">
              {urgent.length} shipment{urgent.length > 1 && "s"} with deadline within 24 hours
            </p>
          </div>
        </div>
      )}

      {shipments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Truck className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">No pending shipments</h3>
          <p className="text-sm text-muted-foreground">All shipments have been confirmed or cancelled.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {shipments.map((shipment) => {
            const cfg = statusConfig[shipment.status];
            const StatusIcon = cfg.icon;
            const hoursLeft = Math.max(0, (new Date(shipment.deadline).getTime() - Date.now()) / 3600000);
            const shipmentPrices = prices[shipment.id] || {};

            return (
              <Card key={shipment.id} className={`border ${cfg.bannerClass}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-foreground">{shipment.itemName}</CardTitle>
                    <Badge variant="outline" className={cfg.className}>
                      <StatusIcon className="h-3.5 w-3.5 mr-1" />
                      {cfg.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{cfg.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Summary metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Supply:</span>
                      <span className="font-semibold text-foreground">{shipment.supply} {shipment.unit}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Demand:</span>
                      <span className="font-semibold text-foreground">{shipment.demand} {shipment.unit}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className={hoursLeft < 6 ? "font-semibold text-accent" : "text-foreground"}>
                        {hoursLeft < 1
                          ? `${Math.round(hoursLeft * 60)}m left`
                          : `${Math.floor(hoursLeft)}h left`}
                      </span>
                    </div>
                  </div>

                  {/* Per-point pricing */}
                  <div className="space-y-3 border-t border-border pt-4">
                    <p className="text-sm font-medium text-foreground">Set final prices per collection point:</p>
                    {shipment.collectionPoints.map((cp) => (
                      <div key={cp.name} className="flex items-center gap-4 bg-muted/30 rounded-md p-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            {cp.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {cp.qty} {shipment.unit} · {cp.buyers} buyers
                          </div>
                        </div>
                        <div className="w-36">
                          <Label className="text-xs text-muted-foreground">RM per {shipment.unit}</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            placeholder="0.00"
                            className="h-8 mt-0.5"
                            value={shipmentPrices[cp.name] || ""}
                            onChange={(e) =>
                              setPrices((prev) => ({
                                ...prev,
                                [shipment.id]: {
                                  ...prev[shipment.id],
                                  [cp.name]: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => handleDispatch(shipment)}
                      disabled={submitting === shipment.id}
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      {submitting === shipment.id ? "Confirming..." : "Confirm & Dispatch"}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-destructive/30 text-destructive hover:bg-destructive/10"
                      onClick={() => handleCancel(shipment)}
                      disabled={submitting === shipment.id}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Shipment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DispatchPage;
