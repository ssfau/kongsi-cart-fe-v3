export interface Order {
  id: string;
  itemName: string;
  image: string;
  status: string;
  quantity: number;
  totalPrice: string;
  amountLeft: string;
  state: string;
  district: string;
  collectionPoint: string;
  phoneNumber: string;
  paymentMethod: string;
}

export const sampleOrders: Order[] = [
  {
    id: "1",
    itemName: "Spinach",
    image: "🥬",
    status: "Will be shipped in 3 days...",
    quantity: 3,
    totalPrice: "-",
    amountLeft: "Not yet determined",
    state: "Selangor",
    district: "Serdang",
    collectionPoint: "UPM",
    phoneNumber: "012-345 6789",
    paymentMethod: "-",
  },
  {
    id: "2",
    itemName: "Tomato",
    image: "🍅",
    status: "Will arrive in 2 days",
    quantity: 5,
    totalPrice: "RM 25.00",
    amountLeft: "RM 5.00",
    state: "Selangor",
    district: "Petaling Jaya",
    collectionPoint: "SS2 Market",
    phoneNumber: "013-456 7890",
    paymentMethod: "Touch 'n Go",
  },
];
