export interface ShopItemCategory {
  id: string;
  name: string;
  image: string;
  group: "Leafy Greens" | "Vegetables" | "Fruits";
  displayName: string;
}

export const shopItemCategories: ShopItemCategory[] = [
  // Leafy Greens
  { id: "1", name: "Spinach", image: "🥬", group: "Leafy Greens", displayName: "Cameron Highland Spinach" },
  { id: "6", name: "Cabbage", image: "🥗", group: "Leafy Greens", displayName: "Local Round Cabbage" },
  { id: "30", name: "Kangkung", image: "🥬", group: "Leafy Greens", displayName: "Water Spinach (Kangkung)" },
  { id: "31", name: "Sawi", image: "🥬", group: "Leafy Greens", displayName: "Mustard Greens (Sawi)" },
  { id: "32", name: "Kailan", image: "🥬", group: "Leafy Greens", displayName: "Chinese Kale (Kailan)" },

  // Vegetables
  { id: "2", name: "Tomato", image: "🍅", group: "Vegetables", displayName: "Vine-Ripened Tomato" },
  { id: "3", name: "Carrot", image: "🥕", group: "Vegetables", displayName: "Cameron Highland Carrot" },
  { id: "4", name: "Broccoli", image: "🥦", group: "Vegetables", displayName: "Premium Broccoli Crown" },
  { id: "5", name: "Cucumber", image: "🥒", group: "Vegetables", displayName: "Japanese Cucumber" },
  { id: "7", name: "Chili", image: "🌶️", group: "Vegetables", displayName: "Red Cili Padi" },
  { id: "8", name: "Eggplant", image: "🍆", group: "Vegetables", displayName: "Long Purple Eggplant" },
  { id: "9", name: "Onion", image: "🧅", group: "Vegetables", displayName: "Bombay Red Onion" },
  { id: "10", name: "Potato", image: "🥔", group: "Vegetables", displayName: "Holland Potato" },
  { id: "11", name: "Garlic", image: "🧄", group: "Vegetables", displayName: "Imported White Garlic" },
  { id: "12", name: "Corn", image: "🌽", group: "Vegetables", displayName: "Sweet Corn" },

  // Fruits
  { id: "13", name: "Apple", image: "🍎", group: "Fruits", displayName: "Fuji Apple" },
  { id: "14", name: "Banana", image: "🍌", group: "Fruits", displayName: "Pisang Berangan" },
  { id: "15", name: "Orange", image: "🍊", group: "Fruits", displayName: "Mandarin Orange" },
  { id: "16", name: "Strawberry", image: "🍓", group: "Fruits", displayName: "Cameron Highland Strawberry" },
  { id: "33", name: "Durian", image: "🥭", group: "Fruits", displayName: "Musang King Durian" },
  { id: "34", name: "Papaya", image: "🥭", group: "Fruits", displayName: "Sekaki Papaya" },
  { id: "35", name: "Watermelon", image: "🍉", group: "Fruits", displayName: "Seedless Watermelon" },
  { id: "36", name: "Mango", image: "🥭", group: "Fruits", displayName: "Harumanis Mango" },
];
