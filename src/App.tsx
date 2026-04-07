import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import DashboardHome from "@/pages/DashboardHome";
import ConnectionPage from "@/pages/whatsapp/ConnectionPage";
import BirthdaysPage from "@/pages/whatsapp/BirthdaysPage";
import SeasonalPage from "@/pages/whatsapp/SeasonalPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/whatsapp/conexao" element={<ConnectionPage />} />
            <Route path="/whatsapp/aniversariantes" element={<BirthdaysPage />} />
            <Route path="/whatsapp/sazonais" element={<SeasonalPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DashboardLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
