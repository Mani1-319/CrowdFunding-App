import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Launch from './pages/Launch';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CampaignList from './pages/CampaignList';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetail from './pages/CampaignDetail';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import Help from './pages/Help';
import AdminLogin from './pages/AdminLogin';
import Welcome from './pages/Welcome';

import { useNavigate, useLocation } from 'react-router-dom';

const AppInitializer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    // This runs once when the app actually hard-mounts (first visit or a browser refresh)
    const hasJustReloaded = sessionStorage.getItem('just_reloaded');
    
    // Clear the launch flag so the animation plays again
    sessionStorage.removeItem('donte_launch_seen');

    // Force navigation back to the launch screen
    if (location.pathname !== '/') {
      navigate('/');
    }
  }, []);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppInitializer />
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              style: { background: '#334155', color: '#f8fafc' },
            },
            error: {
              style: { background: '#1e293b', color: '#f8fafc' },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Launch />} />
          <Route element={<MainLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/campaigns" element={<CampaignList />} />
            <Route path="/campaigns/:id" element={<CampaignDetail />} />
            <Route path="/create-campaign" element={<CreateCampaign />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<Help />} />
            <Route path="/welcome" element={<Welcome />} />
          </Route>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin-login" element={<AdminLogin />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
