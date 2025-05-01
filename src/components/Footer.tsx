
import React from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-muted py-8 border-t border-border mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and company info */}
          <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-hirescribe-primary to-hirescribe-accent">
              HireScribe
            </h2>
            <p className="text-sm text-muted-foreground">
              Intelligent assessment platform designed to evaluate candidates fairly and comprehensively.
            </p>
          </div>
          
          {/* Quick links */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <div className="flex flex-col space-y-2">
              <Link to="/" className="text-sm hover:text-hirescribe-primary transition-colors">
                Home
              </Link>
              <Link to="/#about" className="text-sm hover:text-hirescribe-primary transition-colors">
                About
              </Link>
            </div>
          </div>
          
          {/* Legal */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-semibold">Legal</h3>
            <div className="flex flex-col space-y-2">
              <Link to="/privacy" className="text-sm hover:text-hirescribe-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm hover:text-hirescribe-primary transition-colors">
                Terms of Service
              </Link>
              <a href="mailto:harrisdochoa@gmail.com" className="text-sm hover:text-hirescribe-primary transition-colors flex items-center">
                <Mail className="h-4 w-4 mr-1" /> Contact Us
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-6 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            © {currentYear} HireScribe. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-hirescribe-primary" aria-label="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-hirescribe-primary" aria-label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
