import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import EnhancedPatients from "./pages/EnhancedPatients";
import EnhancedExpenses from "./pages/EnhancedExpenses";
import Billing from "./pages/Billing";
import EnhancedInventory from "./pages/EnhancedInventory";
import PatientSearchReports from "./pages/PatientSearchReports";
import PatientReport from "./pages/PatientReport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<EnhancedPatients />} />
          <Route path="/expenses" element={<EnhancedExpenses />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/inventory" element={<EnhancedInventory />} />
          <Route path="/reports" element={<PatientSearchReports />} />
          <Route path="/reports/patient/:patientId" element={<PatientReport />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
