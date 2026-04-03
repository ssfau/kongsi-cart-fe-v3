export interface ShopItemCategory {
  id: string;
  name: string;
  image: string;
  group: "Leafy Greens" | "Vegetables" | "Fruits" | "Pantry Staples";
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

  // Pantry Staples
  { id: "40", name: "Beras", image: "🍚", group: "Pantry Staples", displayName: "Beras Wangi (Fragrant Rice)" },
  { id: "41", name: "Tepung Gandum", image: "🌾", group: "Pantry Staples", displayName: "Tepung Gandum (Wheat Flour)" },
  { id: "42", name: "Kicap", image: "🫗", group: "Pantry Staples", displayName: "Kicap Manis / Masin (Soy Sauce)" },
  { id: "43", name: "Sos Cili", image: "🌶️", group: "Pantry Staples", displayName: "Sos Cili (Chili Sauce)" },
  { id: "44", name: "Sos Tomato", image: "🍅", group: "Pantry Staples", displayName: "Sos Tomato (Ketchup)" },
  { id: "45", name: "Minyak Masak", image: "🫒", group: "Pantry Staples", displayName: "Minyak Masak (Cooking Oil)" },
  { id: "46", name: "Gula", image: "🍬", group: "Pantry Staples", displayName: "Gula Pasir (White Sugar)" },
  { id: "47", name: "Garam", image: "🧂", group: "Pantry Staples", displayName: "Garam Halus (Fine Salt)" },
  { id: "48", name: "Santan", image: "🥥", group: "Pantry Staples", displayName: "Santan Kelapa (Coconut Milk)" },
  { id: "49", name: "Mee", image: "🍜", group: "Pantry Staples", displayName: "Mee / Bihun (Noodles & Vermicelli)" },
];
