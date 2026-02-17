import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import JobsPage from './pages/JobsPage';
import Header from './components/Header';
import Footer from './components/Footer';
import HealthCheck from './components/HealthCheck';

const App: React.FC = () => {
  return (
    <Router future={{ v7_startTransition: true }}>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <main className="flex-grow">
          <HealthCheck />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;