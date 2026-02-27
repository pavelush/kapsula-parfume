import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainSite from './pages/main/MainSite';
import AdminApp from './pages/admin/AdminApp';

function App() {
  return (
    <Routes>
      <Route path="/*" element={<MainSite />} />
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  );
}

export default App;
