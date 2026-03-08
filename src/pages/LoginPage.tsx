import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BrandLogo from "@/components/BrandLogo";
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from "@/hooks/useAuth";
import { API_BASE_URL, getStoredAuthToken } from "@/lib/billingApi";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [userId, setUserId] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard immediately
    if (getStoredAuthToken()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const cid = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!cid || cid.includes("your_google_client_id")) {
      toast({ title: "Configuration Error", description: "Google Client ID is missing.", variant: "destructive" });
    }
  }, [toast]);

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Auth failed');
      }

      const data = await res.json();

      if (data.twoFactorRequired) {
        setUserId(data.userId);
        setStep('2fa');
        toast({ title: "2FA Required", description: "Check your email for the verification code." });
        return;
      }

      login(data.user, data.token);
      navigate('/dashboard');
      toast({ title: "Welcome!", description: `Logged in as ${data.user.email}` });
    } catch (error) {
      const err = error as Error;
      toast({ 
        title: "Login Failed", 
        description: err.message || "Failed to verify Google account.", 
        variant: "destructive" 
      });
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode || twoFactorCode.length < 6) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: twoFactorCode }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Invalid 2FA code');
      }

      const data = await res.json();
      login(data.user, data.token);
      navigate('/dashboard');
      toast({ title: "Welcome!", description: "Successfully verified and logged in." });
    } catch (error) {
      const err = error as Error;
      toast({ 
        title: "Verification Failed", 
        description: err.message, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="app-panel p-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <BrandLogo textClassName="text-foreground text-xl" badgeClassName="h-10 w-10" />
          </Link>
          <h1 className="font-display-landing mb-2 text-2xl font-bold">
            {step === 'login' ? 'Welcome back' : 'Two-Factor Authentication'}
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            {step === 'login' 
              ? 'Sign in to your account to continue' 
              : 'Enter the 6-digit code sent to your email'}
          </p>

          <div className="flex flex-col gap-4">
            {step === 'login' ? (
              <div className="flex justify-center border rounded-xl p-2 bg-slate-50">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    toast({ title: "Google Error", description: "The Google popup failed to initialize.", variant: "destructive" });
                  }}
                  useOneTap={false}
                  shape="pill"
                  theme="outline"
                  width="350"
                />
              </div>
            ) : (
              <form onSubmit={handleVerify2FA} className="flex flex-col gap-3">
                <Input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  className="text-center text-lg tracking-widest"
                  autoFocus
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Verify & Sign In
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setStep('login')}
                  className="text-xs mt-2"
                >
                  Cancel
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
