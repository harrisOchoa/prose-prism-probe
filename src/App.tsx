
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

// Use lazy loading for components to improve performance
const Index = lazy(() => import("./pages/Index"));
const Admin = lazy(() => import("./pages/Admin"));
const View = lazy(() => import("./pages/View"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const About = lazy(() => import("./pages/About"));

// Loading component for suspense fallback
const LoadingPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
    <span className="ml-3 text-lg">Loading...</span>
  </div>
);

function App() {
  console.log("App component rendering");
  
  return (
    <Router>
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="about" element={<About />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="404" element={<NotFound />} />
            <Route path="view/:id" element={<View />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
          {/* Admin routes are handled separately to have their own layout */}
          <Route path="admin/*" element={<Admin />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
