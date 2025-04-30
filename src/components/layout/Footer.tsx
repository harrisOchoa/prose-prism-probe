
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";

const Footer = () => {
  const isMobile = useIsMobile();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-white dark:bg-gray-900 py-4 px-4 mt-auto">
      <div className="container mx-auto">
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-row'} justify-between items-center`}>
          <div className="flex items-center">
            <span className="text-sm text-gray-500">
              &copy; {currentYear} HireScribe. All rights reserved.
            </span>
          </div>
          
          <div className="flex gap-4">
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-hirescribe-primary">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-gray-500 hover:text-hirescribe-primary">
              Terms
            </Link>
            <Link to="/faq" className="text-sm text-gray-500 hover:text-hirescribe-primary">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
