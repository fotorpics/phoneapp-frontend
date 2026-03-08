import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Send, Paperclip, MoreVertical, Check, CheckCheck, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { socket } from "@/lib/socket";
import { PageShell, SearchField } from "@/components/dashboard/DashboardPageKit";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL, getStoredAuthToken, sendSms } from "@/lib/billingApi";

type SmsMessage = {
  id: string;
  body: string;
  fromNumber: string;
  toNumber: string;
  direction: 'INCOMING' | 'OUTGOING';
  createdAt: string;
};

type Contact = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  tags?: string[];
};

const MessagesPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: allMessages = [], isLoading, refetch } = useQuery({
    queryKey: ['sms-logs'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/sms`, {
        headers: { 'Authorization': `Bearer ${getStoredAuthToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json() as Promise<SmsMessage[]>;
    }
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/contacts`, {
        headers: { 'Authorization': `Bearer ${getStoredAuthToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch contacts');
      return res.json() as Promise<Contact[]>;
    }
  });

  const { data: myNumbers = [] } = useQuery({
    queryKey: ['my-numbers'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/numbers`, {
        headers: { 'Authorization': `Bearer ${getStoredAuthToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch numbers');
      return res.json() as Promise<{ number: string }[]>;
    }
  });

  const defaultOurNumber = myNumbers[0]?.number || "";

  const conversations = useMemo(() => {
    const groups: Record<string, { number: string; ourNumber: string; lastMsg: string; time: string; messages: SmsMessage[] }> = {};
    
    allMessages.forEach((msg) => {
      const remoteNumber = msg.direction === 'INCOMING' ? msg.fromNumber : msg.toNumber;
      const ourNumber = msg.direction === 'INCOMING' ? msg.toNumber : msg.fromNumber;
      if (!groups[remoteNumber]) {
        groups[remoteNumber] = {
          number: remoteNumber,
          ourNumber: ourNumber,
          lastMsg: msg.body,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          messages: []
        };
      }
      groups[remoteNumber].messages.push(msg);
    });

    return Object.values(groups).sort((a, b) => 
      new Date(b.messages[0].createdAt).getTime() - new Date(a.messages[0].createdAt).getTime()
    );
  }, [allMessages]);

  const filteredConversations = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const contact = contacts.find(ct => ct.phone === c.number);
      const haystack = `${c.number} ${c.lastMsg} ${contact?.name || ""} ${contact?.email || ""} ${(contact?.tags || []).join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [conversations, debouncedSearch, contacts]);

  const matchingContactsForNewThread = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return [];
    return contacts.filter((c) => {
      const haystack = `${c.name} ${c.email || ""} ${c.phone} ${(c.tags || []).join(" ")}`.toLowerCase();
      const hasConversation = conversations.some(conv => conv.number === c.phone);
      return haystack.includes(q) && !hasConversation;
    });
  }, [contacts, conversations, debouncedSearch]);

  const activeConversation = useMemo(() => {
    if (filteredConversations.length === 0 && selectedNumber) {
      return {
        number: selectedNumber,
        ourNumber: defaultOurNumber,
        lastMsg: "",
        time: "",
        messages: [],
      };
    }

    if (!selectedNumber && filteredConversations.length > 0) {
      return filteredConversations[0];
    }

    return filteredConversations.find(c => c.number === selectedNumber) || filteredConversations[0];
  }, [selectedNumber, filteredConversations, defaultOurNumber]);

  useEffect(() => {
    if (activeConversation && !selectedNumber) {
      setSelectedNumber(activeConversation.number);
    }
  }, [activeConversation, selectedNumber]);

  useEffect(() => {
    socket.on("new_sms", () => {
      refetch();
    });
    return () => {
      socket.off("new_sms");
    };
  }, [refetch]);

  const sendMutation = useMutation({
    mutationFn: (body: string) => {
      if (!activeConversation) throw new Error("No conversation selected");
      if (!activeConversation.ourNumber) throw new Error("No sending number configured");
      return sendSms({
        to: activeConversation.number,
        from: activeConversation.ourNumber,
        body
      });
    },
    onSuccess: () => {
      setNewMsg("");
      queryClient.invalidateQueries({ queryKey: ["sms-logs"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
    }
  });

  const handleSendMessage = useCallback(() => {
    if (!newMsg.trim() || !selectedNumber || !activeConversation) return;
    sendMutation.mutate(newMsg);
  }, [newMsg, selectedNumber, activeConversation, sendMutation]);

  return (
    <PageShell
      title="Messages"
      description=""
      hideHeader
      className="h-full"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/60 md:flex-row">
        <div className="flex h-60 w-full shrink-0 flex-col border-b border-border md:h-auto md:w-80 md:border-b-0 md:border-r">
          <div className="border-b border-border p-4 flex gap-2">
            <SearchField
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((c) => {
            const contact = contacts.find(ct => ct.phone === c.number);
            const displayName = contact?.name || c.number;
            const initials = contact
              ? contact.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
              : c.number.substring(0, 2);
            return (
              <button
                key={c.number}
                onClick={() => setSelectedNumber(c.number)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/70",
                  selectedNumber === c.number && "bg-muted"
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-foreground">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm truncate">{displayName}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{c.time}</span>
                  </div>
                  {contact && (
                    <p className="text-xs text-muted-foreground/60 font-mono truncate">{c.number}</p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">{c.lastMsg}</p>
                </div>
              </button>
            );
          })}
          {filteredConversations.length === 0 && !isLoading && (
            <div className="px-4 py-6 text-sm text-muted-foreground space-y-3">
              <div>No conversations found.</div>

              {matchingContactsForNewThread.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Contacts matching "{search.trim()}"
                  </div>
                  <div className="space-y-1">
                    {matchingContactsForNewThread.map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => setSelectedNumber(contact.phone)}
                        className="w-full flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-left hover:bg-muted/70 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-foreground">
                            {contact.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{contact.name}</span>
                            <span className="text-xs font-mono-dialer text-muted-foreground">{contact.phone}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchingContactsForNewThread.length === 0 && search.trim() && (
                <div className="text-xs text-muted-foreground mt-1">
                  No contacts match "{search.trim()}". Add a contact first to start a new thread.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {activeConversation ? (
          <>
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
              <div>
                {(() => {
                  const contact = contacts.find(ct => ct.phone === activeConversation.number);
                  return (
                    <>
                      <h3 className="font-semibold text-sm">{contact?.name || activeConversation.number}</h3>
                      {contact && <p className="text-xs text-muted-foreground font-mono">{activeConversation.number}</p>}
                    </>
                  );
                })()}
                <p className="text-xs text-success font-medium uppercase tracking-wider">Active Thread</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toast({ title: "Menu", description: "Additional actions can be added here." })}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4 md:p-6">
              {activeConversation.messages.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.direction === 'OUTGOING' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[70%] px-4 py-2.5 rounded-2xl text-sm",
                    msg.direction === 'OUTGOING'
                  ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-secondary text-foreground"
                  )}>
                    <p>{msg.body}</p>
                    <div className={cn("flex items-center gap-1 mt-1", msg.direction === 'OUTGOING' ? "justify-end" : "")}>
                      <span className={cn("text-[10px]", msg.direction === 'OUTGOING' ? "text-primary-foreground/60" : "text-muted-foreground")}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.direction === 'OUTGOING' && <CheckCheck className="w-3 h-3 text-primary-foreground/60" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 border-t border-border p-3 md:p-4">
              <Button variant="ghost" size="icon">
                <Paperclip className="w-4 h-4" />
              </Button>
              <input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="h-10 flex-1 rounded-lg border border-border bg-secondary px-4 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
              <Button size="icon" className="bg-primary text-primary-foreground hover:bg-[#1e293b]" disabled={!newMsg.trim() || sendMutation.isPending} onClick={handleSendMessage}>
                {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Select a conversation to start messaging.
          </div>
        )}
      </div>
    </div>
    </PageShell>
  );
};

export default memo(MessagesPage);
