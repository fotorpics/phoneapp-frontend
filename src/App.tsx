import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./components/ThemeProvider";

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardLayout = lazy(() => import("./components/dashboard/DashboardLayout"));
const DialerPage = lazy(() => import("./pages/dashboard/DialerPage"));
const MessagesPage = lazy(() => import("./pages/dashboard/MessagesPage"));
const CallLogsPage = lazy(() => import("./pages/dashboard/CallLogsPage"));
const ContactsPage = lazy(() => import("./pages/dashboard/ContactsPage"));
const NumbersPage = lazy(() => import("./pages/dashboard/NumbersPage"));
const BillingPage = lazy(() => import("./pages/dashboard/BillingPage"));
const AnalyticsPage = lazy(() => import("./pages/dashboard/AnalyticsPage"));
const IntegrationsPage = lazy(() => import("./pages/dashboard/IntegrationsPage"));
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage"));

const queryClient = new QueryClient();
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your_google_client_id_here";

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" storageKey="vite-ui-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {GOOGLE_CLIENT_ID === "your_google_client_id_here" ? (
          <div className="flex items-center justify-center min-h-screen bg-amber-50 p-4 text-center">
            <div className="max-w-md p-6 bg-white rounded-2xl shadow-sm border border-amber-200">
              <h2 className="text-amber-800 font-bold mb-2">Configuration Required</h2>
              <p className="text-amber-700 text-sm">Please set <b>VITE_GOOGLE_CLIENT_ID</b> in your frontend .env file or update App.tsx with your Google Client ID.</p>
            </div>
          </div>
        ) : (
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route element={<ProtectedRoute />}>
                      <Route path="/dashboard" element={<DashboardLayout />}>
                        <Route index element={<DialerPage />} />
                        <Route path="messages" element={<MessagesPage />} />
                        <Route path="calls" element={<CallLogsPage />} />
                        <Route path="contacts" element={<ContactsPage />} />
                        <Route path="numbers" element={<NumbersPage />} />
                        <Route path="billing" element={<BillingPage />} />
                        <Route path="analytics" element={<AnalyticsPage />} />
                        <Route path="integrations" element={<IntegrationsPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                      </Route>
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </AuthProvider>
          </GoogleOAuthProvider>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
