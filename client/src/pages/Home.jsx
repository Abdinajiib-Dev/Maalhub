import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, FolderKanban, Filter, TrendingUp, MessageSquare, BarChart3, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const features = [
  {
    icon: FolderKanban,
    title: 'Comprehensive Project Profiles',
    description: 'Entrepreneurs can showcase pitch details, funding goals, category classifications, and project updates in structured profiles.',
    bgColor: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    icon: Filter,
    title: 'Smart Search & Filtering',
    description: 'Investors can easily discover and filter projects by category, funding requirement, location, and investment status.',
    bgColor: 'bg-secondary/10',
    iconColor: 'text-secondary',
  },
  {
    icon: TrendingUp,
    title: 'Direct Investment Proposals',
    description: 'Seamless mechanism for investors to submit investment requests directly to project founders and track proposal statuses.',
    bgColor: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
  },
  {
    icon: MessageSquare,
    title: 'In-App Direct Messaging',
    description: 'Integrated real-time messaging enabling transparent communication and deal negotiations between founders and investors.',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-700',
  },
  {
    icon: BarChart3,
    title: 'Interactive Dashboards',
    description: 'Customized dashboards for entrepreneurs and investors to monitor project activity, bookmark favorites, and manage requests.',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-700',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Profiles & Security',
    description: 'Role-based authentication and secure data protection ensuring safe, trustworthy interactions across the platform.',
  },
];

const Home = () => {
  const { user, profile } = useAuth();

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/60 via-background to-background pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-multiply" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">
            {/* Left side */}
            <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5">
                <span className="block text-text mb-2">Where Ideas</span>
                <span className="block text-primary">Find Investment.</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                MaalHub connects entrepreneurs with investors to turn promising ideas into real opportunities and growing businesses.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                {user && profile?.role === 'entrepreneur' ? (
                  <>
                    <Link to="/entrepreneur/create-project" className="inline-flex justify-center items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-[#7a5338] transition-colors shadow-lg hover:shadow-xl group text-base">
                      Submit Your Project
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/entrepreneur/dashboard" className="inline-flex justify-center items-center px-6 py-3 border-2 border-text text-text font-medium rounded-lg hover:bg-gray-100 transition-colors text-base">
                      My Dashboard
                    </Link>
                  </>
                ) : user && profile?.role === 'investor' ? (
                  <>
                    <Link to="/projects" className="inline-flex justify-center items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-[#7a5338] transition-colors shadow-lg hover:shadow-xl group text-base">
                      Explore Projects
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/investor/dashboard" className="inline-flex justify-center items-center px-6 py-3 border-2 border-text text-text font-medium rounded-lg hover:bg-gray-100 transition-colors text-base">
                      My Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/projects" className="inline-flex justify-center items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-[#7a5338] transition-colors shadow-lg hover:shadow-xl group text-base">
                      Explore Projects
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/register" className="inline-flex justify-center items-center px-6 py-3 border-2 border-text text-text font-medium rounded-lg hover:bg-gray-100 transition-colors text-base">
                      Submit Your Project
                    </Link>
                  </>
                )}
              </div>

              <div className="flex items-start sm:items-center justify-center lg:justify-start space-x-3 text-gray-500">
                <div className="flex-shrink-0 p-2 bg-white rounded-full shadow-sm border border-gray-100">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-left text-gray-600 leading-snug">
                  Trusted platform. Real opportunities.<br className="hidden sm:block" /> Stronger future together.
                </p>
              </div>
            </div>

            {/* Right side - Image */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none flex justify-center items-center mt-10 lg:mt-0">
              <div className="relative w-full aspect-square md:aspect-auto">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-90 -z-10" />
                <img 
                  src="/hero.jpeg" 
                  alt="MaalHub Platform Illustration" 
                  className="w-full h-auto object-cover rounded-2xl drop-shadow-2xl animate-fade-in"
                  style={{ maxHeight: '450px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Introduction */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">What is MaalHub?</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-600 mb-6">
                MaalHub is a platform that bridges the gap between visionaries and capital. We empower entrepreneurs to present their projects and connect them directly with investors seeking fresh opportunities.
              </p>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Entrepreneurs can request funding and manage activities.
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Investors can discover, filter, and save projects.
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  Direct and secure communication between both parties.
                </li>
              </ul>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100 group">
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/0 transition-colors z-10 pointer-events-none" />
              <img 
                src="/inv and ent.jpeg" 
                alt="MaalHub Platform Features Illustration" 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Project Features */}
      <section className="py-20 bg-background border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Project Features</h2>
            <p className="text-lg text-gray-600">
              Powerful tools and capabilities designed to empower entrepreneurs and streamline investment opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor || 'bg-amber-100'} flex items-center justify-center ${feature.iconColor || 'text-amber-700'} mb-6 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-2 gap-16">
            
            {/* For Entrepreneurs */}
            <div>
              <h3 className="text-2xl font-semibold mb-8 text-primary border-b-2 border-primary inline-block pb-2">For Entrepreneurs</h3>
              <div className="space-y-8">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white font-bold text-xl">1</div>
                  <div className="ml-4">
                    <h4 className="text-xl font-medium">Create an account</h4>
                    <p className="text-gray-600 mt-1">Sign up and complete your business profile.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white font-bold text-xl">2</div>
                  <div className="ml-4">
                    <h4 className="text-xl font-medium">Submit your project</h4>
                    <p className="text-gray-600 mt-1">Detail your business, goals, and funding needs.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary text-white font-bold text-xl">3</div>
                  <div className="ml-4">
                    <h4 className="text-xl font-medium">Receive investment</h4>
                    <p className="text-gray-600 mt-1">Manage requests and communicate with investors.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Investors */}
            <div>
              <h3 className="text-2xl font-semibold mb-8 text-secondary border-b-2 border-secondary inline-block pb-2">For Investors</h3>
              <div className="space-y-8">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-secondary text-white font-bold text-xl">1</div>
                  <div className="ml-4">
                    <h4 className="text-xl font-medium">Create an account</h4>
                    <p className="text-gray-600 mt-1">Set your preferences and investment interests.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-secondary text-white font-bold text-xl">2</div>
                  <div className="ml-4">
                    <h4 className="text-xl font-medium">Browse projects</h4>
                    <p className="text-gray-600 mt-1">Discover and filter opportunities that match your criteria.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-secondary text-white font-bold text-xl">3</div>
                  <div className="ml-4">
                    <h4 className="text-xl font-medium">Connect & Invest</h4>
                    <p className="text-gray-600 mt-1">Contact entrepreneurs and submit investment requests.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to find your next big opportunity?</h2>
          <p className="text-xl mb-10 text-white/90">Join MaalHub today and be part of the future of business.</p>
          <Link to="/register" className="bg-white text-primary px-8 py-3 rounded-md text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
            Join MaalHub
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;

