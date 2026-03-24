import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const paymentMethods = [
  "Cash on Delivery (COD)",
  "Touch 'n Go eWallet",
  "Maybank2u",
  "CIMB Clicks",
  "RHB Now",
  "Public Bank",
  "Hong Leong Connect",
  "AmBank",
  "Bank Islam",
  "Bank Rakyat",
  "Boost",
  "GrabPay",
  "ShopeePay",
  "DuitNow",
];

const PaymentMethodPage = () => {
  const [method, setMethod] = useState("");
  const [accountNo, setAccountNo] = useState("");

  const isCOD = method === "Cash on Delivery (COD)";

  const handleSave = () => {
    // TODO: API save payment method logic
    alert(`Payment method saved: ${method}`);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-foreground mb-6">Payment Method</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Method:</label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="bg-card"><SelectValue placeholder="Select payment method" /></SelectTrigger>
            <SelectContent>
              {paymentMethods.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {method && !isCOD && (
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Account No:</label>
            <Input
              placeholder="Enter account number"
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              className="bg-card"
            />
          </div>
        )}

        {isCOD && (
          <p className="text-sm text-muted-foreground p-4 rounded-lg border border-border bg-card">
            Payment will be collected upon delivery. Please prepare the exact amount.
          </p>
        )}

        {method && (
          <div className="p-4 rounded-lg border border-border bg-card text-sm text-muted-foreground space-y-1">
            <p>All deposit payments need to be paid online.</p>
            <p>Remaining payment can be either online or physical money.</p>
          </div>
        )}

        {method && (
          <Button onClick={handleSave} className="w-full h-12 text-base font-medium">
            Save Payment Method
          </Button>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodPage;
