import { Bell, X } from "lucide-react";

export interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationPanelProps {
  notifications: Notification[];
  open: boolean;
  onClose: () => void;
  onClear: () => void;
}

const NotificationPanel = ({ notifications, open, onClose, onClear }: NotificationPanelProps) => {
  if (!open) return null;

  return (
    <div className="fixed bottom-20 left-16 w-80 bg-card border border-border rounded-2xl shadow-2xl z-[9999] overflow-hidden animate-in slide-in-from-left-4 duration-300">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Bell className="h-4 w-4 text-accent" />
          Notifications
        </h3>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button onClick={onClear} className="text-[10px] text-muted-foreground hover:text-foreground">
              Clear all
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3 border-b border-border/50 text-sm ${
                n.read ? "text-muted-foreground" : "text-foreground bg-primary/5"
              }`}
            >
              <p className="leading-relaxed">{n.message}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {n.timestamp.toLocaleTimeString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
