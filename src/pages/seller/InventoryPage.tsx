import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2, Package, Calendar, PlusCircle, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

interface Listing {
  id: string;
  itemName: string;
  status: "active" | "closed" | "shipped" | "settled" | "cancelled";
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  deadline: string;
  estimatedQty: number;
  unit: string;
  currentDemand?: number;
}

type SortKey = "itemName" | "estimatedQty" | "deadline" | "status";

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-primary/15 text-primary border-primary/30" },
  closed: { label: "Closed", className: "bg-accent/15 text-accent border-accent/30" },
  shipped: { label: "Shipped", className: "bg-muted text-muted-foreground border-border" },
  settled: { label: "Settled", className: "bg-secondary text-secondary-foreground border-border" },
  cancelled: { label: "Cancelled", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

const InventoryPage = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("deadline");
  const [sortAsc, setSortAsc] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get("/my-listings");
        const apiData = response.data.data || [];
        setListings(
          apiData.map((item: any) => ({
            ...item,
            id: item._id || item.id,
            currentDemand: item.currentDemand || 0,
            targetDemand: Number(item.estimatedQty) || item.targetDemand || 100,
          }))
        );
      } catch {
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.delete(`/listings/${id}`);
      toast({ title: "Listing cancelled" });
    } catch {
      toast({ title: "Cancelled locally" });
    }
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "cancelled" as const } : l))
    );
  };

  const sorted = [...listings].sort((a, b) => {
    const dir = sortAsc ? 1 : -1;
    if (sortKey === "itemName") return a.itemName.localeCompare(b.itemName) * dir;
    if (sortKey === "estimatedQty") return (a.estimatedQty - b.estimatedQty) * dir;
    if (sortKey === "deadline") return (new Date(a.deadline).getTime() - new Date(b.deadline).getTime()) * dir;
    if (sortKey === "status") return a.status.localeCompare(b.status) * dir;
    return 0;
  });

  const getStockHealth = (listing: Listing) => {
    const demand = listing.currentDemand || 0;
    const supply = listing.estimatedQty || 1;
    const ratio = Math.min((demand / supply) * 100, 100);
    return ratio;
  };

  const getHealthColor = (pct: number) => {
    if (pct >= 80) return "bg-destructive";
    if (pct >= 50) return "bg-accent";
    return "bg-primary";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const SortHeader = ({ label, sortKeyVal }: { label: string; sortKeyVal: SortKey }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
      onClick={() => handleSort(sortKeyVal)}
    >
      {label}
      <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
    </Button>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {listings.length} listing{listings.length !== 1 && "s"} · {listings.filter(l => l.status === "active").length} active
          </p>
        </div>
        <Button onClick={() => navigate("/handler/listings/new")}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Listing
        </Button>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">No listings yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first listing to start receiving demand.</p>
          <Button onClick={() => navigate("/handler/listings/new")}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead><SortHeader label="Item" sortKeyVal="itemName" /></TableHead>
                <TableHead><SortHeader label="Status" sortKeyVal="status" /></TableHead>
                <TableHead><SortHeader label="Qty" sortKeyVal="estimatedQty" /></TableHead>
                <TableHead>Price Range</TableHead>
                <TableHead><SortHeader label="Deadline" sortKeyVal="deadline" /></TableHead>
                <TableHead>Stock Health</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((listing) => {
                const health = getStockHealth(listing);
                const cfg = statusConfig[listing.status] || statusConfig.active;
                const deadlineDate = new Date(listing.deadline);
                const now = new Date();
                const hoursLeft = Math.max(0, (deadlineDate.getTime() - now.getTime()) / 3600000);
                const isUrgent = hoursLeft < 24 && listing.status === "active";

                return (
                  <TableRow key={listing.id} className={isUrgent ? "bg-accent/5" : ""}>
                    <TableCell className="font-medium text-foreground">{listing.itemName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {listing.estimatedQty} {listing.unit}
                    </TableCell>
                    <TableCell className="text-foreground">
                      RM {listing.estimatedPriceMin} – {listing.estimatedPriceMax}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className={isUrgent ? "text-accent font-medium" : "text-foreground"}>
                          {deadlineDate.toLocaleDateString()}
                        </span>
                      </div>
                      {isUrgent && (
                        <span className="text-xs text-accent">{Math.floor(hoursLeft)}h left</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="w-24 space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{Math.round(health)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${getHealthColor(health)}`}
                            style={{ width: `${health}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/handler/listings/${listing.id}/demand`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {listing.status !== "cancelled" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleCancel(listing.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
