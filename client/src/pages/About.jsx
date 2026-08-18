import React from 'react';
import { Info, Target, Eye } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Top / Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            About <span className="text-primary">Maal</span><span className="text-secondary">Hub</span>
          </h1>
          <p className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 leading-snug">
            Connecting Ideas With Opportunities.
          </p>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
            MaalHub is a platform that connects entrepreneurs with investors to help innovative ideas grow into successful businesses.
          </p>
        </div>
        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100 group">
          <img 
            src="/about-hero.jpg" 
            alt="Entrepreneur and Investor Business Meeting" 
            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 max-h-[440px]" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* About Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
            <Info className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Who We Are</h2>
          <p className="text-gray-600 leading-relaxed">
            MaalHub connects investors with entrepreneurs, startups, and people with new business ideas. Entrepreneurs can submit projects and request funding, while investors can discover, filter, and submit investment requests for projects that match their goals.
          </p>
        </div>

        {/* Mission Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
            <Target className="h-6 w-6 text-secondary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            We aim to democratize access to capital by creating a transparent, secure, and intuitive platform where innovative ideas can find the financial backing they need to succeed and scale efficiently.
          </p>
        </div>

        {/* Vision Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
            <Eye className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
          <p className="text-gray-600 leading-relaxed">
            To become the premier global ecosystem where every viable business idea can seamlessly discover the right investment, fostering a thriving environment of growth, innovation, and mutual success.
          </p>
        </div>

      </div>
    </div>
  );
};

export default About;
