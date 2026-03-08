import { useState, useCallback, useEffect, useRef, memo } from "react";
import { Phone, Delete, Globe, PhoneOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/dashboard/DashboardPageKit";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Device, Call } from "@twilio/voice-sdk";
import { API_BASE_URL, getStoredAuthToken } from "@/lib/billingApi";

const dialPad = [
  { num: "1", letters: "" },
  { num: "2", letters: "ABC" },
  { num: "3", letters: "DEF" },
  { num: "4", letters: "GHI" },
  { num: "5", letters: "JKL" },
  { num: "6", letters: "MNO" },
  { num: "7", letters: "PQRS" },
  { num: "8", letters: "TUV" },
  { num: "9", letters: "WXYZ" },
  { num: "*", letters: "" },
  { num: "0", letters: "+" },
  { num: "#", letters: "" },
];

const DialerPage = () => {
  const [number, setNumber] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const { toast } = useToast();
  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<Call | null>(null);

  const { data: recentCalls = [], isLoading, refetch } = useQuery({
    queryKey: ['recent-calls'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/voice/logs`, {
        headers: { 'Authorization': `Bearer ${getStoredAuthToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch recent calls');
      return res.json();
    }
  });

  useEffect(() => {
    const initDevice = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/voice/token`, {
          headers: { 'Authorization': `Bearer ${getStoredAuthToken()}` }
        });
        if (!res.ok) {
          const errorBody = await res.json().catch(() => ({}));
          const message =
            (errorBody && (errorBody.error || errorBody.message)) ||
            `Failed to fetch voice token (${res.status})`;
          throw new Error(message);
        }

        const data = await res.json();
        const token = data?.token;

        if (typeof token !== "string" || !token) {
          throw new Error("Invalid voice token received from server.");
        }

        const device = new Device(token, {
          logLevel: 1,
          edge: 'ashburn',
        });

        device.on('registered', () => console.log('Twilio Device Registered'));
        device.on('error', (error: { code: string; message: string; details?: unknown }) => {
          console.error('Twilio Device Error:', error);
          console.error('Twilio Error Code:', error.code);
          console.error('Twilio Error Message:', error.message);
          console.error('Twilio Error Details:', error.details);
          
          // Map common Twilio error codes for better debugging
          const errorMessages: Record<string, string> = {
            '31202': 'JWT signature validation failed - Check API credentials',
            '53000': 'Signaling connection error - Check network/firewall',
            '31008': 'Certificate error - Check SSL/TLS configuration',
            '31009': 'Media connection failed - Check STUN/TURN servers',
            '31101': 'Connection timeout - Check network connectivity',
          };
          
          const detailedMessage = errorMessages[error.code] || error.message;
          toast({ 
            title: "Call Error", 
            description: `${detailedMessage} (Code: ${error.code})`, 
            variant: "destructive" 
          });
        });

        await device.register();
        deviceRef.current = device;
      } catch (err) {
        console.error('Failed to initialize Twilio device:', err);
      }
    };

    initDevice();

    return () => {
      if (deviceRef.current) {
        deviceRef.current.destroy();
        deviceRef.current = null;
      }
    };
  }, [toast]);

  const handleDial = useCallback((digit: string) => {
    setNumber((prev) => prev + digit);
  }, []);

  const handleDelete = useCallback(() => {
    setNumber((prev) => prev.slice(0, -1));
  }, []);

  useEffect(() => {
    if (!isCalling) return;

    const timer = window.setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isCalling]);

  const startCall = useCallback(async () => {
    if (!number || !deviceRef.current) return;
    
    try {
      const call = await deviceRef.current.connect({
        params: { To: number }
      });

      call.on('accept', () => {
        setIsCalling(true);
        setCallSeconds(0);
      });

      call.on('disconnect', () => {
        setIsCalling(false);
        refetch();
      });

      callRef.current = call;
      
      toast({
        title: "Calling...",
        description: `Connecting to ${number}`,
      });
    } catch (err) {
      const error = err as Error;
      toast({ title: "Call Failed", description: error.message, variant: "destructive" });
    }
  }, [number, deviceRef, toast, refetch]);

  const endCall = useCallback(() => {
    if (callRef.current) {
      callRef.current.disconnect();
      callRef.current = null;
    }
    setIsCalling(false);
    toast({
      title: "Call ended",
      description: `Duration ${Math.floor(callSeconds / 60)
        .toString()
        .padStart(2, "0")}:${(callSeconds % 60).toString().padStart(2, "0")}`,
    });
  }, [callRef, callSeconds, toast]);

  return (
    <PageShell
      title="Dialer"
      description=""
      hideHeader
      className="h-full"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/60 md:flex-row">
        <div className="flex w-full shrink-0 flex-col items-center border-b border-border px-4 py-5 md:w-[360px] md:border-b-0 md:border-r md:px-6 md:py-6">
          <div className="mb-8 flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-border bg-card">
            <Globe className="w-3.5 h-3.5" /> US +1
          </Button>
        </div>

        <div className="mb-6 flex h-16 w-full items-center justify-center">
          <span className={cn(
            "font-mono-dialer font-semibold text-foreground transition-all text-center",
            number.length > 12 ? "text-xl" : number.length > 8 ? "text-2xl" : "text-3xl"
          )}>
            {number || <span className="text-muted-foreground text-2xl font-normal">Enter number</span>}
          </span>
        </div>

        <div className="mb-4 grid w-full max-w-[280px] grid-cols-3 gap-3 md:mb-6">
          {dialPad.map((key) => (
            <button
              key={key.num}
              onClick={() => handleDial(key.num)}
              className="flex h-16 flex-col items-center justify-center rounded-xl border border-border bg-secondary transition-colors hover:bg-secondary active:scale-95"
            >
              <span className="text-xl font-semibold text-foreground">{key.num}</span>
              {key.letters && <span className="text-[10px] text-muted-foreground tracking-widest">{key.letters}</span>}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="w-14" />
          <button
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-opacity active:scale-95",
              (!number || isCalling)
                ? "bg-success/40 cursor-not-allowed opacity-50"
                : "bg-success hover:opacity-90"
            )}
            disabled={!number || isCalling}
            onClick={startCall}
          >
            <Phone className="w-6 h-6 text-success-foreground" />
          </button>
          <button
            onClick={handleDelete}
            className="w-14 h-14 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display-landing text-lg font-semibold text-foreground">Recent Calls</h2>
          <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>
        <div className="space-y-1">
          {recentCalls.map((call: { toPhoneNumber: string; createdAt: string; durationSeconds: number; direction: string }, i: number) => (
            <div
              key={i}
              className="flex cursor-pointer items-center gap-4 rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-muted/70"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-foreground">
                {call.toPhoneNumber[0] === '+' ? call.toPhoneNumber[1] : call.toPhoneNumber[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{call.toPhoneNumber}</p>
                <p className="text-xs text-muted-foreground">{new Date(call.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">{Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s</p>
                <p className={cn("text-xs font-medium uppercase", {
                  "text-success": call.direction === "INCOMING",
                  "text-foreground": call.direction === "OUTGOING",
                })}>{call.direction}</p>
              </div>
            </div>
          ))}
          {recentCalls.length === 0 && !isLoading && (
            <div className="py-8 text-center text-sm text-muted-foreground">No recent calls.</div>
          )}
        </div>
      </div>
    </div>
    {isCalling && (
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="pointer-events-auto w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-[0_32px_56px_-34px_rgba(15,23,42,0.85)]">
          <p className="text-center text-xs uppercase tracking-[0.18em] text-muted-foreground">Active Call</p>
          <h3 className="mt-2 text-center font-display-landing text-2xl font-bold text-foreground">{number}</h3>
          <p className="mt-2 text-center font-mono-dialer text-sm text-muted-foreground">
            {Math.floor(callSeconds / 60).toString().padStart(2, "0")}:
            {(callSeconds % 60).toString().padStart(2, "0")}
          </p>
          <button
            className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-destructive text-white transition-opacity hover:opacity-90"
            onClick={endCall}
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
      </div>
    )}
    </PageShell>
  );
};

export default memo(DialerPage);
