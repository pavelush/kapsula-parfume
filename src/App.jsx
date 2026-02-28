import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainSite from './pages/main/MainSite';
import AdminApp from './pages/admin/AdminApp';
import PrivacyPolicyPage from './pages/main/PrivacyPolicyPage';

function App() {
  useEffect(() => {
    const fetchSeoSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          const settingsMap = {};
          data.forEach(item => {
            settingsMap[item.setting_key] = item.setting_value;
          });

          // Set Title
          if (settingsMap.seo_title) {
            document.title = settingsMap.seo_title;
          }

          // Set Description
          if (settingsMap.seo_description) {
            let metaDescription = document.querySelector('meta[name="description"]');
            if (!metaDescription) {
              metaDescription = document.createElement('meta');
              metaDescription.name = "description";
              document.head.appendChild(metaDescription);
            }
            metaDescription.content = settingsMap.seo_description;
          }

          // Inject Yandex Metrika (or other tracking code)
          if (settingsMap.yandex_metrika_code && !window.metrikaInjected) {
            window.metrikaInjected = true; // Prevent multiple injections

            // We use a safe approach by creating a wrapper div and extracting script tags
            // or simply injecting the raw HTML if it's safe (admin controls it).
            // A more robust way for raw HTML snippets (like counters) is to use Range.createContextualFragment
            const fragment = document.createRange().createContextualFragment(settingsMap.yandex_metrika_code);
            document.head.appendChild(fragment);
          }
        }
      } catch (error) {
        console.error('Failed to load SEO settings:', error);
      }
    };

    fetchSeoSettings();
  }, []);

  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/*" element={<MainSite />} />
    </Routes>
  );
}

export default App;
