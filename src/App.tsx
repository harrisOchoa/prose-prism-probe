
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import View from "./pages/View";
import { Stage } from "./components/AssessmentManager";
import { pathToStage, stageToPath } from "./hooks/assessment/useStageManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/info" element={<Index />} />
            <Route path="/intro" element={<Index />} />
            <Route path="/generating-prompts" element={<Index />} />
            <Route path="/select-prompts" element={<Index />} />
            <Route path="/aptitude" element={<Index />} />
            <Route path="/writing" element={<Index />} />
            <Route path="/complete" element={<Index />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/view/:id" element={<View />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
