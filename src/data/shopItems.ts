export interface ShopItem {
  id: string;
  name: string;
  image: string;
  depositPrice: number;
  currentPrice: number;
}

export const shopItems: ShopItem[] = [
  { id: "1", name: "Spinach", image: "🥬", depositPrice: 5.00, currentPrice: 6.50 },
  { id: "2", name: "Tomato", image: "🍅", depositPrice: 4.00, currentPrice: 5.00 },
  { id: "3", name: "Carrot", image: "🥕", depositPrice: 3.50, currentPrice: 4.50 },
  { id: "4", name: "Broccoli", image: "🥦", depositPrice: 6.00, currentPrice: 7.00 },
  { id: "5", name: "Cucumber", image: "🥒", depositPrice: 2.50, currentPrice: 3.50 },
  { id: "6", name: "Cabbage", image: "🥗", depositPrice: 3.00, currentPrice: 4.00 },
  { id: "7", name: "Chili", image: "🌶️", depositPrice: 8.00, currentPrice: 10.00 },
  { id: "8", name: "Eggplant", image: "🍆", depositPrice: 4.50, currentPrice: 5.50 },
];
