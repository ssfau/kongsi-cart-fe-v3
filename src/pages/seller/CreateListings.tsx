import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "../../lib/axios";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { shopItemCategories } from "@/data/shopItems";

interface FormValues {
  category: string;
  itemName: string;
  companyName: string;
  unit: string;
  estimatedQty: number;
  depositPerUnit: number;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  deadline: string;
  collectionPoints: string[];
}

const COLLECTION_POINTS = [
  "KL Sentral Hub",
  "Petaling Jaya Centre",
  "Shah Alam Depot",
  "Subang Jaya Point",
  "Cyberjaya Hub",
];

const CreateListing = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: { unit: "kg", collectionPoints: [] },
  });
  
  // Actually register the category field manually since it's used in Select
  useEffect(() => {
    register("category", { required: "Category is required" });
  }, [register]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const selectedPoints = watch("collectionPoints") || [];

  const togglePoint = (point: string) => {
    const updated = selectedPoints.includes(point)
      ? selectedPoints.filter((p) => p !== point)
      : [...selectedPoints, point];
    setValue("collectionPoints", updated, { shouldValidate: true });
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await api.post("/listings", data);
      toast({ title: "Listing created!", description: `${data.itemName} has been listed.` });
      navigate("/handler/listings");
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      const errMsg = err.response?.data?.error || "API unavailable";
      toast({ title: "Error creating listing", description: errMsg, variant: "destructive" });
    }
  };

  const now = new Date();
  const minDeadline = now.toISOString().slice(0, 16);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6 space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/handler/listings")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground m-0">Create New Listing</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Listing Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Category */}
            <div className="space-y-1.5">
              <Label>Category / Base Item</Label>
              <Select onValueChange={(v) => setValue("category", v, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {shopItemCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.image} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
            </div>

            {/* Item Name / Variant */}
            <div className="space-y-1.5">
              <Label htmlFor="itemName">Item Details / Variant</Label>
              <Input
                id="itemName"
                placeholder="e.g. Premium Musang King"
                {...register("itemName", { required: "Item description is required" })}
              />
              {errors.itemName && <p className="text-sm text-destructive">{errors.itemName.message}</p>}
            </div>

            {/* Company Name */}
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Seller / Company Name</Label>
              <Input
                id="companyName"
                placeholder="e.g. Ali Farm / AgroBhd"
                {...register("companyName", { required: "Company name is required" })}
              />
              {errors.companyName && <p className="text-sm text-destructive">{errors.companyName.message}</p>}
            </div>

            {/* Unit + Qty row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Unit</Label>
                <Select defaultValue="kg" onValueChange={(v) => setValue("unit", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="unit">unit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="estimatedQty">Estimated Qty</Label>
                <Input
                  id="estimatedQty"
                  type="number"
                  min={1}
                  {...register("estimatedQty", {
                    required: "Required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Must be at least 1" },
                  })}
                />
                {errors.estimatedQty && <p className="text-sm text-destructive">{errors.estimatedQty.message}</p>}
              </div>
            </div>

            {/* Deposit */}
            <div className="space-y-1.5">
              <Label htmlFor="depositPerUnit">Deposit per Unit (RM)</Label>
              <Input
                id="depositPerUnit"
                type="number"
                step="0.01"
                min={0}
                {...register("depositPerUnit", {
                  required: "Required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Cannot be negative" },
                })}
              />
              {errors.depositPerUnit && <p className="text-sm text-destructive">{errors.depositPerUnit.message}</p>}
            </div>

            {/* Price range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="estimatedPriceMin">Est. Price Min (RM)</Label>
                <Input
                  id="estimatedPriceMin"
                  type="number"
                  step="0.01"
                  min={0}
                  {...register("estimatedPriceMin", {
                    required: "Required",
                    valueAsNumber: true,
                    min: { value: 0, message: "Cannot be negative" },
                  })}
                />
                {errors.estimatedPriceMin && <p className="text-sm text-destructive">{errors.estimatedPriceMin.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="estimatedPriceMax">Est. Price Max (RM)</Label>
                <Input
                  id="estimatedPriceMax"
                  type="number"
                  step="0.01"
                  min={0}
                  {...register("estimatedPriceMax", {
                    required: "Required",
                    valueAsNumber: true,
                    min: { value: 0, message: "Cannot be negative" },
                  })}
                />
                {errors.estimatedPriceMax && <p className="text-sm text-destructive">{errors.estimatedPriceMax.message}</p>}
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-1.5">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="datetime-local"
                min={minDeadline}
                {...register("deadline", {
                  required: "Deadline is required",
                  validate: (v) => new Date(v) > new Date() || "Deadline must be in the future",
                })}
              />
              {errors.deadline && <p className="text-sm text-destructive">{errors.deadline.message}</p>}
            </div>

            {/* Collection Points */}
            <div className="space-y-2">
              <Label>Collection Points</Label>
              <div className="space-y-2">
                {COLLECTION_POINTS.map((point) => (
                  <label
                    key={point}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedPoints.includes(point)}
                      onCheckedChange={() => togglePoint(point)}
                    />
                    <span className="text-sm">{point}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Listing
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateListing;
