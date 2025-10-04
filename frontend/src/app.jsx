import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from './components/layout/Mainlayout';
import LandingPage from './pages/landingpage';
import Dashboard from './pages/dashboard';
import Screener from './pages/screener';
import ScreenerResults from './pages/screenerresults';
import Interview from './pages/interview';
import NotFound from './pages/notfound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route element={<MainLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="screener" element={<Screener />} />
          <Route path="screener-results" element={<ScreenerResults />} />
          <Route path="interview" element={<Interview />} />
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;