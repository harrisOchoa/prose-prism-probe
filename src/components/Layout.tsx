
import React from "react";
import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 md:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
