import { ListingItem } from "@/components/dashboard/ShopPage";
import { shopItemCategories } from "@/data/shopItems";

export const fakeListings: ListingItem[] = shopItemCategories.map((cat, i) => ({
  _id: `fake-${cat.id}`,
  category: cat.name,
  itemName: cat.displayName,
  companyName: ["Pak Ali Farm", "Cameron Agro", "Fresh Valley Sdn Bhd", "Sungai Buloh Organics", "KL Fresh Market", "Borneo Pantry Co", "Melaka Dapur Sdn Bhd"][i % 7],
  depositPerUnit: parseFloat((Math.random() * 8 + 2).toFixed(2)),
  estimatedPriceMax: parseFloat((Math.random() * 12 + 6).toFixed(2)),
  state: ["Selangor", "Pahang", "Perak", "Johor", "Penang", "Melaka", "Kedah"][i % 7],
  district: ["Petaling", "Cameron Highlands", "Ipoh", "Kluang", "Balik Pulau", "Melaka Tengah", "Sungai Petani"][i % 7],
  collectionPoint: ["Taman Jaya Hub", "Cameron Main Hub", "Ipoh Central", "Kluang Station", "Balik Pulau Market", "Melaka Sentral", "SP Central Hub"][i % 7],
  currentDemand: Math.floor(Math.random() * 95) + 5,
  targetDemand: 100,
}));
