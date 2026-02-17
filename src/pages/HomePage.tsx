import React from 'react';
import { Search, Globe, Users, Clock, Sparkles, Briefcase, TrendingUp, Award, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-75"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Find Your Dream Job
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            NextJob aggregates public job listings from top companies into one simple, beautiful search interface
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/jobs" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300"
            >
              <Search className="mr-2 h-5 w-5" />
              Browse Jobs
            </Link>
            
            <Link 
              to="/jobs" 
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-medium rounded-xl border border-blue-200 hover:bg-blue-50 transition-all shadow-sm"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              How It Works
            </Link>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Why Choose NextJob?
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            We make job hunting effortless with powerful features designed for your success
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition-all hover:shadow-xl hover:border-blue-200">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Wide Coverage</h3>
              <p className="text-gray-600">
                We aggregate jobs from top platforms including Lever, Greenhouse, Ashby, and YC Jobs
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition-all hover:shadow-xl hover:border-green-200">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-gray-600">
                Our scraper runs regularly to ensure you always see the latest job postings
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition-all hover:shadow-xl hover:border-purple-200">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Search</h3>
              <p className="text-gray-600">
                Find your perfect job with our intuitive search and filtering capabilities
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">1000+</div>
              <div className="text-gray-600">Jobs Collected</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-1">500+</div>
              <div className="text-gray-600">Companies</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">50+</div>
              <div className="text-gray-600">Job Boards</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">24/7</div>
              <div className="text-gray-600">Scraping</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            How NextJob Works
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Get hired faster with our streamlined job search process
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Search Jobs</h3>
              <p className="text-gray-600">
                Browse through thousands of job listings from top companies
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Matches</h3>
              <p className="text-gray-600">
                Discover positions that align with your skills and experience
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Hired</h3>
              <p className="text-gray-600">
                Apply directly and track your applications in one place
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Final CTA */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-12 text-center text-white max-w-4xl mx-auto shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Next Opportunity?</h2>
          <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
            Join thousands of job seekers who use NextJob to find their dream job
          </p>
          <Link 
            to="/jobs" 
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-medium rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Start Searching Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;