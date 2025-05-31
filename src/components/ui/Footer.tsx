import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white mt-20">
      <div className="container-custom py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Biryani Guys</h3>
            <p className="text-gray-300">
              Authentic biryani delivered straight to your door. 
              Experience the rich flavors of our traditional recipes.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Hours</h3>
            <ul className="text-gray-300">
              <li className="mb-2">Monday - Friday: 11am - 9pm</li>
              <li className="mb-2">Saturday: 12pm - 10pm</li>
              <li>Sunday: 12pm - 8pm</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <ul className="text-gray-300">
              <li className="mb-2">
                <a href="tel:+15555555555" className="hover:text-primary">
                  (555) 555-5555
                </a>
              </li>
              <li className="mb-2">
                <a href="mailto:info@biryaniguys.com" className="hover:text-primary">
                  info@biryaniguys.com
                </a>
              </li>
              <li>
                123 Spice Street, Flavortown, FL
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          &copy; {year} Biryani Guys. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer; 