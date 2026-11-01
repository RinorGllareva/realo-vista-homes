import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatedRealoLogo, HomeIntroOverlay } from "@/components/RealoLoader";
import ScrollManager from "@/components/ScrollManager";
import HomePage from "./pages/HomePage";
import PropertyPage from "./pages/PropertyPage";
import PrivateRoute from "./PrivateRoute";

// Public pages that are not the landing page, and the whole admin area, load on demand so
// visitors don't download charts, the 360° viewer and admin forms up front.
const PropertyDetailedPage = lazy(() => import("./pages/PropertyDetailedPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LogInPage = lazy(() => import("./pages/LogInPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AddProperty = lazy(() => import("./components/AddProperty"));
const EditProperty = lazy(() => import("./components/EditProperty"));
const ManageImages = lazy(() => import("./components/ManageImages"));
const ManageTour = lazy(() => import("./components/ManageTour"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

const PageFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#06130f]">
    <AnimatedRealoLogo sizeClassName="h-16 w-16" glow={false} />
  </div>
);

const AppRoutes = () => (
  <>
    <HomeIntroOverlay />
    <ScrollManager />
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/Property" element={<PropertyPage />} />
        <Route path="/properties/:title/:id" element={<PropertyDetailedPage />} />
        <Route path="/te-preferuarat" element={<FavoritesPage />} />
        <Route path="/contact-us" element={<ContactPage />} />
        <Route path="/login" element={<LogInPage />} />

        {/* Private */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/add-property" element={<PrivateRoute><AddProperty /></PrivateRoute>} />
        <Route path="/edit-property/:id" element={<PrivateRoute><EditProperty /></PrivateRoute>} />
        <Route path="/manage-images/:id" element={<PrivateRoute><ManageImages /></PrivateRoute>} />
        <Route path="/manage-tour/:id" element={<PrivateRoute><ManageTour /></PrivateRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
