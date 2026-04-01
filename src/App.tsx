import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import Dashboard from "./pages/user/Dashboard";
import SettingsPage from "./pages/user/SettingsPage";
import NotFound from "./pages/user/NotFound";
import LoginSeller from "./pages/seller/LoginSeller";
import HandlerListings from "./pages/seller/HandlerListings";
import CreateListings from "./pages/seller/CreateListings";
import DemandDashboard from "./pages/seller/DemandDashboard";
import Explore from "./pages/user/Explore";
import { HandlerProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/seller/login" element={<LoginSeller />} />
          
          {/* Handler Protected Routes */}
          <Route element={<HandlerProtectedRoute />}>
            <Route path="/handler/listings" element={<HandlerListings />} />
            <Route path="/handler/listings/new" element={<CreateListings />} />
            <Route path="/handler/listings/:id/demand" element={<DemandDashboard />} />          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
