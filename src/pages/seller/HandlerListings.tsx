import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2, Package, Calendar, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "../../lib/axios";
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
}

const statusColors: Record<string, string> = {
  active: "bg-primary text-primary-foreground",
  closed: "bg-secondary text-secondary-foreground",
  shipped: "bg-accent text-accent-foreground",
  settled: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

const HandlerListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get("/my-listings");
        const apiData = response.data.data || [];
        const mappedData = apiData.map((item: any) => ({
          ...item,
          id: item._id || item.id,
        }));
        // Filter by supplierId if we want to mimic "My Listings", or just rely on backend filter
        setListings(mappedData);
      } catch (err) {
        console.error("Failed to fetch listings", err);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await api.delete(`/listings/${id}`);
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: "cancelled" as const } : l))
      );
      toast({ title: "Listing cancelled", description: "The listing has been cancelled." });
    } catch {
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: "cancelled" as const } : l))
      );
      toast({ title: "Listing cancelled", description: "Cancelled locally (API unavailable)." });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("demoUserId");
    sessionStorage.removeItem("demoUserRole");
    localStorage.removeItem("demoUserId");
    localStorage.removeItem("demoUserRole");
    navigate("/seller/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Listings</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <Button onClick={() => navigate("/handler/listings/new")}>
            <Package className="h-4 w-4 mr-2" />
            New Listing
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <Card key={listing.id} className="border-border hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base font-semibold text-foreground leading-tight">
                  {listing.itemName}
                </CardTitle>
                <Badge className={`${statusColors[listing.status]} text-xs shrink-0 ml-2`}>
                  {listing.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  RM {listing.estimatedPriceMin} – RM {listing.estimatedPriceMax}
                </span>
                <span>per {listing.unit}</span>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Deadline: {new Date(listing.deadline).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/handler/listings/${listing.id}/demand`)}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  View Demand
                </Button>
                {listing.status !== "cancelled" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancel(listing.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HandlerListings;
