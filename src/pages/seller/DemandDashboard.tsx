import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Truck, MapPin, Users, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import api from "../../lib/axios";

interface CollectionPointDemand {
  collectionPoint: string;
  totalQty: number;
  buyerCount: number;
}

interface ListingDemand {
  listingId: string;
  itemName: string;
  status: string;
  unit: string;
  demandByPoint: CollectionPointDemand[];
}

const normalizeDemand = (data: unknown, fallbackId: string): ListingDemand => {
  const fallback = demoDemand[fallbackId] || demoDemand["1"];

  if (!data || typeof data !== "object") {
    return fallback;
  }

  const record = data as Partial<ListingDemand>;
  const demandByPoint = Array.isArray(record.demandByPoint) ? record.demandByPoint : fallback.demandByPoint;

  return {
    listingId: typeof record.listingId === "string" ? record.listingId : fallback.listingId,
    itemName: typeof record.itemName === "string" ? record.itemName : fallback.itemName,
    status: typeof record.status === "string" ? record.status : fallback.status,
    unit: typeof record.unit === "string" ? record.unit : fallback.unit,
    demandByPoint,
  };
};

// Demo data
const demoDemand: Record<string, ListingDemand> = {
  "1": {
    listingId: "1", itemName: "Premium Durian (Musang King)", status: "active", unit: "kg",
    demandByPoint: [
      { collectionPoint: "KL Sentral Hub", totalQty: 45, buyerCount: 12 },
      { collectionPoint: "Petaling Jaya Centre", totalQty: 30, buyerCount: 8 },
      { collectionPoint: "Shah Alam Depot", totalQty: 25, buyerCount: 6 },
    ],
  },
  "2": {
    listingId: "2", itemName: "Organic Free-Range Eggs", status: "closed", unit: "unit",
    demandByPoint: [
      { collectionPoint: "KL Sentral Hub", totalQty: 150, buyerCount: 25 },
      { collectionPoint: "Subang Jaya Point", totalQty: 120, buyerCount: 18 },
      { collectionPoint: "Cyberjaya Hub", totalQty: 80, buyerCount: 14 },
    ],
  },
  "3": {
    listingId: "3", itemName: "Fresh Atlantic Salmon", status: "shipped", unit: "kg",
    demandByPoint: [
      { collectionPoint: "KL Sentral Hub", totalQty: 40, buyerCount: 10 },
      { collectionPoint: "Petaling Jaya Centre", totalQty: 35, buyerCount: 9 },
    ],
  },
};

const DemandDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [demand, setDemand] = useState<ListingDemand | null>(null);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDemand = async () => {
      try {
        const { data } = await api.get(`/listings/${id}/demand`);
        setDemand(normalizeDemand(data, id || "1"));
      } catch {
        setDemand(demoDemand[id || "1"] || demoDemand["1"]);
      } finally {
        setLoading(false);
      }
    };
    fetchDemand();
  }, [id]);

  const handleConfirmShipment = async () => {
    const allPriced = demand?.demandByPoint.every(
      (dp) => prices[dp.collectionPoint] && Number(prices[dp.collectionPoint]) > 0
    );
    if (!allPriced) {
      toast({ title: "Missing prices", description: "Enter a final price for every collection point.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/listings/${id}/ship`, {
        finalPrices: Object.entries(prices).map(([point, price]) => ({
          collectionPoint: point,
          finalPricePerUnit: Number(price),
        })),
      });
      toast({ title: "Shipment confirmed!", description: "Status updated to shipped." });
    } catch {
      toast({ title: "Confirmed locally", description: "API unavailable — simulated shipment." });
    }
    setDemand((prev) => prev ? { ...prev, status: "shipped" } : prev);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!demand) {
    return <p className="text-muted-foreground">Listing not found.</p>;
  }

  const demandByPoint = Array.isArray(demand.demandByPoint) ? demand.demandByPoint : [];
  const totalQty = demandByPoint.reduce((s, d) => s + d.totalQty, 0);
  const totalBuyers = demandByPoint.reduce((s, d) => s + d.buyerCount, 0);

  return (
    <div className="max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate("/handler/listings")} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Back to Listings
      </Button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{demand.itemName}</h1>
        <Badge className={demand.status === "closed" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"}>
          {demand.status}
        </Badge>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{totalQty} {demand.unit}</p>
              <p className="text-sm text-muted-foreground">Total Demand</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{totalBuyers}</p>
              <p className="text-sm text-muted-foreground">Total Buyers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-point breakdown */}
      <div className="space-y-4">
        {demandByPoint.map((dp) => (
          <Card key={dp.collectionPoint}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {dp.collectionPoint}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-6 text-sm">
                <span className="text-muted-foreground">
                  Qty: <span className="font-semibold text-foreground">{dp.totalQty} {demand.unit}</span>
                </span>
                <span className="text-muted-foreground">
                  Buyers: <span className="font-semibold text-foreground">{dp.buyerCount}</span>
                </span>
              </div>

              {demand.status === "closed" && (
                <div className="pt-2 border-t border-border">
                  <Label htmlFor={`price-${dp.collectionPoint}`} className="text-sm">
                    Final Price per {demand.unit} (RM)
                  </Label>
                  <Input
                    id={`price-${dp.collectionPoint}`}
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0.00"
                    className="mt-1.5 max-w-[200px]"
                    value={prices[dp.collectionPoint] || ""}
                    onChange={(e) =>
                      setPrices((prev) => ({ ...prev, [dp.collectionPoint]: e.target.value }))
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {demand.status === "closed" && (
        <Button
          className="w-full mt-6"
          onClick={handleConfirmShipment}
          disabled={submitting}
        >
          <Truck className="h-4 w-4 mr-2" />
          {submitting ? "Confirming..." : "Confirm Shipment"}
        </Button>
      )}
    </div>
  );
};

export default DemandDashboard;
