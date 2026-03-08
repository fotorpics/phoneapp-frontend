import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DialerPage from "./pages/dashboard/DialerPage";
import MessagesPage from "./pages/dashboard/MessagesPage";
import CallLogsPage from "./pages/dashboard/CallLogsPage";
import ContactsPage from "./pages/dashboard/ContactsPage";
import NumbersPage from "./pages/dashboard/NumbersPage";
import BillingPage from "./pages/dashboard/BillingPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage";
import IntegrationsPage from "./pages/dashboard/IntegrationsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import { AuthProvider } from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";

import { ThemeProvider } from "./components/ThemeProvider";

const queryClient = new QueryClient();
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your_google_client_id_here";

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
              </BrowserRouter>
            </AuthProvider>
          </GoogleOAuthProvider>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
