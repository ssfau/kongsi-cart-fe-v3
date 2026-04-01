import { ListingItem } from "@/components/dashboard/ShopPage";
import { shopItemCategories } from "@/data/shopItems";

export const fakeListings: ListingItem[] = shopItemCategories.map((cat, i) => ({
  _id: `fake-${cat.id}`,
  category: cat.name,
  itemName: cat.displayName,
  companyName: ["Pak Ali Farm", "Cameron Agro", "Fresh Valley Sdn Bhd", "Sungai Buloh Organics", "KL Fresh Market"][i % 5],
  depositPerUnit: parseFloat((Math.random() * 8 + 2).toFixed(2)),
  estimatedPriceMax: parseFloat((Math.random() * 12 + 6).toFixed(2)),
  state: ["Selangor", "Pahang", "Perak", "Johor", "Penang"][i % 5],
  district: ["Petaling", "Cameron Highlands", "Ipoh", "Kluang", "Balik Pulau"][i % 5],
  collectionPoint: ["Taman Jaya Hub", "Cameron Main Hub", "Ipoh Central", "Kluang Station", "Balik Pulau Market"][i % 5],
  currentDemand: Math.floor(Math.random() * 95) + 5,
  targetDemand: 100,
}));
