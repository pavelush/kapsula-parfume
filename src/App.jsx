import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainSite from './pages/main/MainSite';
import AdminApp from './pages/admin/AdminApp';
import PrivacyPolicyPage from './pages/main/PrivacyPolicyPage';

function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/*" element={<MainSite />} />
    </Routes>
  );
}

export default App;
