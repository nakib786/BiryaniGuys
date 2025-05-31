import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container-custom py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-display font-bold text-primary">
          Biryani Guys
        </Link>
        
        <nav className="flex space-x-6">
          <Link to="/" className="text-gray-700 hover:text-primary">
            Home
          </Link>
          <Link to="/track" className="text-gray-700 hover:text-primary">
            Live Tracking
          </Link>
          <a href="tel:+15555555555" className="text-gray-700 hover:text-primary">
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header; 