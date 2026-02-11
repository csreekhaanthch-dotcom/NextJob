import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-gray-600">
            © {new Date().getFullYear()} JobHub - Zero-cost job board aggregator
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