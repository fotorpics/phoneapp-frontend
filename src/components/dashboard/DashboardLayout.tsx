import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  Phone, MessageSquare, Clock, Users, Hash, CreditCard,
  BarChart3, Puzzle, Settings, ChevronLeft, Search, Bell, User, PanelLeft, LogOut, Command, Wifi, WifiOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { socket } from "@/lib/socket";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useToast } from "@/components/ui/use-toast";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";
import BrandLogo from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, getStoredAuthToken } from "@/lib/billingApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const navItems = [
  { icon: Phone, label: "Dialer", path: "/dashboard" },
  { icon: MessageSquare, label: "Messages", path: "/dashboard/messages" },
  { icon: Clock, label: "Call Logs", path: "/dashboard/calls" },
  { icon: Users, label: "Contacts", path: "/dashboard/contacts" },
  { icon: Hash, label: "Numbers", path: "/dashboard/numbers" },
  { icon: CreditCard, label: "Billing", path: "/dashboard/billing" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
  { icon: Puzzle, label: "Integrations", path: "/dashboard/integrations" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const DashboardLayout = () => {
  const { user, logout, token } = useAuth();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("callflow:sidebarCollapsed") === "true");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [topSearch, setTopSearch] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(
    () => {
      const stored = localStorage.getItem("callflow:browserNotifications");
      if (stored === "false") return false;
      return typeof window !== "undefined" && "Notification" in window && window.Notification.permission === "granted";
    },
  );

  const { data: billingSummary, refetch: refetchBilling } = useQuery({
    queryKey: ["billing-summary-header"],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await fetch(`${API_BASE_URL}/api/stripe/summary?userId=${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user?.id && !!token,
    refetchInterval: 30000,
  });

  const [notifications, setNotifications] = useState([
    { id: "n1", title: "System Ready", detail: "Welcome to ClearConnect workspace.", time: "1m", unread: false },
  ]);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const debouncedTopSearch = useDebouncedValue(topSearch, 300);
  const browserNotificationsRef = useRef(browserNotificationsEnabled);

  const { data: contactsData = [] } = useQuery({
    queryKey: ["contacts-search"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.ok ? res.json() : [];
    },
    enabled: !!token && debouncedTopSearch.trim().length > 0,
  });

  const { data: callsData = [] } = useQuery({
    queryKey: ["calls-search"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/voice/logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.ok ? res.json() : [];
    },
    enabled: !!token && debouncedTopSearch.trim().length > 0,
  });

  const quickMatches = useMemo(() => {
    const q = debouncedTopSearch.trim().toLowerCase();
    if (!q) return [];

    const matches: Array<{ label: string; path: string; icon: any; type: string; sublabel?: string }> = [];

    // 1. Pages
    navItems.forEach(item => {
      if (item.label.toLowerCase().includes(q)) {
        matches.push({ ...item, type: 'Page' });
      }
    });

    // 2. Contacts
    contactsData.slice(0, 5).forEach((c: any) => {
      if (c.name.toLowerCase().includes(q) || c.phone.includes(q)) {
        matches.push({ label: c.name, sublabel: c.phone, path: '/dashboard/contacts', icon: Users, type: 'Contact' });
      }
    });

    // 3. Calls
    callsData.slice(0, 5).forEach((call: any) => {
      if (call.toPhoneNumber.includes(q)) {
        matches.push({ label: `Call to ${call.toPhoneNumber}`, sublabel: new Date(call.createdAt).toLocaleDateString(), path: '/dashboard/calls', icon: Phone, type: 'Call Log' });
      }
    });

    return matches;
  }, [debouncedTopSearch, contactsData, callsData]);

  const compactWorkspace = useMemo(
    () => location.pathname === "/dashboard" || location.pathname.startsWith("/dashboard/messages"),
    [location.pathname],
  );

  const quickActions = useMemo(
    () => [
      { label: "Go to Dialer", action: () => navigate("/dashboard"), icon: Phone },
      { label: "Go to Messages", action: () => navigate("/dashboard/messages"), icon: MessageSquare },
      { label: "Go to Billing", action: () => navigate("/dashboard/billing"), icon: CreditCard },
      { label: "Open Notifications", action: () => setNotificationOpen(true), icon: Bell },
      { label: "Toggle Sidebar", action: () => setCollapsed((prev) => !prev), icon: PanelLeft },
    ],
    [navigate],
  );

  const unreadCount = notifications.filter((item) => item.unread).length;

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
    toast({
      title: "Logged out",
      description: "You have been signed out of this workspace.",
    });
  }, [logout, navigate, toast]);

  useEffect(() => {
    browserNotificationsRef.current = browserNotificationsEnabled;
  }, [browserNotificationsEnabled]);

  useEffect(() => {
    if (!token) return;
    socket.connect();

    const handleIncomingSms = (sms: { body?: string; from?: string }) => {
      setNotifications((prev) => [
        {
          id: `sms-${Date.now()}`,
          title: "New SMS received",
          detail: sms.body ? sms.body : `Message from ${sms.from ?? "unknown number"}`,
          time: "now",
          unread: true,
        },
        ...prev,
      ]);
      refetchBilling();

      if (browserNotificationsRef.current && "Notification" in window && Notification.permission === "granted") {
        new Notification("New SMS", {
          body: sms.body ? sms.body : `Message from ${sms.from ?? "unknown number"}`,
        });
      }
    };

    const handleIncomingCall = (call: { from?: string; contactName?: string }) => {
      setNotifications((prev) => [
        {
          id: `call-${Date.now()}`,
          title: "Incoming call event",
          detail: `From ${call.contactName ?? call.from ?? "unknown caller"}`,
          time: "now",
          unread: true,
        },
        ...prev,
      ]);
      refetchBilling();
    };
    
    socket.on("connect", () => {
      console.log("Connected to socket server");
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
      setSocketConnected(false);
    });
    socket.on("new_sms", handleIncomingSms);
    socket.on("new_call", handleIncomingCall);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("new_sms", handleIncomingSms);
      socket.off("new_call", handleIncomingCall);
      socket.disconnect();
    };
  }, [token, refetchBilling]);

  useEffect(() => {
    localStorage.setItem("callflow:sidebarCollapsed", String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    localStorage.setItem("callflow:browserNotifications", String(browserNotificationsEnabled));
  }, [browserNotificationsEnabled]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setQuickActionsOpen((prev) => !prev);
      }
      if (event.key === "Escape") {
        setQuickActionsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="app-shell flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      {mobileSidebarOpen && (
        <button
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <aside className={cn(
        "fixed inset-y-4 left-4 z-40 m-0 flex shrink-0 flex-col rounded-[2rem] border border-sidebar-border bg-sidebar shadow-2xl shadow-black/10 transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] md:relative md:inset-auto md:z-auto md:m-4 md:mr-0",
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-[120%] md:translate-x-0",
        collapsed ? "w-20" : "w-64"
      )}>
        <div className="flex h-20 items-center justify-center border-b border-sidebar-border/50 px-6">
          <BrandLogo showText={!collapsed} textClassName="text-sidebar-foreground text-lg" badgeClassName="h-10 w-10" />
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const active = location.pathname === item.path || 
              (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            return (
              <Link key={item.path} to={item.path}>
                <button className={cn(
                  "group relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300",
                  active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
                onClick={() => setMobileSidebarOpen(false)}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                    active ? "text-primary-foreground" : "text-sidebar-muted group-hover:text-primary"
                  )} />
                  {!collapsed && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                  {active && !collapsed && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary-foreground"
                    />
                  )}
                </button>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border/50 p-4 space-y-4">
          {!collapsed && (
            <div className="rounded-2xl bg-sidebar-accent/50 p-4 border border-sidebar-border/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-sm uppercase">
                  {user?.email?.[0] || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-bold text-sidebar-foreground uppercase tracking-wider leading-none">Account</p>
                  <p className="mt-1 truncate text-[11px] font-medium text-sidebar-muted">{user?.email || "User"}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 dark:bg-white/5 py-2 text-[11px] font-bold text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all border border-transparent hover:border-destructive/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full p-2.5 rounded-xl text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all group"
          >
            <ChevronLeft className={cn("w-5 h-5 transition-transform duration-500 ease-out group-hover:scale-110", collapsed && "rotate-180")} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col py-4 pr-4">
        {/* Top bar */}
        <header className="app-panel mb-4 flex h-20 shrink-0 items-center justify-between px-4 md:px-8 bg-card/80 backdrop-blur-xl border-border/50 rounded-[2rem] shadow-2xl shadow-black/5 text-foreground relative z-50">
          <div className="flex flex-1 items-center gap-2 md:gap-6 min-w-0">
            <button
              onClick={() => {
                if (window.matchMedia("(max-width: 767px)").matches) {
                  setMobileSidebarOpen((prev) => !prev);
                  return;
                }
                setCollapsed((prev) => !prev);
              }}
              className="shrink-0 p-2 md:p-2.5 hover:bg-secondary rounded-2xl transition-all text-muted-foreground hover:text-primary active:scale-90"
              aria-label="Toggle sidebar"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
            <div className="relative w-full max-w-md min-w-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search everything..."
                value={topSearch}
                onChange={(e) => setTopSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && quickMatches.length > 0) {
                    navigate(quickMatches[0].path);
                    setTopSearch("");
                  }
                }}
                className="h-11 w-full rounded-2xl border border-border/50 bg-secondary/50 pl-11 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-muted-foreground/60 truncate"
              />
              <AnimatePresence>
                {debouncedTopSearch.trim().length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-[100] overflow-hidden rounded-[1.5rem] border border-border bg-popover/95 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)]"
                  >
                    <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                      {quickMatches.length === 0 ? (
                        <div className="px-4 py-8 text-center text-xs text-muted-foreground italic">No results for "{debouncedTopSearch}"</div>
                      ) : (
                        quickMatches.map((item, idx) => (
                          <button
                            key={`${item.path}-${idx}`}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all hover:bg-primary/5 group"
                            onClick={() => {
                              navigate(item.path);
                              setTopSearch("");
                              setMobileSidebarOpen(false);
                            }}
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              <item.icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-sm truncate">{item.label}</span>
                                <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/40 group-hover:text-primary/50 transition-colors">{item.type}</span>
                              </div>
                              {item.sublabel && (
                                <p className="text-[11px] text-muted-foreground truncate font-medium">{item.sublabel}</p>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div
              className={cn(
                "hidden items-center gap-2 rounded-2xl border px-4 py-2 text-[11px] font-bold md:inline-flex uppercase tracking-wider transition-all",
                socketConnected
                  ? "border-success/20 bg-success/10 text-success shadow-sm shadow-success/5"
                  : "border-warning/20 bg-warning/10 text-warning shadow-sm shadow-warning/5",
              )}
            >
              <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", socketConnected ? "bg-success" : "bg-warning")} />
              {socketConnected ? "Online" : "Syncing"}
            </div>
            
            <button
              onClick={() => navigate("/dashboard/billing")}
              className="hidden lg:flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground shadow-sm shadow-primary/5"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>${billingSummary?.user?.creditBalance?.toFixed(2) ?? "0.00"}</span>
            </button>

            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-2xl hover:bg-secondary transition-all"
              onClick={() => setNotificationOpen((prev) => !prev)}
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground ring-2 ring-card">
                  {unreadCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-2xl bg-secondary/50 hover:bg-primary hover:text-primary-foreground transition-all text-foreground"
              onClick={() => navigate("/dashboard/settings")}
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <AnimatePresence>
          {notificationOpen && (
            <>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                aria-label="Close notifications"
                className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]"
                onClick={() => setNotificationOpen(false)}
              />
              <motion.div 
                initial={{ opacity: 0, y: 10, x: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, x: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed right-4 top-24 z-50 md:right-8 md:top-24"
              >
                <NotificationsPanel
                  items={notifications}
                  browserEnabled={browserNotificationsEnabled}
                  onBrowserToggle={async (enabled) => {
                    if (!enabled) {
                      setBrowserNotificationsEnabled(false);
                      toast({ title: "Browser notifications off", description: "You will only see in-app alerts." });
                      return;
                    }

                    if (!("Notification" in window)) {
                      toast({ title: "Unsupported", description: "This browser does not support notifications." });
                      return;
                    }

                    const permission = await window.Notification.requestPermission();
                    const granted = permission === "granted";
                    setBrowserNotificationsEnabled(granted);

                    toast({
                      title: granted ? "Browser notifications enabled" : "Permission denied",
                      description: granted ? "You will receive native alerts for new events." : "Please allow notifications in browser settings.",
                    });

                    if (granted) {
                      new Notification("CallFlow notifications enabled", {
                        body: "You will now receive call and SMS alerts.",
                      });
                    }
                  }}
                  onMarkAllRead={() => {
                    setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
                    toast({ title: "Notifications cleared", description: "All notifications have been marked as read." });
                  }}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className={cn("app-panel flex-1", compactWorkspace ? "overflow-hidden" : "overflow-y-auto")}>
          <Outlet />
        </main>
      </div>

      <Dialog open={quickActionsOpen} onOpenChange={setQuickActionsOpen}>
        <DialogContent className="border-border bg-card text-card-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display-landing">Quick Actions</DialogTitle>
            <DialogDescription>Navigate fast with keyboard shortcut Ctrl/Cmd + K.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {quickActions.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.action();
                  setQuickActionsOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-left text-sm hover:bg-secondary text-foreground"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                {item.label}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardLayout;
