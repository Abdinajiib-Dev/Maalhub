import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-secondary text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-4 group w-fit">
              <div className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shadow-md border-2 border-white/20">
                <img src="/Maalhub2.jpg" alt="MaalHub Logo" className="h-full w-full object-cover scale-125" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Maal<span className="text-white/80">Hub</span>
              </span>
            </Link>
            <p className="text-gray-100 text-sm max-w-md">
              Connecting promising businesses and innovative ideas with investors looking for their next opportunity.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-200 hover:text-white transition-colors text-sm">Home</Link></li>
              <li><Link to="/projects" className="text-gray-200 hover:text-white transition-colors text-sm">Projects</Link></li>
              <li><Link to="/about" className="text-gray-200 hover:text-white transition-colors text-sm">About</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-gray-200 hover:text-white transition-colors text-sm">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-gray-200 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/contact" className="text-gray-200 hover:text-white transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/20 pt-8 flex flex-col justify-center items-center">
          <p className="text-gray-200 text-sm text-center">
            &copy; {new Date().getFullYear()} MaalHub. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4">
            {/* Social links can go here */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
