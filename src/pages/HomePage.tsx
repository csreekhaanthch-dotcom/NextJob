import React from 'react';
import { Search, Globe, Users, Clock, Sparkles, Briefcase, TrendingUp, Award, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
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
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">Find Your Dream Job</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">NextJob aggregates public job listings from top companies into one simple, beautiful search interface</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/jobs" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300">
              <Search className="mr-2 h-5 w-5" />Browse Jobs
            </Link>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">Why Choose NextJob?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Wide Coverage</h3>
              <p className="text-gray-600 dark:text-gray-300">We aggregate jobs from top platforms including Lever, Greenhouse, and more</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Real-time Updates</h3>
              <p className="text-gray-600 dark:text-gray-300">Our scraper runs regularly to ensure you always see the latest job postings</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Easy Search</h3>
              <p className="text-gray-600 dark:text-gray-300">Find your perfect job with our intuitive search and filtering capabilities</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-12 text-center text-white max-w-4xl mx-auto shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Next Opportunity?</h2>
          <Link to="/jobs" className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-medium rounded-xl hover:bg-gray-100 transition-all mt-6">
            <Sparkles className="mr-2 h-5 w-5" />Start Searching Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;