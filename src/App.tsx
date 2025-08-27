import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PropertyPage from "./pages/PropertyPage";
import PropertyDetailedPage from "./pages/PropertyDetailedPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";
import LogInPage from "../src/pages/LogInPage";
import Dashboard from "../src/pages/Dashboard";
import AddProperty from "../src/components/AddProperty";
import EditProperty from "../src/components/EditProperty";
import ManageImages from "../src/components/ManageImages";
import PrivateRoute from "./PrivateRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/Property" element={<PropertyPage />} />
          <Route
            path="/properties/:title/:id"
            element={<PropertyDetailedPage />}
          />
          <Route path="/contact-us" element={<ContactPage />} />
          <Route path="/login" element={<LogInPage />} /> 

          {/* Private */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-property"
            element={
              <PrivateRoute>
                <AddProperty />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-property/:id"
            element={
              <PrivateRoute>
                <EditProperty />
              </PrivateRoute>
            }
          />
          <Route
            path="/manage-images/:id"
            element={
              <PrivateRoute>
                <ManageImages />
              </PrivateRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
