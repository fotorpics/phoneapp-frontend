import { useMemo, useState, useCallback, memo } from "react";
import { Plus, Tag, MoreVertical, Upload, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PageShell, SearchField, TableShell } from "@/components/dashboard/DashboardPageKit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL, getStoredAuthToken } from "@/lib/billingApi";

const ContactsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importPayload, setImportPayload] = useState("");
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    tags: "",
  });

  const { data: contacts = [], isLoading, refetch } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/contacts`, {
        headers: { 'Authorization': `Bearer ${getStoredAuthToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch contacts');
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (contact: { name: string; email: string; phone: string; tags: string[] }) => {
      const res = await fetch(`${API_BASE_URL}/api/contacts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredAuthToken()}`
        },
        body: JSON.stringify(contact)
      });
      if (!res.ok) throw new Error('Failed to create contact');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setAddOpen(false);
      toast({ title: "Contact added", description: "The new contact has been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add contact. It might already exist.", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/api/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getStoredAuthToken()}` }
      });
      if (!res.ok) throw new Error('Failed to delete contact');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({ title: "Contact removed", description: "The contact has been deleted." });
    }
  });

  const debouncedSearch = useDebouncedValue(search, 300);
  const filteredContacts = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c: { name: string; email?: string; phone: string; tags?: string[] }) =>
      `${c.name} ${c.email || ''} ${c.phone} ${c.tags?.join(" ") || ''}`.toLowerCase().includes(q)
    );
  }, [contacts, debouncedSearch]);

  const handleAddContact = useCallback(() => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      toast({ title: "Missing fields", description: "Name and phone are required." });
      return;
    }
    createMutation.mutate({
      ...newContact,
      tags: newContact.tags.split(",").map(t => t.trim()).filter(Boolean)
    });
  }, [newContact, createMutation, toast]);

  return (
    <>
    <PageShell
      title="Contacts"
      description="View customers and leads connected to your business lines."
      actions={
        <>
          <SearchField
            placeholder="Search contacts..."
            className="w-full min-w-[220px] md:w-72"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="outline" size="sm" className="gap-2 border-border bg-card" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} /> Refresh
          </Button>
          <Button
            size="sm"
            className="gap-2 rounded-full bg-primary text-primary-foreground hover:bg-[#1e293b]"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" /> Add Contact
          </Button>
        </>
      }
    >
      <TableShell className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tags</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map((c: { id: string; name: string; email?: string; phone: string; tags?: string[] }, i: number) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/70 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-foreground">
                      {c.name.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <span className="text-sm font-medium">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{c.email || 'N/A'}</td>
                <td className="px-4 py-3 font-mono-dialer text-sm text-muted-foreground">{c.phone}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {c.tags?.map((tag: string) => (
                      <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        <Tag className="w-2.5 h-2.5" />{tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => deleteMutation.mutate(c.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {filteredContacts.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No contacts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableShell>
    </PageShell>

    <Dialog open={addOpen} onOpenChange={setAddOpen}>
      <DialogContent className="border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-display-landing">Add Contact</DialogTitle>
          <DialogDescription>
            Create a new contact.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <input
            placeholder="Full name"
            value={newContact.name}
            onChange={(e) => setNewContact((prev) => ({ ...prev, name: e.target.value }))}
            className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            placeholder="Email"
            value={newContact.email}
            onChange={(e) => setNewContact((prev) => ({ ...prev, email: e.target.value }))}
            className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            placeholder="Phone number"
            value={newContact.phone}
            onChange={(e) => setNewContact((prev) => ({ ...prev, phone: e.target.value }))}
            className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            placeholder="Tags (comma separated)"
            value={newContact.tags}
            onChange={(e) => setNewContact((prev) => ({ ...prev, tags: e.target.value }))}
            className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" className="border-border bg-card" onClick={() => setAddOpen(false)}>
            Cancel
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-[#1e293b]" onClick={handleAddContact} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving..." : "Save Contact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default memo(ContactsPage);
