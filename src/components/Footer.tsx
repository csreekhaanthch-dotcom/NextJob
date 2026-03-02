import React from 'react';
import { Sparkles, Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-75"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-2">NextJob</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">The zero-cost job board aggregator that helps you find your next career opportunity.</p>
            <a href="https://github.com/csreekhaanthch-dotcom/NextJob" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
              <Github className="h-5 w-5" />
            </a>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/jobs" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Browse Jobs</a></li>
              <li><a href="/jobs?search=remote" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Remote Jobs</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Popular Searches</h3>
            <ul className="space-y-2">
              <li><a href="/jobs?search=frontend" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Frontend Developer</a></li>
              <li><a href="/jobs?search=backend" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Backend Developer</a></li>
              <li><a href="/jobs?search=full+stack" className="text-gray-600 dark:text-gray-400 hover:text-blue-600">Full Stack Developer</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} NextJob - Zero-cost job board aggregator.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;