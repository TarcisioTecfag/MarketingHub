import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import DashboardHome from "@/pages/DashboardHome";
import ConnectionPage from "@/pages/whatsapp/ConnectionPage";
import BirthdaysPage from "@/pages/whatsapp/BirthdaysPage";
import SeasonalPage from "@/pages/whatsapp/SeasonalPage";
import NotFound from "@/pages/NotFound";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/layout/PageTransition";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><DashboardHome /></PageTransition>} />
        <Route path="/whatsapp/conexao" element={<PageTransition><ConnectionPage /></PageTransition>} />
        <Route path="/whatsapp/aniversariantes" element={<PageTransition><BirthdaysPage /></PageTransition>} />
        <Route path="/whatsapp/sazonais" element={<PageTransition><SeasonalPage /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DashboardLayout>
          <AppRoutes />
        </DashboardLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
