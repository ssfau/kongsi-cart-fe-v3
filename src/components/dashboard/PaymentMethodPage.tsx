import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, ReceiptText } from "lucide-react";
import api from "@/lib/axios";

interface PaymentHistory {
  id: string;
  timestamp: string;
  total: number;
  method: string;
  status: string;
}

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
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/payments");
        if (data && Array.isArray(data.data) && data.data.length > 0) {
          // Map to match interface if backend matches
          setHistory(data.data);
        } else {
          setHistory([]);
        }
      } catch (err) {
        console.error("Error fetching payment history", err);
        setHistory([]); // fallback since backend returns 501
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const isCOD = method === "Cash on Delivery (COD)";

  const handleSave = () => {
    // TODO: API save payment method logic
    alert(`Payment method saved: ${method}`);
  };

  return (
    <div className="p-6 max-w-lg mx-auto pb-24">
      <h2 className="text-xl font-bold text-foreground mb-6">Payment Settings</h2>

      <div className="space-y-6">
        <div className="space-y-4 bg-card rounded-lg border border-border p-4 shadow-sm">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <ReceiptText className="w-4 h-4" /> Default Payment Method
          </h3>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Method</label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Select payment method" /></SelectTrigger>
              <SelectContent>
                {paymentMethods.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {method && !isCOD && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Account No</label>
              <Input
                placeholder="Enter account number"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                className="bg-background"
              />
            </div>
          )}

          {isCOD && (
            <p className="text-xs text-muted-foreground p-3 rounded bg-background border border-border">
              Payment will be collected upon delivery. Please prepare the exact amount.
            </p>
          )}

          {method && (
            <div className="p-3 rounded border border-border bg-background text-xs text-muted-foreground space-y-1">
              <p>All deposit payments need to be paid online.</p>
              <p>Remaining payment can be either online or physical money.</p>
            </div>
          )}

          {method && (
            <Button onClick={handleSave} className="w-full h-10 mt-2 text-sm font-medium">
              Save Method
            </Button>
          )}
        </div>

        <div className="space-y-4 mt-8">
          <h3 className="text-sm font-medium flex items-center gap-2 border-b border-border pb-2">
            <History className="w-4 h-4" /> Payment History
          </h3>
          
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-center text-muted-foreground py-4">Loading history...</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-4">No payment history found.</p>
            ) : (
              history.map((record) => (
                <div key={record.id} className="flex justify-between items-center p-3 rounded-lg border border-border bg-card">
                  <div>
                    <p className="text-sm font-medium text-foreground">RM {record.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{record.method}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded capitalize">
                      {record.status}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {new Date(record.timestamp).toLocaleDateString()} {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default PaymentMethodPage;
