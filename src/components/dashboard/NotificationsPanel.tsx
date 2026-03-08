import { memo } from "react";
import { Bell, BellRing, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread?: boolean;
};

type NotificationsPanelProps = {
  items: NotificationItem[];
  browserEnabled: boolean;
  onBrowserToggle: (enabled: boolean) => void;
  onMarkAllRead: () => void;
};

const NotificationsPanel = ({
  items,
  browserEnabled,
  onBrowserToggle,
  onMarkAllRead,
}: NotificationsPanelProps) => {
  return (
    <div className="absolute right-0 top-11 z-30 w-[min(340px,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl">
      <div className="border-b border-border bg-muted/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="font-display-landing text-base font-semibold text-foreground">Notifications</p>
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onMarkAllRead}>
            Mark all read
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2">
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Laptop className="h-3.5 w-3.5" />
            Browser notifications
          </span>
          <Switch checked={browserEnabled} onCheckedChange={onBrowserToggle} />
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="border-b border-border px-4 py-3 last:border-0 hover:bg-muted/50"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                {item.unread ? <BellRing className="h-3.5 w-3.5 text-amber-500" /> : <Bell className="h-3.5 w-3.5 text-muted-foreground" />}
                {item.title}
              </p>
              <span className="text-[11px] text-muted-foreground">{item.time}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
          </div>
        ))}
        {items.length === 0 && <div className="px-4 py-8 text-center text-xs text-muted-foreground">No notifications yet.</div>}
      </div>
    </div>
  );
};

export default memo(NotificationsPanel);
