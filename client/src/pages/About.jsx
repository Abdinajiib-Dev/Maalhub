import React from 'react';
import { Info, Target, Eye, CheckCircle2 } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Top / Hero Section - Top Aligned */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start mb-16">
        {/* Left Side Content */}
        <div className="pt-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-4 border border-primary/20">
            <span>Empowering Innovation & Capital</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">
            About <span className="text-primary">Maal</span><span className="text-secondary">Hub</span>
          </h1>

          <p className="text-xl sm:text-2xl font-bold text-gray-800 mb-5 leading-snug">
            Connecting Ideas With Opportunities.
          </p>

          <div className="space-y-4 text-base sm:text-lg text-gray-600 leading-relaxed mb-8">
            <p>
              MaalHub is a premier platform designed to bridge the gap between visionaries and capital. We empower ambitious entrepreneurs to showcase their business projects while giving investors direct access to vetted, high-potential opportunities.
            </p>
            <p className="text-gray-600 text-base">
              By removing traditional barriers to funding and communication, MaalHub fosters transparent partnerships, enabling innovative ideas to scale efficiently into thriving, sustainable businesses.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 text-sm font-medium text-gray-700">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              <span>Direct Founder-Investor Connect</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm font-medium text-gray-700">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              <span>Transparent Funding Proposals</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm font-medium text-gray-700">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              <span>Tailored Category Discovery</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm font-medium text-gray-700">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              <span>Secure & Verified Platform</span>
            </div>
          </div>
        </div>

        {/* Right Side Image */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100 group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
          <img 
            src="/about-hero.jpg" 
            alt="Entrepreneur and Investor Business Meeting" 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 min-h-[380px] max-h-[500px]" 
          />
        </div>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* About Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
            <Info className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Who We Are</h2>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            MaalHub connects investors with entrepreneurs, startups, and people with new business ideas. Entrepreneurs can submit projects and request funding, while investors can discover, filter, and submit investment requests for projects that match their goals.
          </p>
        </div>

        {/* Mission Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
            <Target className="h-6 w-6 text-secondary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            We aim to democratize access to capital by creating a transparent, secure, and intuitive platform where innovative ideas can find the financial backing they need to succeed and scale efficiently.
          </p>
        </div>

        {/* Vision Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
            <Eye className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
            To become the premier global ecosystem where every viable business idea can seamlessly discover the right investment, fostering a thriving environment of growth, innovation, and mutual success.
          </p>
        </div>

      </div>
    </div>
  );
};

export default About;
