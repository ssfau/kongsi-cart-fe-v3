import { useEffect, useState } from "react";
import { MapPin, Users, Package, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface DemandPoint {
  locationName: string;
  totalVolume: number;
  maxCapacity: number;
  buyerCount: number;
  currentPrice: number;
  nextDropVolume: number;
  nextDropPrice: number;
  trend: number[];
  listingCount?: number;
}

// Demo data for when API is unavailable
const demoDemandPoints: DemandPoint[] = [
  {
    locationName: "KL Central Point A",
    totalVolume: 120, maxCapacity: 200, buyerCount: 42,
    currentPrice: 4.20, nextDropVolume: 150, nextDropPrice: 4.00,
    trend: [30, 55, 72, 85, 98, 110, 120],
  },
  {
    locationName: "Petaling Jaya Hub",
    totalVolume: 85, maxCapacity: 150, buyerCount: 28,
    currentPrice: 4.50, nextDropVolume: 100, nextDropPrice: 4.20,
    trend: [20, 35, 48, 60, 70, 78, 85],
  },
  {
    locationName: "Shah Alam Depot",
    totalVolume: 45, maxCapacity: 100, buyerCount: 15,
    currentPrice: 5.00, nextDropVolume: 60, nextDropPrice: 4.80,
    trend: [10, 15, 22, 28, 35, 40, 45],
  },
  {
    locationName: "Subang Jaya Point",
    totalVolume: 160, maxCapacity: 180, buyerCount: 55,
    currentPrice: 3.80, nextDropVolume: 180, nextDropPrice: 3.50,
    trend: [40, 70, 95, 120, 140, 152, 160],
  },
  {
    locationName: "Cyberjaya Hub",
    totalVolume: 30, maxCapacity: 120, buyerCount: 10,
    currentPrice: 5.50, nextDropVolume: 50, nextDropPrice: 5.20,
    trend: [5, 10, 14, 18, 23, 27, 30],
  },
];

const DemandAnalyticsPage = () => {
  const [points, setPoints] = useState<DemandPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get("/my-listings");
        const listings = data?.data || [];
        
        const demandPointsMap: Record<string, DemandPoint> = {};
        
        listings.forEach((listing: any) => {
          const locationName = listing.collectionPoint || listing.district || listing.state || "Main Hub";
          
          if (!demandPointsMap[locationName]) {
            demandPointsMap[locationName] = {
              locationName,
              totalVolume: 0,
              maxCapacity: 0,
              buyerCount: 0,
              currentPrice: Number(listing.estimatedPriceMax) || 0,
              nextDropVolume: 0,
              nextDropPrice: Number(listing.depositPerUnit) || 0,
              trend: [0, 0, 0, 0, 0, 0, 0],
              listingCount: 0
            };
          }
          
          const maxCap = Number(listing.estimatedQty) || 100;
          const currentVol = Number(listing.currentDemand) || 0;
          
          demandPointsMap[locationName].maxCapacity += maxCap;
          demandPointsMap[locationName].totalVolume += currentVol;
          demandPointsMap[locationName].nextDropVolume += maxCap * 0.8;
          demandPointsMap[locationName].buyerCount += currentVol > 0 ? Math.max(1, Math.floor(currentVol / 2)) : 0;
          demandPointsMap[locationName].listingCount = (demandPointsMap[locationName].listingCount || 0) + 1;
        });
        
        const generatedPoints = Object.values(demandPointsMap).map(point => {
          const step = point.totalVolume / 6;
          point.trend = [
            Math.floor(point.totalVolume - (step*6)),
            Math.floor(point.totalVolume - (step*5)),
            Math.floor(point.totalVolume - (step*4)),
            Math.floor(point.totalVolume - (step*3)),
            Math.floor(point.totalVolume - (step*2)),
            Math.floor(point.totalVolume - (step*1)),
            point.totalVolume
          ].map(v => Math.max(0, v));
          return point;
        });

        setPoints(generatedPoints);
      } catch (e) {
        console.error("Error fetching listings for analytics:", e);
        setPoints([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalVolume = points.reduce((s, p) => s + p.totalVolume, 0);
  const totalBuyers = points.reduce((s, p) => s + p.buyerCount, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Demand Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">Market pulse across all collection points</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{totalVolume} kg</p>
              <p className="text-xs text-muted-foreground">Total Demand</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">{totalBuyers}</p>
              <p className="text-xs text-muted-foreground">Total Buyers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <MapPin className="h-8 w-8 text-accent" />
            <div>
              <p className="text-2xl font-bold text-foreground">{points.length}</p>
              <p className="text-xs text-muted-foreground">Active Zones</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demand cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {points.map((point) => {
          const fillPct = Math.round((point.totalVolume / point.maxCapacity) * 100);
          const isNearCap = fillPct >= 85;
          const trendData = point.trend.map((v, i) => ({ day: `D${i + 1}`, volume: v }));

          return (
            <Card key={point.locationName} className={isNearCap ? "border-accent/50 shadow-md" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {point.locationName}
                  </CardTitle>
                  {isNearCap && (
                    <Badge className="bg-accent/15 text-accent border-accent/30" variant="outline">
                      Near Capacity
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Volume progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Volume</span>
                    <span className="font-medium text-foreground">
                      {point.totalVolume} / {point.maxCapacity} kg
                    </span>
                  </div>
                  <Progress value={fillPct} className="h-2.5" />
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Listings:</span>
                    <span className="font-semibold text-foreground">{point.listingCount || 1}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Buyers:</span>
                    <span className="font-semibold text-foreground">{point.buyerCount}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {point.currentPrice > point.nextDropPrice ? (
                      <TrendingDown className="h-4 w-4 text-primary" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-accent" />
                    )}
                    <span className="font-semibold text-foreground">RM {point.currentPrice.toFixed(2)}/kg</span>
                  </div>
                </div>

                {/* Price projection note */}
                <div className="bg-muted/50 rounded-md px-3 py-2 text-xs text-muted-foreground">
                  Next price drop at <span className="font-medium text-foreground">{point.nextDropVolume} kg</span>
                  {" → "}
                  <span className="font-medium text-primary">RM {point.nextDropPrice.toFixed(2)}</span>
                </div>

                {/* Mini trend chart */}
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id={`grad-${point.locationName}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(90,55%,51%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(90,55%,51%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="volume"
                        stroke="hsl(90,55%,51%)"
                        fill={`url(#grad-${point.locationName})`}
                        strokeWidth={2}
                      />
                      <XAxis dataKey="day" hide />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DemandAnalyticsPage;
