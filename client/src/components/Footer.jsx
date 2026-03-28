import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-200/50 bg-white/75 backdrop-blur-md shadow-[0_-1px_0_0_rgba(15,23,42,0.06)]">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6 md:order-2">
            <Link to="/contact" className="text-gray-400 hover:text-gray-500 text-sm font-medium">
              Contact Us
            </Link>
            <Link to="/help" className="text-gray-400 hover:text-gray-500 text-sm font-medium">
              Help Center
            </Link>
            <Link to="/admin-login" className="text-gray-400 hover:text-slate-600 text-sm font-medium transition-colors">
              Admin Portal
            </Link>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center md:text-left text-sm text-gray-400 font-medium">
              &copy; {new Date().getFullYear()} Donte Crowdfunding. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
