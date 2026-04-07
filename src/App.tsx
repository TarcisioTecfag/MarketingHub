import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import DashboardHome from "@/pages/DashboardHome";
import ConnectionPage from "@/pages/whatsapp/ConnectionPage";
import BirthdaysPage from "@/pages/whatsapp/BirthdaysPage";
import SeasonalPage from "@/pages/whatsapp/SeasonalPage";
import CalendarPage from "@/pages/whatsapp/CalendarPage";
import UsersPage from "@/pages/settings/UsersPage";
import LoginPage from "@/pages/auth/LoginPage";
import NotFound from "@/pages/NotFound";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/layout/PageTransition";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

const DashboardRoutes = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<PageTransition><DashboardHome /></PageTransition>} />
        <Route path="/whatsapp/conexao" element={<PageTransition><ConnectionPage /></PageTransition>} />
        <Route path="/whatsapp/aniversariantes" element={<PageTransition><BirthdaysPage /></PageTransition>} />
        <Route path="/whatsapp/sazonais" element={<PageTransition><SeasonalPage /></PageTransition>} />
        <Route path="/whatsapp/calendario" element={<PageTransition><CalendarPage /></PageTransition>} />
        <Route path="/configuracoes/usuarios" element={<PageTransition><UsersPage /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </DashboardLayout>
  );
};

const AppRoutes = () => {
  const location = useLocation();
  // We use key on AnimatePresence to allow smooth transitions, but keep it high level
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname.split('/')[1] || '/'}>
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/*" element={<ProtectedRoute><DashboardRoutes /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
