import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import SharedTrip from "./pages/SharedTrip";
import Policies from "./pages/Policies";
import NotFound from "./pages/NotFound";
import MapTest from "./pages/__MapTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shared/:shareId" element={<SharedTrip />} />
              <Route path="/privacy" element={<Policies kind="privacy" />} />
              <Route path="/terms" element={<Policies kind="terms" />} />
              <Route path="/refund" element={<Policies kind="refund" />} />
              <Route path="/cookies" element={<Policies kind="cookies" />} />
              <Route path="/about" element={<Policies kind="about" />} />
              <Route path="/contact" element={<Policies kind="contact" />} />
              <Route path="/__maptest" element={<MapTest />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
