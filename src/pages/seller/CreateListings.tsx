import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { PlusCircle, ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { shopItemCategories } from "@/data/shopItems";
import { stateList, malaysiaStates } from "@/data/malaysiaLocations";

interface FormValues {
  category: string;
  itemName: string;
  state: string;
  district: string;
  unit: string;
  estimatedQty: number;
  depositPerUnit: number;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  deadline: string;
  collectionPoints: string[];
}

const CreateListing = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors }, clearErrors } = useForm<FormValues>({
    defaultValues: { unit: "kg", collectionPoints: [] },
  });
  
  const [stateOpen, setStateOpen] = React.useState(false);
  const [districtOpen, setDistrictOpen] = React.useState(false);

  const selectedState = watch("state");
  const selectedDistrict = watch("district");
  const districts = selectedState ? malaysiaStates[selectedState] || [] : [];
  const currentCollectionPoints = selectedDistrict 
    ? [`${selectedDistrict} Point A`, `${selectedDistrict} Point B`, `${selectedDistrict} Point C`] 
    : [];

  // Actually register the category field manually since it's used in Select
  useEffect(() => {
    register("category", { required: "Category is required" });
    register("state", { required: "State is required" });
    register("district", { required: "District is required" });
    register("unit");
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
      data.estimatedPriceMin = data.depositPerUnit;
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

            {/* Price Max */}
            <div className="space-y-1.5">
              <Label htmlFor="estimatedPriceMax">Est. Highest Price (RM)</Label>
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

            {/* Location (State & District) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 flex flex-col">
                <Label>State</Label>
                <Popover open={stateOpen} onOpenChange={setStateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between font-normal bg-card w-full",
                        !selectedState && "text-muted-foreground"
                      )}
                    >
                      {selectedState || "Select state"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[250px] p-0">
                    <Command>
                      <CommandInput placeholder="Search state..." />
                      <CommandList>
                        <CommandEmpty>No state found.</CommandEmpty>
                        <CommandGroup>
                          {stateList.map((s) => (
                            <CommandItem
                              key={s}
                              value={s}
                              onSelect={() => {
                                setValue("state", s, { shouldValidate: true });
                                setValue("district", ""); // Reset district when state changes
                                setValue("collectionPoints", []); // Reset collection points
                                clearErrors("district");
                                setStateOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  s === selectedState ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {s}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
              </div>

              <div className="space-y-1.5 flex flex-col">
                <Label>District</Label>
                <Popover open={districtOpen} onOpenChange={setDistrictOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      disabled={!selectedState}
                      className={cn(
                        "justify-between font-normal bg-card w-full",
                        !selectedDistrict && "text-muted-foreground"
                      )}
                    >
                      {selectedDistrict || "Select district"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[250px] p-0">
                    <Command>
                      <CommandInput placeholder="Search district..." />
                      <CommandList>
                        <CommandEmpty>No district found.</CommandEmpty>
                        <CommandGroup>
                          {districts.map((d) => (
                            <CommandItem
                              key={d}
                              value={d}
                              onSelect={() => {
                                setValue("district", d, { shouldValidate: true });
                                setValue("collectionPoints", []); // Reset collection points on district change
                                setDistrictOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  d === selectedDistrict ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {d}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.district && <p className="text-sm text-destructive">{errors.district.message}</p>}
              </div>
            </div>

            {/* Collection Points */}
            <div className="space-y-2">
              <Label>Collection Points</Label>
              {currentCollectionPoints.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2 border border-border rounded-lg bg-accent/30 text-center">
                  Please select a district first.
                </p>
              ) : (
                <div className="space-y-2">
                  {currentCollectionPoints.map((point) => (
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
              )}
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
