import { useEffect, useState, useCallback, memo } from "react";
import { BadgeCheck, Bell, LockKeyhole, Mail, ShieldCheck, UserCircle2, LogOut, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PageShell, SectionCard } from "@/components/dashboard/DashboardPageKit";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL, getStoredAuthToken } from "@/lib/billingApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const SettingsPage = () => {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    timezone: "America/New_York (EST)",
    language: "English",
  });

  const [notifications, setNotifications] = useState({
    missedCallAlerts: true,
    smsNotifications: true,
    billingAlerts: true,
    weeklyReports: true,
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch current user data from backend
  const { data: userData, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${getStoredAuthToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch user data');
      return res.json();
    }
  });

  // Update local state when user data is fetched
  useEffect(() => {
    if (userData) {
      setProfile({
        fullName: userData.fullName || userData.email.split('@')[0],
        email: userData.email,
        timezone: userData.timezone || "America/New_York (EST)",
        language: userData.language || "English",
      });
      setNotifications({
        missedCallAlerts: userData.missedCallAlerts ?? true,
        smsNotifications: userData.smsNotifications ?? true,
        billingAlerts: userData.billingAlerts ?? true,
        weeklyReports: userData.weeklyReports ?? true,
      });
      setTwoFactorEnabled(userData.twoFactorEnabled ?? false);
    }
  }, [userData]);

  const updateMutation = useMutation({
    mutationFn: async (updatedData: Record<string, unknown>) => {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredAuthToken()}`
        },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error('Failed to update settings');
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['me'], updatedUser);
      // Also update local storage user if needed (though it might be stale)
      localStorage.setItem('callflow:user', JSON.stringify(updatedUser));
      toast({
        title: "Settings saved",
        description: "Profile, security, and notification preferences have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredAuthToken()}`
        },
        body: JSON.stringify(data)
      });
      if (res.status === 401) {
        const errData = await res.json();
        throw new Error(errData.error || 'Current password is incorrect');
      }
      if (res.status === 429) {
        throw new Error('Too many attempts. Please wait before trying again.');
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to change password');
      }
      return res.json();
    },
    onSuccess: () => {
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password change failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const enable2FAMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/auth/2fa/enable`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getStoredAuthToken()}` }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to initiate 2FA setup');
      }
      return res.json();
    },
    onSuccess: (data) => {
      setQrCodeUrl(data.qrCode);
      setShow2FADialog(true);
      setTwoFACode("");
      toast({ title: "Scan QR Code", description: "Scan the QR code with your authenticator app, then enter the 6-digit code." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const confirm2FAMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch(`${API_BASE_URL}/api/auth/2fa/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredAuthToken()}`
        },
        body: JSON.stringify({ code })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Invalid or expired code');
      }
      return res.json();
    },
    onSuccess: () => {
      setTwoFactorEnabled(true);
      setShow2FADialog(false);
      setTwoFACode("");
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast({ title: "2FA enabled", description: "Two-factor authentication is now active on your account." });
    },
    onError: (error: Error) => {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    }
  });

  const disable2FAMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/auth/2fa/disable`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getStoredAuthToken()}` }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to disable 2FA');
      }
      return res.json();
    },
    onSuccess: () => {
      setTwoFactorEnabled(false);
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast({ title: "2FA disabled", description: "Two-factor authentication has been turned off." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleChangePassword = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast({ title: "Missing fields", description: "Please fill in all password fields.", variant: "destructive" });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast({ title: "Password too short", description: "New password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Passwords don't match", description: "New password and confirmation must match.", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  }, [passwordForm, changePasswordMutation, toast]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
    toast({ title: "Logged out", description: "You have been successfully logged out." });
  }, [logout, navigate, toast]);

  const saveAll = useCallback(() => {
    updateMutation.mutate({
      fullName: profile.fullName,
      timezone: profile.timezone,
      language: profile.language,
      twoFactorEnabled,
      ...notifications
    });
  }, [updateMutation, profile, twoFactorEnabled, notifications]);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <PageShell
      title="Settings"
      description="Manage account profile, security controls, and notification preferences."
      actions={
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            className="gap-2 rounded-full"
            onClick={handleLogout}
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-primary text-primary-foreground hover:bg-[#1e293b]"
            onClick={saveAll}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save All Changes"}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <SectionCard title="Account" subtitle="Update your profile and localization settings.">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Full Name</label>
                <input
                  value={profile.fullName}
                  onChange={(e) => setProfile((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-border bg-secondary px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
                <input
                  value={profile.email}
                  disabled
                  className="h-10 w-full rounded-xl border border-border bg-secondary px-3 text-sm outline-none opacity-50"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Timezone</label>
                <select
                  value={profile.timezone}
                  onChange={(e) => setProfile((prev) => ({ ...prev, timezone: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-border bg-secondary px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>America/New_York (EST)</option>
                  <option>America/Los_Angeles (PST)</option>
                  <option>Europe/London (GMT)</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Language</label>
                <select
                  value={profile.language}
                  onChange={(e) => setProfile((prev) => ({ ...prev, language: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-border bg-secondary px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
            </div>
            <Button
              size="sm"
              className="rounded-full bg-primary text-primary-foreground hover:bg-[#1e293b]"
              onClick={saveAll}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Workspace Snapshot" subtitle="Quick account status at a glance.">
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-secondary p-3">
              <p className="text-xs text-muted-foreground">User</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                <UserCircle2 className="h-4 w-4" /> {profile.fullName}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Mail className="h-4 w-4" /> {profile.email}
              </p>
            </div>
            <div className={`rounded-xl border p-3 transition-colors ${twoFactorEnabled ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800" : "border-amber-500/30 bg-amber-500/10 text-amber-800"}`}>
              <p className="text-xs">Security posture</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                <BadgeCheck className="h-4 w-4" />
                {twoFactorEnabled ? "Two-factor enabled" : "Two-factor recommended"}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Security" subtitle="Control authentication and account safety settings.">
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-border bg-secondary p-4">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" /> Google Account
              </p>
              <p className="text-xs text-muted-foreground">Connected as {profile.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-border bg-card"
              onClick={() =>
                toast({
                  title: "Google account",
                  description: "Identity provider settings opened for your workspace.",
                })
              }
            >
              Manage
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-secondary p-4">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-medium">
                <LockKeyhole className="h-4 w-4 text-muted-foreground" /> Two-Factor Authentication
              </p>
              <p className="text-xs text-muted-foreground">
                {twoFactorEnabled
                  ? "2FA is active — your account requires a code on login"
                  : "Add an extra layer of account protection via email code"}
              </p>
            </div>
            <Button
              variant={twoFactorEnabled ? "destructive" : "outline"}
              size="sm"
              className={twoFactorEnabled ? "" : "border-border bg-card"}
              onClick={() => {
                if (twoFactorEnabled) {
                  disable2FAMutation.mutate();
                } else {
                  enable2FAMutation.mutate();
                }
              }}
              disabled={enable2FAMutation.isPending || disable2FAMutation.isPending}
            >
              {enable2FAMutation.isPending || disable2FAMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Change Password" subtitle="Update your account password. Requires your current password.">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                className="h-10 w-full rounded-xl border border-border bg-secondary px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Min. 8 characters"
                className="h-10 w-full rounded-xl border border-border bg-secondary px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Repeat new password"
                className="h-10 w-full rounded-xl border border-border bg-secondary px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                autoComplete="new-password"
              />
            </div>
          </div>
          {passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
            <p className="text-xs text-destructive">Passwords do not match.</p>
          )}
          <Button
            type="submit"
            size="sm"
            className="gap-2 rounded-full bg-primary text-primary-foreground hover:bg-[#1e293b]"
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating...</>
            ) : (
              <><KeyRound className="h-3.5 w-3.5" /> Update Password</>
            )}
          </Button>
        </form>
      </SectionCard>

      <SectionCard title="Notifications" subtitle="Choose which operational alerts you receive.">
        <div className="space-y-3">
          {[
            {
              key: "missedCallAlerts" as const,
              label: "Missed call alerts",
              icon: Bell,
            },
            {
              key: "smsNotifications" as const,
              label: "SMS notifications",
              icon: Mail,
            },
            {
              key: "billingAlerts" as const,
              label: "Billing alerts",
              icon: ShieldCheck,
            },
            {
              key: "weeklyReports" as const,
              label: "Weekly reports",
              icon: BadgeCheck,
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-xl border border-border bg-secondary px-3 py-2.5">
              <span className="inline-flex items-center gap-2 text-sm">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                {item.label}
              </span>
              <Switch
                checked={notifications[item.key]}
                onCheckedChange={(checked) => {
                  const newNotifications = { ...notifications, [item.key]: checked };
                  setNotifications(newNotifications);
                  // Optionally save immediately or wait for Save All
                }}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 2FA Verification Dialog with QR Code */}
      <Dialog open={show2FADialog} onOpenChange={(open) => { if (!open) { setShow2FADialog(false); setTwoFACode(""); setQrCodeUrl(null); } }}>
        <DialogContent aria-describedby="2fa-dialog-description">
          <DialogHeader>
            <DialogTitle>Set up Google Authenticator</DialogTitle>
            <DialogDescription id="2fa-dialog-description">
              Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.), then enter the 6-digit code to enable 2FA.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {qrCodeUrl && (
              <div className="flex justify-center p-4 bg-white rounded-xl">
                <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
              </div>
            )}
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, "").substring(0, 6))}
              placeholder="Enter 6-digit code from your app"
              className="h-12 text-center text-xl font-mono tracking-[0.4em]"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setShow2FADialog(false); setTwoFACode(""); setQrCodeUrl(null); }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-[#1e293b]"
                disabled={twoFACode.length !== 6 || confirm2FAMutation.isPending}
                onClick={() => confirm2FAMutation.mutate(twoFACode)}
              >
                {confirm2FAMutation.isPending ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> Verifying...</>
                ) : "Enable 2FA"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

export default memo(SettingsPage);
