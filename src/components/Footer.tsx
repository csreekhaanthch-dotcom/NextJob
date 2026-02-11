import React from 'react';
import { Sparkles } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="backdrop-blur-lg bg-white/30 border-t border-white/20 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NextJob
            </h2>
          </div>
          <p className="text-gray-600">
            © {new Date().getFullYear()} NextJob - Zero-cost job board aggregator
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Scraping public job boards to help you find your next opportunity
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;